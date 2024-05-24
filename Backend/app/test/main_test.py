import pytest
from fastapi.testclient import TestClient

from app.database import get_db
from app.main import app
from sqlalchemy import create_engine, StaticPool
from sqlalchemy.orm import sessionmaker

SQL_ALCHEMY_DATABASE_URL = "postgresql:///:memory:"

engine = create_engine(
    SQL_ALCHEMY_DATABASE_URL,
    poolclass=StaticPool
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

client = TestClient(app)

def override_get_db():
    print('ERROR')
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db()] = override_get_db()
