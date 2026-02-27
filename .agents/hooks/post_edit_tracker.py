#!/usr/bin/env python3
"""PostToolUse hook — track code file modifications for type-lint guardrail."""

import json
import sys
from datetime import UTC, datetime
from pathlib import Path

try:
    from _analytics import emit_event
except ImportError:

    def emit_event(*_a: object, **_k: object) -> None:
        pass


# 코드 파일 확장자
CODE_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx"}

# 코드 디렉토리 (프로젝트 루트 기준 상대경로)
CODE_DIRS = {"src/", "tests/"}

# 제외 패턴
EXCLUDE_PATTERNS = {"node_modules/", ".agents/", "bin/", "skills/"}


def is_code_file(file_path: str, project_dir: str) -> bool:
    """코드 파일인지 판별."""
    if Path(file_path).suffix not in CODE_EXTENSIONS:
        return False

    try:
        rel = str(Path(file_path).relative_to(project_dir))
    except ValueError:
        return False

    if any(excl in rel for excl in EXCLUDE_PATTERNS):
        return False

    return any(rel.startswith(d) for d in CODE_DIRS)


def main() -> None:
    try:
        input_data = json.loads(sys.stdin.read())
    except (json.JSONDecodeError, EOFError):
        sys.exit(0)

    session_id = input_data.get("session_id", "unknown")
    tool_input = input_data.get("tool_input", {})
    file_path = tool_input.get("file_path", "")
    project_dir = input_data.get("cwd", "")

    if not file_path or not is_code_file(file_path, project_dir):
        sys.exit(0)

    # dirty state 기록
    hook_dir = Path(__file__).resolve().parent
    state_dir = hook_dir / "state"
    state_dir.mkdir(parents=True, exist_ok=True)
    state_path = state_dir / f"dirty-{session_id}.json"

    # 기존 state 로드
    state: dict[str, object] = {"modified": True, "files": [], "last_modified": ""}
    if state_path.exists():
        try:
            with open(state_path) as f:
                state = json.load(f)
        except (json.JSONDecodeError, PermissionError):
            pass

    # 파일 추가 (중복 제거)
    files = state.get("files", [])
    if isinstance(files, list) and file_path not in files:
        files.append(file_path)
    state["files"] = files
    state["modified"] = True
    state["last_modified"] = datetime.now(UTC).isoformat()

    with open(state_path, "w") as f:
        json.dump(state, f, indent=2)

    emit_event(
        session_id,
        "hook.invoked",
        {
            "hook": "post_edit_tracker",
            "trigger": "PostToolUse",
            "outcome": "tracked",
            "matched_count": 1,
            "exit_code": 0,
        },
    )
    emit_event(
        session_id,
        "edit.tracked",
        {
            "file_path": file_path,
            "is_code_file": True,
        },
    )
    sys.exit(0)


if __name__ == "__main__":
    main()
