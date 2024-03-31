from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from app.main import Base

class Publisher(Base):
    __tablename__ = "publisher"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, index=True)
    url = Column(String)
    logo_url = Column(String)
    favicon_url = Column(String)

