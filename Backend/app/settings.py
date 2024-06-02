from typing import Literal, Annotated

class Settings():
    APCA_API_KEY_ID: str = "PKWD0U5VC3Z0XB7QA09E"
    APCA_API_SECRET_KEY: str = "SDs8F7vW2b1cyKWSqDLj3TJWwa5111FzbVH8RuAg"
    API_NINJA_KEY : str = "W991gcZMI4U+lLRG/Qm/LQ==95RG9bdegtlGlhDe"
    DOMAIN: str = "localhost"
    ENVIRONMENT: Literal["local", "staging", "production"] = "local"
    SQL_ALCHEMY_DATABASE_URL: str = "postgresql://postgres:1234567@localhost:5432/postgres"
    originCORS: list[str] = ["http://localhost:5173"]


settings = Settings()