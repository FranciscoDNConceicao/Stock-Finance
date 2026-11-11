import logging

from fastapi import APIRouter, Request, Response, status
from sqlalchemy import text

from app.core.rate_limit import limiter
from app.database import engine
from app.models.AccountSchemas import HealthOut

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get(
    "/health",
    response_model=HealthOut,
    responses={503: {"model": HealthOut, "description": "The database is unreachable"}},
)
@limiter.exempt
def health(request: Request, response: Response):
    """Liveness + database check, for Docker/uptime monitors. Not rate limited."""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except Exception:
        logger.exception("Health check: database unavailable")
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return HealthOut(status="degraded", database="unavailable")
    return HealthOut(status="ok", database="ok")
