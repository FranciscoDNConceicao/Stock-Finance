"""Random picks of companies without ORDER BY random().

ORDER BY random() makes PostgreSQL read and sort every row on every request. Instead, the
list of company ids is loaded once every COMPANY_IDS_CACHE_TTL seconds and sampled in Python;
the query that follows only fetches the picked rows by primary key.
"""

import random
import threading
import time

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.Company.Company import CompanyTable
from app.settings import settings


class _CompanyIdCache:
    def __init__(self, ttl: float):
        self._ttl = ttl
        self._ids: tuple[int, ...] = ()
        self._expires_at = 0.0
        self._lock = threading.Lock()

    def get(self, session: Session) -> tuple[int, ...]:
        with self._lock:
            if time.monotonic() >= self._expires_at:
                self._ids = tuple(session.scalars(select(CompanyTable.id)).all())
                # An empty table is not cached, so data loaded later shows up right away
                self._expires_at = time.monotonic() + self._ttl if self._ids else 0.0
            return self._ids

    def clear(self) -> None:
        with self._lock:
            self._expires_at = 0.0


company_ids = _CompanyIdCache(settings.COMPANY_IDS_CACHE_TTL)


def random_company_ids(session: Session, k: int) -> list[int]:
    """Up to `k` distinct company ids, in random order."""
    ids = company_ids.get(session)
    return random.sample(ids, min(k, len(ids)))
