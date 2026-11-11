import json
import logging

import pandas as pd
import pytest

from app.core import market_data
from app.core.logging import JsonFormatter
from app.test.main_test import client, count_queries

ROW_KEYS = {"id", "icon", "stockName", "unit", "priceLast", "percentage", "priceHigh", "lastUpdate"}


def test_stock_rows():
    response = client.get("/stocks", params={"offset": 0, "limit": 10})
    assert response.status_code == 200
    first_page = response.json()
    assert len(first_page) == 10
    for row in first_page:
        assert row.keys() >= ROW_KEYS

    response = client.get("/stocks", params={"offset": 7, "limit": 5})
    assert response.status_code == 200
    # Pages overlap exactly where they should: rows are in a stable order
    assert [row["id"] for row in response.json()][:3] == [row["id"] for row in first_page[7:10]]

    assert client.get("/stocks", params={"offset": 100_000}).json() == []
    assert client.get("/stocks", params={"limit": 0}).status_code == 422


def test_stock_rows_run_one_query_whatever_the_page_size():
    for limit in (5, 50):
        with count_queries() as queries:
            assert client.get("/stocks", params={"limit": limit}).status_code == 200
        assert len(queries) == 1


def test_ticker():
    with count_queries() as queries:
        response = client.get("/stocks/ticker", params={"limit": 10})
    assert response.status_code == 200
    items = response.json()["data"]
    assert 0 < len(items) <= 10
    for item in items:
        assert isinstance(item["code"], str)
        assert isinstance(item["discount"], float)
    # The company ids come from the cache; one query for every company's last two closes
    assert len(queries) <= 2
    assert not any("random()" in statement for statement in queries)


@pytest.mark.parametrize("time_range", ["1D", "1W", "1M", "3M", "1Y", "3Y"])
def test_price_history(time_range):
    code = client.get("/companies/random", params={"limit": 1}).json()[0]["code"]

    response = client.get(f"/stocks/{code}", params={"range": time_range})
    assert response.status_code == 200
    body = response.json()
    assert body is None or all(isinstance(price, float) for price in body.values())


def test_price_history_validates_parameters():
    assert client.get("/stocks/AAPL", params={"range": "5Y"}).status_code == 422
    assert client.get("/stocks/AA$PL").status_code == 422


class FakeAlpaca:
    def __init__(self):
        self.calls = 0

    def get_bars(self, *args, **kwargs):
        self.calls += 1
        index = pd.to_datetime(["2024-06-03T04:00:00Z", "2024-06-04T04:00:00Z"])
        return type("Bars", (), {"df": pd.DataFrame({"close": [100.0, 102.0]}, index=index)})()


@pytest.fixture
def fake_alpaca(monkeypatch):
    fake = FakeAlpaca()
    monkeypatch.setattr(market_data, "get_alpaca", lambda: fake)
    market_data.price_history.cache_clear()
    market_data.daily_change.cache_clear()
    yield fake
    market_data.price_history.cache_clear()
    market_data.daily_change.cache_clear()


def test_market_data_is_cached(fake_alpaca):
    first = client.get("/stocks/ZZZT", params={"range": "1M"})
    second = client.get("/stocks/zzzt", params={"range": "1M"})
    assert first.status_code == second.status_code == 200
    assert (
        first.json()
        == second.json()
        == {
            "2024-06-03T04:00:00+00:00": 100.0,
            "2024-06-04T04:00:00+00:00": 102.0,
        }
    )
    assert fake_alpaca.calls == 1

    assert client.get("/stocks/ZZZT/change").json() == 0.02
    assert client.get("/stocks/ZZZT/change").json() == 0.02
    assert fake_alpaca.calls == 2


def test_logs_are_json():
    record = logging.LogRecord("app.requests", logging.INFO, __file__, 1, "request", None, None)
    record.path = "/stocks"
    record.status = 200
    line = json.loads(JsonFormatter().format(record))
    assert line["message"] == "request"
    assert line["level"] == "INFO"
    assert line["path"] == "/stocks"
    assert line["status"] == 200
