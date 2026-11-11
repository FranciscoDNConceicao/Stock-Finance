from sqlalchemy import Column, Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class NewsTable(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True)
    publisher_id = Column(Integer, ForeignKey("publisher.id", ondelete="CASCADE"))
    title = Column(Text)
    description = Column(Text)
    author = Column(Text)
    article_url = Column(Text)
    # Indexed for the "this day / week / year" windows and the latest-news lookup
    date_published = Column(Date, index=True)
    image_url = Column(Text)
    news_api_id = Column(String(100), unique=True, index=True)

    publisher = relationship("PublisherTable", backref="news")
