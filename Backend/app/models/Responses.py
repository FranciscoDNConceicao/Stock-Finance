"""Response schemas. They document the API in OpenAPI, which the frontend uses to generate its types
(see Frontend/finance-app-frontend/package.json -> "gen:api").

Fields are snake_case in Python. Where the JSON key the frontend expects is different
(e.g. "highMax"), the field declares it as its alias; responses are always serialized by alias.
"""

from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class Schema(BaseModel):
    # populate_by_name: build models with the Python names; from_attributes: straight from ORM rows
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


# ---------- Company ----------


class CompanySummary(Schema):
    id: int
    code: str
    color: str | None


class TickerItem(Schema):
    code: str
    # Day change as a ratio (0.0123 = +1.23%)
    discount: float


class TickerResponse(Schema):
    data: list[TickerItem]


class CompanyDetails(Schema):
    code: str
    name: str | None
    locate: str | None
    currency_name: str | None
    address: str | None
    description: str | None
    number_employees: int | None = Field(alias="num_employees")
    url: str | None = Field(alias="URL")
    color: str | None
    high_max: float | None = Field(alias="highMax")
    list_date: date | None = Field(alias="dateList")
    sic_code: str | None = Field(alias="sicCode")


# ---------- News ----------


class NewsItem(Schema):
    id: str
    image_url: str | None = Field(alias="Image")
    # The card shows the article title under this key
    title: str | None = Field(alias="Description")
    publisher: str | None = Field(alias="Publisher")
    date_published: date | None = Field(alias="Date")


# Keys are section labels ("This day", "This week", "This year")
NewsSections = dict[str, list[NewsItem]]


class CompanyNewsItem(Schema):
    id: int
    title: str | None
    image_url: str | None = Field(alias="url_image")
    author: str | None
    date_published: date | None


class CompanyNewsPage(Schema):
    data: list[CompanyNewsItem]
    total: int = Field(alias="num_Rows")


class Publisher(Schema):
    id: int
    name: str | None
    url: str | None
    logo_url: str | None


class NewsArticle(Schema):
    title: str | None
    description: str | None
    author: str | None
    article_url: str | None
    date_published: date | None
    image_url: str | None
    publisher: Publisher
    companies: list[CompanySummary] = Field(alias="Companies")


# ---------- Stocks ----------


class StockRow(Schema):
    id: int
    icon: str
    # [name, code, color]
    stock_name: tuple[str | None, str, str | None] = Field(alias="stockName")
    unit: str
    # [price, currency]
    price_last: tuple[str, str] = Field(alias="priceLast")
    # Ratio vs previous close (0.01 = +1%)
    percentage: float
    # [price, currency]
    price_high: tuple[str, str] = Field(alias="priceHigh")
    last_update: str = Field(alias="lastUpdate")


# ISO timestamp -> close price; null when no provider has data for the period
PriceHistory = dict[str, float] | None
