"""Shared configuration for the data-loading scripts in this folder.

Reads the same Backend/app/.env used by the API, so the scripts always point
at the same database and use the same API keys.
"""
from pathlib import Path

import psycopg2
from dotenv import dotenv_values

UTILS_DIR = Path(__file__).resolve().parent
BACKEND_DIR = UTILS_DIR.parent
PROJECT_DIR = BACKEND_DIR.parent

LOGOS_DIR = PROJECT_DIR / "Frontend" / "finance-app-frontend" / "public" / "images" / "logos"
COMPANIES_CSV = UTILS_DIR / "companies.csv"

env = dotenv_values(BACKEND_DIR / "app" / ".env")


def get_connection():
    return psycopg2.connect(
        dbname=env["DATABASE_NAME"],
        user=env["DATABASE_USER"],
        password=env["DATABASE_PASSWORD"],
        host=env["DATABASE_IP"],
        port=env["DATABASE_PORT"],
    )


def logo_codes():
    """Tickers that have a logo in the frontend (one company per logo)."""
    return sorted(p.stem for p in LOGOS_DIR.glob("*.png"))
