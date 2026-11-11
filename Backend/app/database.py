from collections.abc import Iterator

from sqlalchemy import URL, create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from app.settings import settings

# URL.create escapes special characters in the password (an f-string URL breaks on "@" or "/")
DATABASE_URL = URL.create(
    "postgresql+psycopg2",
    username=settings.DATABASE_USER,
    password=settings.DATABASE_PASSWORD,
    host=settings.DATABASE_IP,
    port=int(settings.DATABASE_PORT),
    database=settings.DATABASE_NAME,
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
