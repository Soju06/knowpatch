#!/usr/bin/env python3
"""PostToolUse(Bash) hook — detect tsc/bun-test commands and auto-record pass state."""

import json
import re
import sys
from datetime import UTC, datetime
from pathlib import Path

try:
    from _analytics import emit_event
except ImportError:

    def emit_event(*_a: object, **_k: object) -> None:
        pass


CHECK_PATTERNS: dict[str, list[re.Pattern[str]]] = {
    "tsc": [re.compile(r"tsc\b.*--noEmit|tsc\b")],
    "bun-test": [re.compile(r"bun\s+test")],
}

REQUIRED_CHECKS = frozenset(CHECK_PATTERNS.keys())


def detect_checks(command: str) -> set[str]:
    found: set[str] = set()
    for check, patterns in CHECK_PATTERNS.items():
        if any(p.search(command) for p in patterns):
            found.add(check)
    return found


def is_success(tool_result: object) -> bool:
    result_str = str(tool_result) if tool_result else ""
    return not re.search(r"Exit code [1-9]", result_str)


def main() -> None:
    input_data = json.loads(sys.stdin.read())
    command = input_data.get("tool_input", {}).get("command", "")
    session_id = input_data.get("session_id", "unknown")

    checks = detect_checks(command)
    if not checks or not is_success(input_data.get("tool_result")):
        sys.exit(0)

    emit_event(
        session_id,
        "hook.invoked",
        {
            "hook": "check_detector",
            "trigger": "PostToolUse",
            "outcome": "detected",
            "matched_count": len(checks),
            "exit_code": 0,
        },
    )
    emit_event(
        session_id,
        "check.passed",
        {
            "checks": sorted(checks),
            "command_preview": command[:80],
        },
    )

    state_dir = Path(__file__).resolve().parent / "state"
    state_dir.mkdir(exist_ok=True)
    passes_path = state_dir / "check-passes.json"

    passes: dict[str, str] = {}
    if passes_path.exists():
        try:
            passes = json.loads(passes_path.read_text())
        except (json.JSONDecodeError, PermissionError):
            pass

    now = datetime.now(UTC).isoformat()
    for check in checks:
        passes[check] = now
    passes_path.write_text(json.dumps(passes))

    # Load dirty timestamp
    dirty_path = state_dir / f"dirty-{session_id}.json"
    if not dirty_path.exists():
        sys.exit(0)
    try:
        dirty_ts = json.loads(dirty_path.read_text()).get("last_modified", "")
    except (json.JSONDecodeError, PermissionError):
        sys.exit(0)
    if not dirty_ts:
        sys.exit(0)

    # Both checks passed after dirty timestamp → auto-record
    if all(passes.get(c, "") >= dirty_ts for c in REQUIRED_CHECKS):
        pass_state = {
            "timestamp": now,
            "checks": sorted(REQUIRED_CHECKS),
            "result": "PASS",
        }
        (state_dir / "type-lint-last-pass.json").write_text(json.dumps(pass_state))

    sys.exit(0)


if __name__ == "__main__":
    main()
