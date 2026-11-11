"""Per-IP rate limiting (slowapi).

Every route gets RATE_LIMIT_DEFAULT through the middleware; routes decorated
with @limiter.limit(...) use their own, stricter limit instead.

Behind a reverse proxy, run uvicorn with --proxy-headers (and
--forwarded-allow-ips) so request.client.host is the real client IP.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

from app.settings import settings

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[settings.RATE_LIMIT_DEFAULT],
    enabled=settings.RATE_LIMIT_ENABLED,
    storage_uri=settings.RATE_LIMIT_STORAGE_URI or "memory://",
    headers_enabled=False,
)
