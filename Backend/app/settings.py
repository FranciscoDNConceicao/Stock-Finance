from typing import Literal, Annotated
import os
from pydantic_settings import BaseSettings, SettingsConfigDict
class Settings(BaseSettings):
    APCA_API_KEY_ID: str
    APCA_API_SECRET_KEY: str
    API_NINJA_KEY : str
    DOMAIN: str
    ENVIRONMENT: Literal["local", "staging", "production"]
    DATABASE_NAME : str
    DATABASE_IP : str
    DATABASE_USER: str
    DATABASE_PASSWORD: str
    DATABASE_PORT: str
    originCORS: list[str]

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()