"""Request/response schemas for authentication, the wallet, the watchlist and search."""

from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

# ---------- Auth ----------


class Credentials(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)

    @field_validator("email")
    @classmethod
    def _lower(cls, value: str) -> str:
        return value.lower()

    @field_validator("password")
    @classmethod
    def _bcrypt_limit(cls, value: str) -> str:
        # bcrypt only looks at the first 72 bytes
        if len(value.encode("utf-8")) > 72:
            raise ValueError("password must be at most 72 bytes")
        return value


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    created_at: datetime


class TokenOut(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in: int
    user: UserOut


# ---------- Wallet ----------


class TradeIn(BaseModel):
    company_id: int
    side: Literal["buy", "sell"]
    quantity: Decimal = Field(gt=0, max_digits=18, decimal_places=6)


class PositionOut(BaseModel):
    company_id: int
    code: str
    name: str | None
    color: str | None
    quantity: float
    avg_price: float
    last_price: float | None
    previous_close: float | None
    last_update: date | None
    market_value: float
    day_change: float
    total_change: float
    # Ratio, 0.05 = +5%
    total_change_pct: float


class WalletOut(BaseModel):
    currency: str
    # Uninvested virtual cash
    cash: float
    # Market value of all positions
    holdings_value: float
    # cash + holdings_value
    balance: float
    day_change: float
    total_change: float
    positions: list[PositionOut]


class TransactionOut(BaseModel):
    id: int
    company_id: int
    code: str
    name: str | None
    color: str | None
    side: Literal["buy", "sell"]
    quantity: float
    price: float
    total: float
    price_date: date
    executed_at: datetime


# ---------- Watchlist ----------


class WatchlistIn(BaseModel):
    company_id: int


class WatchlistItemOut(BaseModel):
    company_id: int
    code: str
    name: str | None
    color: str | None
    currency: str | None
    last_price: float | None
    # Ratio vs previous close
    change: float | None
    last_update: date | None
    added_at: datetime


# ---------- Search ----------


class CompanySearchResult(BaseModel):
    id: int
    code: str
    name: str | None
    color: str | None


# ---------- Health ----------


class HealthOut(BaseModel):
    status: Literal["ok", "degraded"]
    database: Literal["ok", "unavailable"]
