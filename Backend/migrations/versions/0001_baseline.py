"""Baseline: the schema as it was before Alembic

Databases created earlier by Base.metadata.create_all already have these tables, so each
one is created only if it is missing. That way `alembic upgrade head` works on both a new
and an existing database, with no manual `alembic stamp`.

Revision ID: 0001
Revises:
Create Date: 2026-11-11
"""

from collections.abc import Callable, Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _create_if_missing(name: str, create: Callable[[], None]) -> None:
    if not sa.inspect(op.get_bind()).has_table(name):
        create()


def upgrade() -> None:
    _create_if_missing("company", _company)
    _create_if_missing("publisher", _publisher)
    _create_if_missing("stockclose", _stockclose)
    _create_if_missing("news", _news)
    _create_if_missing("newscompany", _newscompany)
    _create_if_missing("app_user", _app_user)
    _create_if_missing("wallet_position", _wallet_position)
    _create_if_missing("wallet_transaction", _wallet_transaction)
    _create_if_missing("watchlist", _watchlist)


def _company() -> None:
    op.create_table(
        "company",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("code", sa.String(10)),
        sa.Column("name", sa.String(100)),
        sa.Column("locate", sa.String(70)),
        sa.Column("currency_name", sa.String(10)),
        sa.Column("address", sa.String(150)),
        sa.Column("description", sa.Text()),
        sa.Column("list_date", sa.Date()),
        sa.Column("sic_code", sa.String(20)),
        sa.Column("sic_description", sa.Text()),
        sa.Column("url", sa.Text()),
        sa.Column("number_employees", sa.Integer()),
        sa.Column("high_max", sa.Float()),
        sa.Column("color", sa.String(30)),
    )


def _publisher() -> None:
    op.create_table(
        "publisher",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String()),
        sa.Column("url", sa.String()),
        sa.Column("logo_url", sa.String()),
        sa.Column("favicon_url", sa.String()),
    )
    op.create_index("ix_publisher_name", "publisher", ["name"], unique=True)


def _stockclose() -> None:
    op.create_table(
        "stockclose",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("value", sa.Float()),
        sa.Column("company_id", sa.Integer(), sa.ForeignKey("company.id", ondelete="CASCADE")),
        sa.Column("date", sa.Date()),
    )


def _news() -> None:
    op.create_table(
        "news",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("publisher_id", sa.Integer(), sa.ForeignKey("publisher.id", ondelete="CASCADE")),
        sa.Column("title", sa.Text()),
        sa.Column("description", sa.Text()),
        sa.Column("author", sa.Text()),
        sa.Column("article_url", sa.Text()),
        sa.Column("date_published", sa.Date()),
        sa.Column("image_url", sa.Text()),
        sa.Column("news_api_id", sa.String(100)),
    )
    op.create_index("ix_news_news_api_id", "news", ["news_api_id"], unique=True)


def _newscompany() -> None:
    op.create_table(
        "newscompany",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("news_id", sa.Integer(), sa.ForeignKey("news.id", ondelete="CASCADE")),
        sa.Column("company_id", sa.Integer(), sa.ForeignKey("company.id", ondelete="CASCADE")),
    )


def _app_user() -> None:
    op.create_table(
        "app_user",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("cash_balance", sa.Numeric(18, 4), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_app_user_email", "app_user", ["email"], unique=True)


def _wallet_position() -> None:
    op.create_table(
        "wallet_position",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("app_user.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_id", sa.Integer(), sa.ForeignKey("company.id", ondelete="CASCADE"), nullable=False),
        sa.Column("quantity", sa.Numeric(18, 6), nullable=False),
        sa.Column("cost_basis", sa.Numeric(18, 4), nullable=False),
        sa.UniqueConstraint("user_id", "company_id", name="uq_wallet_position_user_company"),
    )
    op.create_index("ix_wallet_position_user_id", "wallet_position", ["user_id"])


def _wallet_transaction() -> None:
    op.create_table(
        "wallet_transaction",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("app_user.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_id", sa.Integer(), sa.ForeignKey("company.id", ondelete="CASCADE"), nullable=False),
        sa.Column("side", sa.String(4), nullable=False),
        sa.Column("quantity", sa.Numeric(18, 6), nullable=False),
        sa.Column("price", sa.Numeric(18, 4), nullable=False),
        sa.Column("price_date", sa.Date(), nullable=False),
        sa.Column("executed_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("side IN ('buy', 'sell')", name="ck_wallet_transaction_side"),
    )
    op.create_index("ix_wallet_transaction_user_id", "wallet_transaction", ["user_id"])


def _watchlist() -> None:
    op.create_table(
        "watchlist",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("app_user.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_id", sa.Integer(), sa.ForeignKey("company.id", ondelete="CASCADE"), nullable=False),
        sa.Column("added_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("user_id", "company_id", name="uq_watchlist_user_company"),
    )
    op.create_index("ix_watchlist_user_id", "watchlist", ["user_id"])


def downgrade() -> None:
    for table in (
        "watchlist",
        "wallet_transaction",
        "wallet_position",
        "app_user",
        "newscompany",
        "news",
        "stockclose",
        "publisher",
        "company",
    ):
        op.drop_table(table)
