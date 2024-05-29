import pytest
from fastapi.testclient import TestClient

from app.database import get_db, Base
from app.main import app
from sqlalchemy import create_engine, StaticPool
from sqlalchemy.orm import sessionmaker

SQL_POSTGRES_DATABASE_URL = "postgresql://postgres:1234567@localhost:5430/postgres"

engine = create_engine(
    SQL_POSTGRES_DATABASE_URL,
    poolclass=StaticPool
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

client = TestClient(app)


@pytest.fixture
def session():
    """Creates a new database session for a test."""
    connection = engine.connect()
    transaction = connection.begin_nested()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db()] = override_get_db()
