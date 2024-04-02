from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text
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
    url = Column(String(70))
    number_employees = Column(Integer)