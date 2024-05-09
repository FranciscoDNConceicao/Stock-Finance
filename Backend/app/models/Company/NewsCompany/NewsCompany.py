from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

class NewsCompanyTable(Base):
    __tablename__ = "newscompany"

    id = Column(Integer, primary_key=True)
    news_id = Column(Integer, ForeignKey('news.id', ondelete='CASCADE'))
    company_id = Column(Integer, ForeignKey('company.id', ondelete='CASCADE'))

    news = relationship("NewsTable", backref="news")
    company = relationship("CompanyTable", backref="company")