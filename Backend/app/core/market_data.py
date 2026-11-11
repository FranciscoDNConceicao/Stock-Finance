"""External market-data providers: Alpaca (prices), Polygon (price fallback) and API Ninjas (logos).

The clients are created once per process and reused across requests. Results are cached in
memory (MARKET_DATA_CACHE_TTL / LOGO_CACHE_TTL) because prices only move once a day in the
data we show and every call spends API quota.

These functions block (the Alpaca SDK is synchronous), so the routes that use them are plain
`def`: FastAPI runs those in its threadpool and the event loop stays free.
"""

import logging
from datetime import UTC, datetime, timedelta
from functools import lru_cache
from typing import Literal

import httpx
from alpaca_trade_api import REST, TimeFrame, TimeFrameUnit
from alpaca_trade_api.rest import APIError
from cachetools.func import ttl_cache

from app.settings import settings

logger = logging.getLogger(__name__)

TimeRange = Literal["1D", "1W", "1M", "3M", "1Y", "3Y"]

# range -> (Alpaca timeframe, Polygon "multiplier/timespan/", how far back to look)
TIME_RANGES: dict[str, tuple[TimeFrame, str, timedelta]] = {
    "1D": (TimeFrame.Hour, "1/hour/", timedelta(days=1)),
    "1W": (TimeFrame(12, TimeFrameUnit.Hour), "12/hour/", timedelta(weeks=1)),
    "1M": (TimeFrame.Day, "1/day/", timedelta(days=30)),
    "3M": (TimeFrame.Week, "1/week/", timedelta(days=60)),
    "1Y": (TimeFrame.Month, "1/month/", timedelta(weeks=54)),
    "3Y": (TimeFrame.Month, "1/month/", timedelta(weeks=54 * 3)),
}


class InvalidSymbolError(ValueError):
    """The provider rejected the ticker."""


class ProviderUnavailableError(RuntimeError):
    """The provider could not be reached or answered with an error."""


http_client = httpx.Client(timeout=10)


@lru_cache(maxsize=1)
def get_alpaca() -> REST:
    return REST(key_id=settings.APCA_API_KEY_ID, secret_key=settings.APCA_API_SECRET_KEY)


def close() -> None:
    http_client.close()


def _alpaca_closes(code: str, timeframe: TimeFrame, start: str, end: str) -> dict[str, float] | None:
    try:
        bars = get_alpaca().get_bars(code, timeframe, start, end, adjustment="raw").df
    except ValueError as exc:
        raise InvalidSymbolError(code) from exc
    except APIError as exc:
        logger.warning("Alpaca request failed", extra={"code": code, "error": str(exc)})
        return None
    if "close" not in bars:
        return None
    return {timestamp.isoformat(): close for timestamp, close in bars["close"].items()}


def _polygon_closes(code: str, polygon_timeframe: str, start: str, end: str) -> dict[str, float] | None:
    url = f"https://api.polygon.io/v2/aggs/ticker/{code}/range/{polygon_timeframe}{start}/{end}"
    try:
        response = http_client.get(url, params={"apiKey": settings.POLYGON_API_KEY})
        response.raise_for_status()
        results = response.json().get("results") or []
    except (httpx.HTTPError, ValueError) as exc:
        # The exception text includes the URL with the API key, so only the type is logged
        logger.warning("Polygon request failed", extra={"code": code, "error": type(exc).__name__})
        return None
    # Polygon gives each bar's start as epoch milliseconds in 't' and the close in 'c'
    return {datetime.fromtimestamp(bar["t"] / 1000, tz=UTC).isoformat(): bar["c"] for bar in results} or None


@ttl_cache(maxsize=2048, ttl=settings.MARKET_DATA_CACHE_TTL)
def price_history(code: str, time_range: TimeRange) -> dict[str, float] | None:
    """Close prices for the range, from Alpaca, or Polygon when Alpaca has none. None if neither has data."""
    timeframe, polygon_timeframe, lookback = TIME_RANGES[time_range]
    end_date = datetime.now() - timedelta(days=3)
    start_date = end_date - lookback
    start, end = start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d")

    closes = _alpaca_closes(code, timeframe, start, end)
    if closes is None:
        closes = _polygon_closes(code, polygon_timeframe, start, end)
    return closes


@ttl_cache(maxsize=2048, ttl=settings.MARKET_DATA_CACHE_TTL)
def daily_change(code: str) -> float | None:
    """Last close vs the one before, as a ratio (0.0123 = +1.23%). None when there aren't two closes."""
    # A week of daily bars, so weekends and holidays still leave two closes to compare
    end_date = datetime.now() - timedelta(days=1)
    start_date = end_date - timedelta(days=7)
    closes = _alpaca_closes(code, TimeFrame.Day, start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d"))
    values = list((closes or {}).values())
    if len(values) < 2 or values[-2] <= 0:
        return None
    previous, last = values[-2], values[-1]
    return round((last - previous) / previous, 4)


@ttl_cache(maxsize=2048, ttl=settings.LOGO_CACHE_TTL)
def company_logo(code: str) -> str | None:
    """Logo image URL from API Ninjas, or None when it has no logo for the ticker."""
    try:
        response = http_client.get(
            "https://api.api-ninjas.com/v1/logo",
            params={"ticker": code},
            headers={"X-Api-Key": settings.API_NINJA_KEY},
        )
        logos = response.json()
    except (httpx.HTTPError, ValueError) as exc:
        logger.warning("API Ninjas request failed", extra={"code": code, "error": type(exc).__name__})
        raise ProviderUnavailableError("Logo service unavailable") from exc

    # On errors (bad key, rate limit) API Ninjas returns a dict instead of a list
    if isinstance(logos, list) and logos and logos[0].get("image"):
        return logos[0]["image"]
    if not isinstance(logos, list):
        logger.warning("API Ninjas returned an error", extra={"code": code, "status": response.status_code})
    return None
