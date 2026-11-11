"""Structured logging: every record is written to stdout as one JSON object per line.

Extra context goes in `extra=` and ends up as top-level keys:
    logger.info("request", extra={"method": "GET", "path": "/stocks", "status": 200})
"""

import json
import logging
import sys
import time
from datetime import UTC, datetime

from starlette.types import ASGIApp, Message, Receive, Scope, Send

# Attributes every LogRecord has; anything else on the record came from `extra=`
_STANDARD_ATTRS = set(vars(logging.makeLogRecord({}))) | {"message", "asctime", "taskName"}


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "time": datetime.fromtimestamp(record.created, UTC).isoformat(timespec="milliseconds"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        payload.update({key: value for key, value in vars(record).items() if key not in _STANDARD_ATTRS})
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, default=str, ensure_ascii=False)


def configure_logging(level: str = "INFO") -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())

    root = logging.getLogger()
    root.handlers[:] = [handler]
    root.setLevel(level.upper())

    # Route uvicorn's own logs through the JSON handler. Its access log is replaced by
    # the request-logging middleware in app.main, which also records the duration.
    for name in ("uvicorn", "uvicorn.error"):
        uvicorn_logger = logging.getLogger(name)
        uvicorn_logger.handlers.clear()
        uvicorn_logger.propagate = True
    logging.getLogger("uvicorn.access").disabled = True


_request_logger = logging.getLogger("app.requests")

# Polled by Docker every 30 s; logged at DEBUG so it doesn't drown the real traffic
_QUIET_PATHS = {"/health"}


class RequestLoggingMiddleware:
    """Logs one line per HTTP request: method, path, status and duration.

    A plain ASGI middleware (not BaseHTTPMiddleware), so it doesn't buffer responses.
    """

    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        start = time.perf_counter()
        status = 500  # stays 500 when the app raises before sending a response

        async def send_with_status(message: Message) -> None:
            nonlocal status
            if message["type"] == "http.response.start":
                status = message["status"]
            await send(message)

        try:
            await self.app(scope, receive, send_with_status)
        finally:
            path = scope["path"]
            if status >= 500:
                level = logging.ERROR
            elif path in _QUIET_PATHS:
                level = logging.DEBUG
            else:
                level = logging.INFO
            _request_logger.log(
                level,
                "request",
                extra={
                    "method": scope["method"],
                    "path": path,
                    "status": status,
                    "duration_ms": round((time.perf_counter() - start) * 1000, 1),
                },
            )
