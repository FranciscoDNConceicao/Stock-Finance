from sqlalchemy import Boolean, Column, ForeignKey, Integer, Date, Float
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.Company.Company import CompanyTable
class StocksTable(Base):
    __tablename__ = "stockclose"

    id = Column(Integer, primary_key=True)
    value = Column(Float)
    company_id = Column(Integer, ForeignKey('company.id', ondelete='CASCADE'))
    company = relationship("CompanyTable", backref="news")

    date = Column(Date)
