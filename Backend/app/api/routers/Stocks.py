import random

from fastapi import APIRouter, Depends, HTTPException, Path, Query, Request
from sqlalchemy import Subquery, func, select
from sqlalchemy.orm import Session

from app.core import market_data
from app.core.rate_limit import limiter
from app.core.sampling import random_company_ids
from app.database import get_db
from app.models.Company.Company import CompanyTable
from app.models.Responses import PriceHistory, StockRow, TickerItem, TickerResponse
from app.models.Stocks.Stocks import StocksTable
from app.settings import settings

router = APIRouter()

# Tickers are letters, digits, "." or "-" (e.g. BRK.B); the code also ends up in provider URLs
StockCode = Path(pattern=r"^[A-Za-z0-9.\-]{1,10}$", description="Ticker, e.g. AAPL")

PROVIDER_ERRORS = {
    422: {"description": "The provider rejected the ticker"},
    502: {"description": "The provider is unavailable"},
}


def latest_closes(*filters) -> Subquery:
    """Every close with the previous one beside it (LAG), and rn = 1 on each company's latest close.

    One query replaces the old "latest close, then a query per company for the previous one".
    """
    by_company = {"partition_by": StocksTable.company_id}
    return (
        select(
            StocksTable.company_id,
            StocksTable.value,
            StocksTable.date,
            func.lag(StocksTable.value)
            .over(**by_company, order_by=(StocksTable.date, StocksTable.id))
            .label("previous_value"),
            func.row_number().over(**by_company, order_by=(StocksTable.date.desc(), StocksTable.id.desc())).label("rn"),
        )
        .where(*filters)
        .subquery()
    )


def _price_cell(value: float | None, currency: str) -> tuple[str, str]:
    # -1 is the loaders' "no value" marker
    shown = round(value, 2) if value is not None and value >= 0 else "-"
    return f"{shown}  ", currency


@router.get("", response_model=list[StockRow])
def stock_rows(
    offset: int = Query(0, ge=0),
    limit: int = Query(15, ge=1, le=500),
    session: Session = Depends(get_db),
):
    """Latest close of each company, highest all-time high first (markets table and heatmap)."""
    closes = latest_closes()
    rows = session.execute(
        select(
            CompanyTable.id,
            CompanyTable.code,
            CompanyTable.name,
            CompanyTable.color,
            CompanyTable.currency_name,
            CompanyTable.high_max,
            closes.c.value,
            closes.c.date,
            closes.c.previous_value,
        )
        .join(closes, closes.c.company_id == CompanyTable.id)
        .where(closes.c.rn == 1)
        # id last so pages never overlap when several companies tie
        .order_by(CompanyTable.high_max.desc(), closes.c.date.desc(), CompanyTable.id)
        .offset(offset)
        .limit(limit)
    ).all()

    result = []
    for row in rows:
        change = 0.0
        if row.previous_value and row.previous_value > 0 and row.value >= 0:
            change = round((row.value - row.previous_value) / row.previous_value, 2)
        currency = (row.currency_name or "").upper()
        result.append(
            StockRow(
                id=row.id,
                icon=row.code,
                stock_name=(row.name, row.code, row.color),
                unit=row.currency_name or "",
                price_last=_price_cell(row.value, currency),
                percentage=change,
                price_high=_price_cell(row.high_max, currency),
                last_update=row.date.strftime("%B %d, %Y"),
            )
        )
    return result


@router.get("/ticker", response_model=TickerResponse)
def ticker(limit: int = Query(24, ge=1, le=100), session: Session = Depends(get_db)):
    """Day change of up to `limit` random companies that have two valid closes."""
    # Sample extra companies: the ones without two valid closes are dropped
    ids = random_company_ids(session, limit * 2)
    if not ids:
        return TickerResponse(data=[])
    closes = latest_closes(StocksTable.company_id.in_(ids))
    rows = session.execute(
        select(CompanyTable.code, closes.c.value, closes.c.previous_value)
        .join(closes, closes.c.company_id == CompanyTable.id)
        .where(closes.c.rn == 1, closes.c.value > 0, closes.c.previous_value > 0)
    ).all()
    rows = random.sample(rows, min(limit, len(rows)))
    return TickerResponse(
        data=[
            TickerItem(code=row.code, discount=round((row.value - row.previous_value) / row.previous_value, 4))
            for row in rows
        ]
    )


@router.get("/{code}", response_model=PriceHistory, responses=PROVIDER_ERRORS)
@limiter.limit(settings.RATE_LIMIT_EXTERNAL)  # calls Alpaca / Polygon
def price_history(
    request: Request,
    code: str = StockCode,
    time_range: market_data.TimeRange = Query("1D", alias="range"),
):
    """Close prices for the range as {ISO timestamp: price}; null when no provider has data."""
    try:
        return market_data.price_history(code.upper(), time_range)
    except market_data.InvalidSymbolError:
        raise HTTPException(status_code=422, detail="Invalid stock symbol") from None


@router.get("/{code}/change", response_model=float | None, responses=PROVIDER_ERRORS)
@limiter.limit(settings.RATE_LIMIT_EXTERNAL)  # calls Alpaca
def daily_change(request: Request, code: str = StockCode):
    """Last close vs the previous one, as a ratio; null when there aren't two closes."""
    try:
        return market_data.daily_change(code.upper())
    except market_data.InvalidSymbolError:
        raise HTTPException(status_code=422, detail="Invalid stock symbol") from None


@router.get("/{code}/logo", response_model=str | None, responses=PROVIDER_ERRORS)
@limiter.limit(settings.RATE_LIMIT_EXTERNAL)  # calls API Ninjas
def company_logo(request: Request, code: str = StockCode):
    """Logo image URL; null when the provider has none."""
    try:
        return market_data.company_logo(code.upper())
    except market_data.ProviderUnavailableError:
        raise HTTPException(status_code=502, detail="Logo service unavailable") from None
