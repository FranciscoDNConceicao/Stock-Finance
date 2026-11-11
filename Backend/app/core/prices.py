"""Latest closes stored in the database (filled by Backend/utils/StockToCompany.py)."""

from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.Stocks.Stocks import StocksTable


@dataclass
class Quote:
    last: Decimal
    last_date: date
    previous: Decimal | None

    @property
    def change(self) -> float | None:
        """Ratio vs the previous close (0.01 = +1%)."""
        if self.previous is None or self.previous <= 0:
            return None
        return float((self.last - self.previous) / self.previous)


def latest_quotes(session: Session, company_ids: list[int]) -> dict[int, Quote]:
    """Last and previous valid close for each company (one query)."""
    if not company_ids:
        return {}
    ranked = (
        select(
            StocksTable.company_id,
            StocksTable.value,
            StocksTable.date,
            func.row_number().over(partition_by=StocksTable.company_id, order_by=StocksTable.date.desc()).label("rn"),
        )
        # -1 / 0 are the loaders' "no value" markers
        .where(StocksTable.company_id.in_(company_ids), StocksTable.value > 0)
        .subquery()
    )
    rows = session.execute(
        select(ranked.c.company_id, ranked.c.value, ranked.c.date, ranked.c.rn)
        .where(ranked.c.rn <= 2)
        .order_by(ranked.c.company_id, ranked.c.rn)
    ).all()

    quotes: dict[int, Quote] = {}
    for company_id, value, day, rn in rows:
        price = Decimal(str(value))
        if rn == 1:
            quotes[company_id] = Quote(last=price, last_date=day, previous=None)
        elif company_id in quotes:
            quotes[company_id].previous = price
    return quotes
