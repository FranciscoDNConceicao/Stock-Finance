from alembic import context

import app.models  # noqa: F401  (registers every table on Base.metadata)
from app.core.logging import configure_logging
from app.database import Base, engine
from app.settings import settings

configure_logging(settings.LOG_LEVEL)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """`alembic upgrade head --sql`: prints the SQL instead of running it."""
    context.configure(dialect_name="postgresql", target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    # A caller (e.g. a test) can hand over its own connection through config.attributes
    connection = context.config.attributes.get("connection")
    if connection is not None:
        _run(connection)
        return
    with engine.connect() as connection:
        _run(connection)


def _run(connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata, compare_type=True)
    with context.begin_transaction():
        context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
