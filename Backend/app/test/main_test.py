import pytest
from fastapi.testclient import TestClient

from app.database import get_db, Base
from app.main import app
from sqlalchemy import create_engine, StaticPool
from sqlalchemy.orm import sessionmaker, declarative_base

SQL_POSTGRES_DATABASE_URL = "postgresql://postgres:1234567@localhost:5432/postgres"


SQL_POSTGRES_TEST_DATABASE_URL = "postgresql://postgres:1234567@localhost:5432/test_db"

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
