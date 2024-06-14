from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker, declarative_base
from app.settings import settings

engine = create_engine(
    f"postgresql://{settings.DATABASE_USER}:{settings.DATABASE_PASSWORD}@{settings.DATABASE_IP}:{settings.DATABASE_PORT}/{settings.DATABASE_NAME}",
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

MetaData = MetaData()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
