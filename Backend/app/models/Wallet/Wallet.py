from sqlalchemy import (
    CheckConstraint,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
    func,
)

from app.database import Base


class WalletPositionTable(Base):
    """Shares a user currently holds of one company."""

    __tablename__ = "wallet_position"
    __table_args__ = (UniqueConstraint("user_id", "company_id", name="uq_wallet_position_user_company"),)

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("app_user.id", ondelete="CASCADE"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("company.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Numeric(18, 6), nullable=False)
    # Total paid for the shares still held (average-cost method)
    cost_basis = Column(Numeric(18, 4), nullable=False)


class WalletTransactionTable(Base):
    """Every buy/sell, kept as the account's movement history."""

    __tablename__ = "wallet_transaction"
    __table_args__ = (CheckConstraint("side IN ('buy', 'sell')", name="ck_wallet_transaction_side"),)

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("app_user.id", ondelete="CASCADE"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("company.id", ondelete="CASCADE"), nullable=False)
    side = Column(String(4), nullable=False)
    quantity = Column(Numeric(18, 6), nullable=False)
    price = Column(Numeric(18, 4), nullable=False)
    # Date of the close the order was filled at
    price_date = Column(Date, nullable=False)
    executed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
