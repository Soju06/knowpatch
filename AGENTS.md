# Knowpatch

Knowledge patch (skill/correction) management CLI for AI coding agents.

## Environment

| Item | Value |
|------|-------|
| Runtime | Bun |
| Language | TypeScript (strict mode) |
| Package Manager | bun |
| Build | `bun run build` |
| Test | `bun test` |
| Type Check | `tsc --noEmit` |

## Project Context

knowpatch handles **two kinds of hooks**:

| Type | Location | Purpose |
|------|----------|---------|
| **Product hooks** | `src/hooks/` | User-facing hooks installed by knowpatch (detect.ts) |
| **Dev hooks** | `.agents/hooks/` | Quality guardrail hooks for developing this project (Python) |

SKILL.md and corrections/ under `skills/knowpatch/` are **product files**.
Always pass typecheck + tests before modifying skill files.

## Code Conventions (Key Points)

- TypeScript strict mode — no `any`/`unknown`
- ESM modules, `node:` prefix, `.js` extension imports
- Layer separation: `commands/` → `core/` → `ui/` (core must not import from upper layers)
- Never guess versions/packages — verify via package manager
- Details: [code-conventions.md](./.agents/conventions/code-conventions.md)

## Quality Gate

Run after every code change:

```bash
tsc --noEmit && bun test
```

Dev hooks track dirty state; the Stop hook blocks if not run.

## Project Structure

| Directory | Role |
|-----------|------|
| `src/commands/` | CLI commands (install, uninstall) |
| `src/core/` | Business logic (parser, paths, hooks) |
| `src/ui/` | Terminal output (palette, spinner, interactive) |
| `src/hooks/` | Product hooks (detect.ts) |
| `skills/knowpatch/` | **Product files** — SKILL.md + corrections/ |
| `tests/` | bun:test tests |
| `bin/` | Build output (gitignored) |
| `.agents/hooks/` | Dev hooks (Python) |
| `.agents/conventions/` | Coding/authoring standards |
| `.agents/skills/` | Skill trigger/guardrail rules |

## Convention Index

| Convention | File | Key Content |
|------------|------|-------------|
| Code standards | [code-conventions.md](./.agents/conventions/code-conventions.md) | TS strict, layer separation, anti-patterns |
| Skill authoring | [skill-authoring.md](./.agents/conventions/skill-authoring.md) | Prompt principles, correction quality, YAML rules |
| Document standards | [document-standards.md](./.agents/conventions/document-standards.md) | Size limits, TOC, Progressive Disclosure |
| Git workflow | [git-workflow.md](./.agents/conventions/git-workflow.md) | Commit rules, branches, pre-push checks |
