"""Auth, wallet, watchlist, search, /health and rate limiting.

Each test creates its own data (a fake company with two closes and fresh users)
and removes it afterwards, so it runs against any database, empty or not.
"""

import uuid
from datetime import date

import pytest

from app.core.rate_limit import limiter
from app.database import Base
from app.models.Company.Company import CompanyTable
from app.models.Stocks.Stocks import StocksTable
from app.models.User.User import UserTable
from app.test.main_test import TestingSessionLocal, client, engine

COMPANY_ID = 990001
COMPANY_CODE = "ZZTST"


@pytest.fixture(autouse=True)
def no_rate_limit():
    limiter.enabled = False
    yield
    limiter.enabled = True
    limiter.reset()


@pytest.fixture
def db():
    Base.metadata.create_all(engine)
    session = TestingSessionLocal()
    yield session
    session.rollback()
    session.query(UserTable).filter(UserTable.email.like("pytest-%@example.com")).delete(synchronize_session=False)
    session.query(CompanyTable).filter(CompanyTable.id == COMPANY_ID).delete()
    session.commit()
    session.close()


@pytest.fixture
def company(db):
    """Company whose last close (110) is 10% above the previous one (100)."""
    db.query(CompanyTable).filter(CompanyTable.id == COMPANY_ID).delete()
    db.add(
        CompanyTable(
            id=COMPANY_ID,
            code=COMPANY_CODE,
            name="Zz Pytest Holdings",
            currency_name="usd",
            color="123456",
            high_max=120.0,
        )
    )
    db.flush()
    db.add_all(
        [
            StocksTable(company_id=COMPANY_ID, value=100.0, date=date(2026, 1, 5)),
            StocksTable(company_id=COMPANY_ID, value=110.0, date=date(2026, 1, 6)),
        ]
    )
    db.commit()
    return COMPANY_ID


def register(password="correct-horse"):
    email = f"pytest-{uuid.uuid4().hex[:10]}@example.com"
    response = client.post("/auth/register", json={"email": email, "password": password})
    assert response.status_code == 201, response.text
    return email, {"Authorization": f"Bearer {response.json()['access_token']}"}


# ---------- Health ----------


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "ok"}


# ---------- Auth ----------


def test_register_login_and_me(db):
    email, headers = register()

    me = client.get("/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["email"] == email

    login = client.post("/auth/login", json={"email": email.upper(), "password": "correct-horse"})
    assert login.status_code == 200
    assert login.json()["token_type"] == "bearer"

    assert client.post("/auth/register", json={"email": email, "password": "another-pass"}).status_code == 409
    assert client.post("/auth/login", json={"email": email, "password": "wrong-pass"}).status_code == 401


def test_auth_validation_and_protection(db):
    assert client.post("/auth/register", json={"email": "not-an-email", "password": "long-enough"}).status_code == 422
    assert client.post("/auth/register", json={"email": "pytest-x@example.com", "password": "short"}).status_code == 422
    assert client.get("/auth/me").status_code == 401
    assert client.get("/wallet", headers={"Authorization": "Bearer nope"}).status_code == 401
    assert client.get("/watchlist").status_code == 401


# ---------- Wallet ----------


def test_wallet_buy_and_sell(company):
    _, headers = register()

    empty = client.get("/wallet", headers=headers).json()
    assert empty["cash"] == 10_000 and empty["balance"] == 10_000 and empty["positions"] == []

    bought = client.post(
        "/wallet/transactions", headers=headers, json={"company_id": company, "side": "buy", "quantity": 10}
    )
    assert bought.status_code == 201, bought.text
    wallet = bought.json()
    assert wallet["cash"] == 8_900  # 10 x 110
    assert wallet["holdings_value"] == 1_100
    assert wallet["balance"] == 10_000
    assert wallet["day_change"] == 100  # 10 x (110 - 100)
    assert wallet["total_change"] == 0
    [position] = wallet["positions"]
    assert position["code"] == COMPANY_CODE and position["quantity"] == 10 and position["avg_price"] == 110

    sold = client.post(
        "/wallet/transactions", headers=headers, json={"company_id": company, "side": "sell", "quantity": 4}
    ).json()
    assert sold["cash"] == 9_340
    assert sold["positions"][0]["quantity"] == 6
    assert sold["positions"][0]["avg_price"] == 110

    # Selling the rest closes the position
    closed = client.post(
        "/wallet/transactions", headers=headers, json={"company_id": company, "side": "sell", "quantity": 6}
    ).json()
    assert closed["positions"] == [] and closed["cash"] == 10_000

    history = client.get("/wallet/transactions", headers=headers).json()
    assert [tx["side"] for tx in history] == ["sell", "sell", "buy"]
    assert history[-1]["total"] == 1_100 and history[-1]["price_date"] == "2026-01-06"


def test_wallet_rejects_invalid_orders(company):
    _, headers = register()
    order = {"company_id": company, "side": "buy"}

    assert client.post("/wallet/transactions", headers=headers, json={**order, "quantity": 1000}).status_code == 400
    assert client.post("/wallet/transactions", headers=headers, json={**order, "quantity": 0}).status_code == 422
    assert (
        client.post("/wallet/transactions", headers=headers, json={**order, "side": "sell", "quantity": 1}).status_code
        == 400
    )
    assert (
        client.post(
            "/wallet/transactions", headers=headers, json={"company_id": -1, "side": "buy", "quantity": 1}
        ).status_code
        == 404
    )
    assert client.get("/wallet", headers=headers).json()["cash"] == 10_000


def test_wallets_are_private(company):
    _, alice = register()
    _, bob = register()
    client.post("/wallet/transactions", headers=alice, json={"company_id": company, "side": "buy", "quantity": 1})
    assert client.get("/wallet", headers=bob).json()["positions"] == []
    assert client.get("/wallet/transactions", headers=bob).json() == []


# ---------- Watchlist ----------


def test_watchlist(company):
    _, headers = register()

    added = client.post("/watchlist", headers=headers, json={"company_id": company})
    assert added.status_code == 201
    assert added.json()["code"] == COMPANY_CODE
    assert added.json()["last_price"] == 110 and added.json()["change"] == 0.1

    # Adding twice is idempotent
    assert client.post("/watchlist", headers=headers, json={"company_id": company}).status_code == 200
    assert len(client.get("/watchlist", headers=headers).json()) == 1

    assert client.post("/watchlist", headers=headers, json={"company_id": -1}).status_code == 404
    assert client.delete(f"/watchlist/{company}", headers=headers).status_code == 204
    assert client.delete(f"/watchlist/{company}", headers=headers).status_code == 404
    assert client.get("/watchlist", headers=headers).json() == []


# ---------- Search ----------


def test_search(company):
    by_code = client.get("/companies/search", params={"q": COMPANY_CODE.lower()}).json()
    assert by_code[0]["id"] == company

    by_name = client.get("/companies/search", params={"q": "pytest hold"}).json()
    assert company in [row["id"] for row in by_name]

    # LIKE wildcards are matched literally, not as "anything"
    assert client.get("/companies/search", params={"q": "%"}).json() == []
    assert client.get("/companies/search", params={"q": ""}).status_code == 422
    assert len(client.get("/companies/search", params={"q": "a", "limit": 3}).json()) <= 3


# ---------- Rate limiting ----------


def test_login_is_rate_limited(db):
    limiter.reset()
    limiter.enabled = True
    body = {"email": "pytest-ratelimit@example.com", "password": "whatever-123"}
    statuses = [client.post("/auth/login", json=body).status_code for _ in range(11)]
    assert statuses[:10] == [401] * 10
    assert statuses[10] == 429
    # /health is exempt
    assert all(client.get("/health").status_code == 200 for _ in range(15))
