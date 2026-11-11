from sqlalchemy import Column, DateTime, ForeignKey, Integer, UniqueConstraint, func

from app.database import Base


class WatchlistTable(Base):
    __tablename__ = "watchlist"
    __table_args__ = (UniqueConstraint("user_id", "company_id", name="uq_watchlist_user_company"),)

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("app_user.id", ondelete="CASCADE"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("company.id", ondelete="CASCADE"), nullable=False)
    added_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
