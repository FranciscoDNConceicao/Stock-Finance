from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, Date
from sqlalchemy.orm import relationship
from app.database import Base
class NewsTable(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True)
    publisher_id = Column(Integer, ForeignKey('publisher.id', ondelete='CASCADE'))
    title = Column(Text)
    description = Column(Text)
    author = Column(String(70))
    article_url = Column(String(70))
    date_published = Column(Date)
    image_url = Column(String(70))

    publisher = relationship("Publisher", backref="news")

