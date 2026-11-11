"""Indexes for the API's hot queries

- stockclose (company_id, date): latest / previous close per company (LAG / ROW_NUMBER)
- news (date_published): "this day / week / year" windows and the latest-news lookup
- newscompany (news_id), (company_id): every news <-> company join

if_not_exists: a database built by Base.metadata.create_all from the current models
(e.g. by the tests) already has them.

Revision ID: 0002
Revises: 0001
Create Date: 2026-11-11
"""

from collections.abc import Sequence

from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

INDEXES = (
    ("ix_stockclose_company_id_date", "stockclose", ["company_id", "date"]),
    ("ix_news_date_published", "news", ["date_published"]),
    ("ix_newscompany_news_id", "newscompany", ["news_id"]),
    ("ix_newscompany_company_id", "newscompany", ["company_id"]),
)


def upgrade() -> None:
    for name, table, columns in INDEXES:
        op.create_index(name, table, columns, if_not_exists=True)


def downgrade() -> None:
    for name, table, _ in INDEXES:
        op.drop_index(name, table_name=table, if_exists=True)
