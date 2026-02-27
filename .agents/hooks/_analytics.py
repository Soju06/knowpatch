"""Shared analytics event emitter for Claude Code hooks.

Writes JSONL events to .agents/hooks/state/analytics/events-YYYY-MM-DD.jsonl.
Import with graceful fallback:

    try:
        from _analytics import emit_event
    except ImportError:
        def emit_event(*_a: object, **_k: object) -> None: pass
"""

import json
import os
from datetime import UTC, datetime
from pathlib import Path

_ANALYTICS_DIR = Path(__file__).resolve().parent / "state" / "analytics"


def emit_event(session_id: str, event: str, data: dict[str, str | int | bool | list[str] | None]) -> None:
    """Append a single JSONL event line to today's analytics log.

    Fast path: single open("a") + write + close ~ 2ms.
    Silently swallows errors to never break the calling hook.
    """
    try:
        _ANALYTICS_DIR.mkdir(parents=True, exist_ok=True)
        today = datetime.now(UTC).strftime("%Y-%m-%d")
        path = _ANALYTICS_DIR / f"events-{today}.jsonl"
        record = {
            "ts": datetime.now(UTC).isoformat(),
            "session_id": session_id or os.environ.get("CLAUDE_SESSION_ID", "unknown"),
            "event": event,
            "data": data,
        }
        line = json.dumps(record, separators=(",", ":"), ensure_ascii=False) + "\n"
        with open(path, "a") as f:
            f.write(line)
    except Exception:
        pass  # never break the calling hook
