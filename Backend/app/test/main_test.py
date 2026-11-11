from contextlib import contextmanager

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import StaticPool, create_engine, event
from sqlalchemy.orm import sessionmaker

import app.models  # noqa: F401  (registers every table on Base.metadata)
from app.database import DATABASE_URL, Base, get_db
from app.main import app

# One shared connection (StaticPool): rows a test flushes are visible to the API without a commit,
# and the fixture rolls them back afterwards
engine = create_engine(DATABASE_URL, poolclass=StaticPool)

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


@contextmanager
def count_queries():
    """Counts the SQL statements run inside the block: `with count_queries() as queries: ...; len(queries)`."""
    statements: list[str] = []

    def before_execute(conn, cursor, statement, parameters, context, executemany):
        statements.append(statement)

    event.listen(engine, "before_cursor_execute", before_execute)
    try:
        yield statements
    finally:
        event.remove(engine, "before_cursor_execute", before_execute)
