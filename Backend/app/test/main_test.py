import pytest
from fastapi.testclient import TestClient

from app.database import get_db, Base
from app.main import app
from sqlalchemy import create_engine, StaticPool
from sqlalchemy.orm import sessionmaker, declarative_base
from app.settings import settings

SQL_POSTGRES_DATABASE_URL = f"postgresql://{settings.DATABASE_USER}:{settings.DATABASE_PASSWORD}@{settings.DATABASE_IP}:{settings.DATABASE_PORT}/{settings.DATABASE_NAME}"

engine = create_engine(
    SQL_POSTGRES_DATABASE_URL,
    poolclass=StaticPool
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

client = TestClient(app)


@pytest.fixture
def session():
    """Creates a new database session for a test."""
    Base.metadata.create_all(engine)
    connection = engine.connect()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    session.rollback()
    connection.close()

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
