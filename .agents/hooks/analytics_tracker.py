#!/usr/bin/env python3
"""PostToolUse hook — track Read/Skill/Task tool usage for analytics.

Matchers: Read | Skill | Task

- Read: detects SKILL.md reads (shadow usage candidate)
- Skill: logs official skill invocations
- Task: logs agent spawns
"""

import json
import re
import sys
from pathlib import Path

try:
    from _analytics import emit_event
except ImportError:

    def emit_event(*_a: object, **_k: object) -> None:
        pass


def record_skill_used(session_id: str, skill_name: str) -> None:
    """Record skill invocation in session state for skill_guard lookups."""
    hook_dir = Path(__file__).resolve().parent
    state_dir = hook_dir / "state"
    state_dir.mkdir(parents=True, exist_ok=True)
    state_path = state_dir / f"skills-used-{session_id}.json"

    state: dict[str, list[str]] = {"suggestedSkills": [], "usedSkills": []}
    if state_path.exists():
        try:
            with open(state_path) as f:
                state = json.load(f)
        except (json.JSONDecodeError, PermissionError):
            pass

    used = state.get("usedSkills", [])
    if skill_name not in used:
        used.append(skill_name)
    state["usedSkills"] = used

    with open(state_path, "w") as f:
        json.dump(state, f, indent=2)


# Regex to detect SKILL.md reads — matches .agents/skills/<name>/SKILL.md
_SKILL_MD_RE = re.compile(r"[/\\]\.?agents[/\\]skills[/\\]([^/\\]+)[/\\]SKILL\.md$")

# Convention file reads that satisfy guardrail checks.
# Maps convention filename → guardrail rule name in skill-rules.json.
_CONVENTION_GUARD_MAP: dict[str, str] = {
    "skill-authoring.md": "skill-authoring-guard",
}

# Known agent types (none yet — reserved for future expansion)
_KNOWN_AGENTS: set[str] = set()


def handle_read(session_id: str, tool_input: dict[str, str]) -> None:
    """Emit skill.read if the Read target is a SKILL.md file.

    Also registers convention file reads as guardrail satisfaction
    so that ``sessionSkillUsed`` skip conditions work correctly.
    """
    file_path = tool_input.get("file_path", "")

    # Check convention file reads → register as guard satisfied
    basename = Path(file_path).name
    guard_name = _CONVENTION_GUARD_MAP.get(basename)
    if guard_name:
        record_skill_used(session_id, guard_name)

    m = _SKILL_MD_RE.search(file_path)
    if not m:
        return  # hot path: not a SKILL.md → exit fast
    skill_name = m.group(1)
    emit_event(
        session_id,
        "skill.read",
        {
            "skill": skill_name,
            "file_path": file_path,
            "source": "read_tool",
        },
    )


def handle_skill(session_id: str, tool_input: dict[str, str]) -> None:
    """Emit skill.invoked for official Skill tool usage and record in session state."""
    skill = tool_input.get("skill", "")
    if not skill:
        return
    record_skill_used(session_id, skill)
    emit_event(
        session_id,
        "skill.invoked",
        {
            "skill": skill,
            "args": tool_input.get("args", ""),
            "source": "skill_tool",
        },
    )


def handle_task(session_id: str, tool_input: dict[str, str]) -> None:
    """Emit agent.spawned for Task tool usage."""
    agent_type = tool_input.get("subagent_type", "")
    if not agent_type:
        return
    description = tool_input.get("description", "")
    emit_event(
        session_id,
        "agent.spawned",
        {
            "agent_type": agent_type,
            "description_preview": description[:80] if description else "",
        },
    )


_HANDLERS: dict[str, object] = {
    "Read": handle_read,
    "Skill": handle_skill,
    "Task": handle_task,
}


def main() -> None:
    try:
        input_data = json.loads(sys.stdin.read())
    except (json.JSONDecodeError, EOFError):
        sys.exit(0)

    session_id = input_data.get("session_id", "unknown")
    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})

    handler = _HANDLERS.get(tool_name)
    if handler and callable(handler):
        handler(session_id, tool_input)

    sys.exit(0)


if __name__ == "__main__":
    main()
