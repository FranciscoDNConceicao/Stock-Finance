from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.api.main import api_router
from app.core import market_data
from app.core.logging import RequestLoggingMiddleware, configure_logging
from app.core.rate_limit import limiter
from app.settings import settings

configure_logging(settings.LOG_LEVEL)


@asynccontextmanager
async def lifespan(_: FastAPI):
    # The schema is managed by Alembic (`alembic upgrade head`, run by the Docker image on start)
    yield
    market_data.close()


app = FastAPI(title="Stock Finance", lifespan=lifespan)
app.include_router(api_router)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)
# Outside the rate limiter, so 429 responses are logged too
app.add_middleware(RequestLoggingMiddleware)
# Added last so it is the outermost middleware: 429 responses also carry CORS headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.originCORS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    uvicorn.run(app)
