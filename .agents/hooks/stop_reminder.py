#!/usr/bin/env python3
"""Stop hook — enforce type-lint guardrail and remind about unused skills.

Blocks if code files were modified (dirty state) but tsc/bun-test
have not been run since the last modification.
"""

import json
import os
import sys
from pathlib import Path

try:
    from _analytics import emit_event
except ImportError:

    def emit_event(*_a: object, **_k: object) -> None:
        pass


def load_session_state(session_id: str) -> dict:
    """Load session state for tracking skill usage."""
    hook_dir = Path(__file__).resolve().parent
    state_path = hook_dir / "state" / f"skills-used-{session_id}.json"
    if state_path.exists():
        with open(state_path) as f:
            return json.load(f)
    return {"suggestedSkills": [], "usedSkills": []}


def load_dirty_state(session_id: str) -> dict:
    """Load dirty state written by post_edit_tracker."""
    hook_dir = Path(__file__).resolve().parent
    state_path = hook_dir / "state" / f"dirty-{session_id}.json"
    if state_path.exists():
        try:
            with open(state_path) as f:
                return json.load(f)
        except (json.JSONDecodeError, PermissionError):
            pass
    return {}


def load_type_lint_pass() -> dict:
    """Load type-lint-last-pass.json."""
    hook_dir = Path(__file__).resolve().parent
    state_path = hook_dir / "state" / "type-lint-last-pass.json"
    if state_path.exists():
        try:
            with open(state_path) as f:
                return json.load(f)
        except (json.JSONDecodeError, PermissionError):
            pass
    return {}


def check_dirty_guardrail(session_id: str) -> bool:
    """Check if code was modified without a subsequent type-lint pass.

    Returns True if blocked (should exit 2), False if OK.
    """
    # 환경변수 우회
    if os.environ.get("SKIP_TYPE_LINT_GUARD") == "1":
        return False

    dirty = load_dirty_state(session_id)
    if not dirty.get("modified"):
        return False

    last_modified = dirty.get("last_modified", "")
    if not last_modified:
        return False

    pass_state = load_type_lint_pass()
    pass_ts = pass_state.get("timestamp", "")

    # type-lint가 코드 수정 이후 실행되지 않음 → BLOCK
    if not pass_ts or pass_ts < last_modified:
        files = dirty.get("files", [])
        print(
            "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
            file=sys.stderr,
        )
        print(
            "BLOCKED: 코드가 수정되었지만 tsc/bun test가 실행되지 않았습니다.",
            file=sys.stderr,
        )
        print(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
            file=sys.stderr,
        )
        print(f"\n  수정된 파일 ({len(files)}개):", file=sys.stderr)
        for f in files[:10]:
            print(f"    - {f}", file=sys.stderr)
        if len(files) > 10:
            print(f"    ... 외 {len(files) - 10}개", file=sys.stderr)
        print(
            "\n  → tsc --noEmit && bun test 를 실행하세요.",
            file=sys.stderr,
        )
        print(
            "  → 우회: SKIP_TYPE_LINT_GUARD=1\n",
            file=sys.stderr,
        )
        return True

    return False


def main() -> None:
    try:
        input_data = json.loads(sys.stdin.read())
    except (json.JSONDecodeError, EOFError):
        sys.exit(0)

    session_id = input_data.get("session_id", "unknown")

    # 1. dirty state 기반 type-lint guardrail (blocking)
    if check_dirty_guardrail(session_id):
        emit_event(
            session_id,
            "hook.invoked",
            {
                "hook": "stop_reminder",
                "trigger": "Stop",
                "outcome": "blocked",
                "matched_count": 0,
                "exit_code": 2,
            },
        )
        emit_event(
            session_id,
            "session.stop",
            {
                "dirty_blocked": True,
                "unused_skills": [],
                "unused_count": 0,
            },
        )
        sys.exit(2)

    # 2. 스킬 사용 상태 로드
    try:
        state = load_session_state(session_id)
    except (json.JSONDecodeError, PermissionError):
        sys.exit(0)

    suggested = set(state.get("suggestedSkills", []))
    used = set(state.get("usedSkills", []))
    unused = suggested - used

    # 3. 미사용 스킬 리마인더
    if not unused:
        emit_event(
            session_id,
            "hook.invoked",
            {
                "hook": "stop_reminder",
                "trigger": "Stop",
                "outcome": "clean",
                "matched_count": 0,
                "exit_code": 0,
            },
        )
        emit_event(
            session_id,
            "session.stop",
            {
                "dirty_blocked": False,
                "unused_skills": [],
                "unused_count": 0,
            },
        )
        sys.exit(0)

    lines = [
        "",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "SKILL REMINDER",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "",
        "  The following skills were suggested but not used:",
        "",
    ]
    for name in sorted(unused):
        lines.append(f"    -> {name}")

    lines.extend(
        [
            "",
            "  Consider invoking them if relevant to your task.",
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
            "",
        ]
    )

    emit_event(
        session_id,
        "hook.invoked",
        {
            "hook": "stop_reminder",
            "trigger": "Stop",
            "outcome": "reminder",
            "matched_count": len(unused),
            "exit_code": 0,
        },
    )
    emit_event(
        session_id,
        "session.stop",
        {
            "dirty_blocked": False,
            "unused_skills": sorted(unused),
            "unused_count": len(unused),
        },
    )
    print("\n".join(lines))
    sys.exit(0)


if __name__ == "__main__":
    main()
