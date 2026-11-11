from sqlalchemy import Column, Date, Float, ForeignKey, Index, Integer
from sqlalchemy.orm import relationship

from app.database import Base


class StocksTable(Base):
    __tablename__ = "stockclose"
    # Latest / previous close per company (window functions partition by company and sort by date)
    __table_args__ = (Index("ix_stockclose_company_id_date", "company_id", "date"),)

    id = Column(Integer, primary_key=True)
    value = Column(Float)
    company_id = Column(Integer, ForeignKey("company.id", ondelete="CASCADE"))
    company = relationship("CompanyTable", backref="news")

    date = Column(Date)
