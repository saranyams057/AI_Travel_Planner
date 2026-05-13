import json
import logging
import time
import uuid
from collections import defaultdict
from contextvars import ContextVar
from functools import wraps
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Any, Callable

request_id_context: ContextVar[str] = ContextVar("request_id", default="-")
LOG_DIR = Path(__file__).resolve().parent / "logs"
APP_LOG_FILE = LOG_DIR / "app.log"
ERROR_LOG_FILE = LOG_DIR / "errors.log"


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": self.formatTime(record, "%Y-%m-%dT%H:%M:%S%z"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": getattr(record, "request_id", request_id_context.get()),
        }

        extra = getattr(record, "extra_fields", None)
        if isinstance(extra, dict):
            payload.update(extra)

        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)

        return json.dumps(payload, default=str)


def configure_logging() -> None:
    LOG_DIR.mkdir(exist_ok=True)

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(JsonFormatter())

    app_file_handler = RotatingFileHandler(
        APP_LOG_FILE,
        maxBytes=2_000_000,
        backupCount=5,
        encoding="utf-8",
    )
    app_file_handler.setFormatter(JsonFormatter())

    error_file_handler = RotatingFileHandler(
        ERROR_LOG_FILE,
        maxBytes=2_000_000,
        backupCount=5,
        encoding="utf-8",
    )
    error_file_handler.setLevel(logging.WARNING)
    error_file_handler.setFormatter(JsonFormatter())

    root = logging.getLogger()
    root.handlers = [console_handler, app_file_handler, error_file_handler]
    root.setLevel(logging.INFO)


logger = logging.getLogger("travel_assistant")

metrics = {
    "http_requests_total": defaultdict(int),
    "http_request_duration_ms": defaultdict(list),
    "agent_runs_total": defaultdict(int),
    "agent_duration_ms": defaultdict(list),
    "agent_errors_total": defaultdict(int),
}


def new_request_id() -> str:
    return str(uuid.uuid4())


def set_request_id(request_id: str):
    return request_id_context.set(request_id)


def reset_request_id(token) -> None:
    request_id_context.reset(token)


def log_event(message: str, **fields: Any) -> None:
    logger.info(message, extra={"extra_fields": fields})


def log_exception(message: str, **fields: Any) -> None:
    logger.exception(message, extra={"extra_fields": fields})


def record_http_request(method: str, path: str, status_code: int, duration_ms: float) -> None:
    key = (method, path, str(status_code))
    metrics["http_requests_total"][key] += 1
    metrics["http_request_duration_ms"][(method, path)].append(duration_ms)


def observe_agent(name: str, agent: Callable) -> Callable:
    @wraps(agent)
    def wrapper(state, *args, **kwargs):
        started_at = time.perf_counter()
        mode = state.get("mode", "unknown") if isinstance(state, dict) else "unknown"
        metrics["agent_runs_total"][(name, mode)] += 1
        log_event("agent_started", agent=name, mode=mode)

        try:
            result = agent(state, *args, **kwargs)
            duration_ms = (time.perf_counter() - started_at) * 1000
            metrics["agent_duration_ms"][(name, mode)].append(duration_ms)
            log_event("agent_finished", agent=name, mode=mode, duration_ms=round(duration_ms, 2))
            return result
        except Exception:
            duration_ms = (time.perf_counter() - started_at) * 1000
            metrics["agent_errors_total"][(name, mode)] += 1
            metrics["agent_duration_ms"][(name, mode)].append(duration_ms)
            log_exception("agent_failed", agent=name, mode=mode, duration_ms=round(duration_ms, 2))
            raise

    return wrapper


def summarize(values: list[float]) -> dict[str, float]:
    if not values:
        return {"count": 0, "avg_ms": 0, "max_ms": 0}
    return {
        "count": len(values),
        "avg_ms": round(sum(values) / len(values), 2),
        "max_ms": round(max(values), 2),
    }


def metrics_snapshot() -> dict[str, Any]:
    return {
        "http_requests_total": [
            {"method": method, "path": path, "status_code": status, "count": count}
            for (method, path, status), count in metrics["http_requests_total"].items()
        ],
        "http_request_duration_ms": [
            {"method": method, "path": path, **summarize(values)}
            for (method, path), values in metrics["http_request_duration_ms"].items()
        ],
        "agent_runs_total": [
            {"agent": agent, "mode": mode, "count": count}
            for (agent, mode), count in metrics["agent_runs_total"].items()
        ],
        "agent_duration_ms": [
            {"agent": agent, "mode": mode, **summarize(values)}
            for (agent, mode), values in metrics["agent_duration_ms"].items()
        ],
        "agent_errors_total": [
            {"agent": agent, "mode": mode, "count": count}
            for (agent, mode), count in metrics["agent_errors_total"].items()
        ],
    }
