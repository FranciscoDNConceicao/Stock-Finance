from sqlalchemy import Column, DateTime, Integer, Numeric, String, func

from app.database import Base


class UserTable(Base):
    __tablename__ = "app_user"

    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    # Virtual cash available to buy shares (paper trading)
    cash_balance = Column(Numeric(18, 4), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
