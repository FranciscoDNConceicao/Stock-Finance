import logging
import secrets
from pathlib import Path
from typing import Literal

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    APCA_API_KEY_ID: str
    APCA_API_SECRET_KEY: str
    API_NINJA_KEY: str
    POLYGON_API_KEY: str = ""
    DOMAIN: str
    ENVIRONMENT: Literal["local", "staging", "production"]
    DATABASE_NAME: str
    DATABASE_IP: str
    DATABASE_USER: str
    DATABASE_PASSWORD: str
    DATABASE_PORT: str
    originCORS: list[str]  # noqa: N815  (also the env var name used by docker-compose and CI)

    # Authentication (JWT). Required outside "local"; locally a random key is
    # generated on each start, so tokens stop working after a restart.
    JWT_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # Paper-trading wallet: virtual cash every new account starts with
    WALLET_STARTING_BALANCE: float = 10_000.0

    # Rate limiting (per client IP). Syntax: https://limits.readthedocs.io
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_DEFAULT: str = "120/minute"
    RATE_LIMIT_AUTH: str = "10/minute"
    RATE_LIMIT_EXTERNAL: str = "30/minute"
    # Empty = in-memory (one process). Use e.g. redis://redis:6379 with several workers.
    RATE_LIMIT_STORAGE_URI: str = ""

    # Logging: one JSON object per line on stdout
    LOG_LEVEL: str = "INFO"

    # In-memory caches for the external market-data APIs (seconds), to save their quota
    MARKET_DATA_CACHE_TTL: int = 300
    LOGO_CACHE_TTL: int = 24 * 60 * 60
    # How long the list of company ids used for random picks is reused
    COMPANY_IDS_CACHE_TTL: int = 600

    # Backend/app/.env wherever the process starts (uvicorn, pytest, alembic); a .env in the
    # working directory still overrides it. Real environment variables win over both.
    model_config = SettingsConfigDict(env_file=(Path(__file__).with_name(".env"), ".env"))

    @model_validator(mode="after")
    def _check_jwt_secret(self):
        if not self.JWT_SECRET_KEY:
            if self.ENVIRONMENT != "local":
                raise ValueError("JWT_SECRET_KEY must be set when ENVIRONMENT is not 'local'")
            self.JWT_SECRET_KEY = secrets.token_urlsafe(32)
            logger.warning("JWT_SECRET_KEY is not set; using a random key (sessions reset on restart).")
        return self


settings = Settings()
