from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, Date
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.News.Publisher.Publisher import PublisherTable

class NewsTable(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True)
    publisher_id = Column(Integer, ForeignKey('publisher.id', ondelete='CASCADE'))
    title = Column(Text)
    description = Column(Text)
    author = Column(Text)
    article_url = Column(Text)
    date_published = Column(Date)
    image_url = Column(Text)
    news_api_id = Column(String(100), unique=True, index=True)

    publisher = relationship("PublisherTable", backref="news")

