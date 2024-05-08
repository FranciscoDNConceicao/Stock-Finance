from sqlalchemy import Boolean,Float, Column, ForeignKey, Integer, String, Text, Date
from app.database import Base


class CompanyTable(Base):
    __tablename__ = 'company'

    id = Column(Integer, primary_key=True)
    code = Column(String(10))
    name = Column(String(100))
    locate = Column(String(70))
    currency_name = Column(String(10))
    address = Column(String(150))
    description = Column(Text)
    list_date = Column(Date)
    sic_code = Column(String(20))
    url = Column(String(70))
    number_employees = Column(Integer)
    high_max = Column(Float)
    color = Column(String(30))