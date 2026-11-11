"""Writes the OpenAPI schema to a file, without starting the server or connecting to the database.

The frontend generates its API types from this file:
    cd Backend && python -m app.export_openapi ../Frontend/finance-app-frontend/openapi.json
    cd Frontend/finance-app-frontend && npm run gen:api
"""

import json
import os
import sys

# Settings() requires these at import time, but building the schema never uses them.
for name in (
    "APCA_API_KEY_ID",
    "APCA_API_SECRET_KEY",
    "API_NINJA_KEY",
    "DOMAIN",
    "DATABASE_NAME",
    "DATABASE_IP",
    "DATABASE_USER",
    "DATABASE_PASSWORD",
):
    os.environ.setdefault(name, "unused")
os.environ.setdefault("DATABASE_PORT", "5432")
os.environ.setdefault("ENVIRONMENT", "local")
os.environ.setdefault("originCORS", "[]")

from app.main import app  # noqa: E402

if __name__ == "__main__":
    output = sys.argv[1] if len(sys.argv) > 1 else "openapi.json"
    with open(output, "w", encoding="utf-8", newline="\n") as file:
        json.dump(app.openapi(), file, indent=2)
        file.write("\n")
    print(f"OpenAPI schema written to {output}")
