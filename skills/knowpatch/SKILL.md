---
name: knowpatch
description: >
  LLM knowledge cutoff compensator — provides up-to-date corrections for breaking changes
  and version drift that may differ from training data.
  (1) Knowledge Corrections: renamed packages (shadcn-ui→shadcn), changed APIs (z.string().email()→z.email()),
  new config formats (.eslintrc→eslint.config.js), current model IDs (Node 24 LTS, GPT-5.3, Opus 4.6);
  (2) Live Lookup commands for verifying versions via package managers (npm view, pip index versions).
  Useful for tasks involving: install, add, create, init, scaffold, upgrade, migrate, latest, version,
  dependency, shadcn, tailwind, vite, zod, eslint, react, next, svelte, nuxt, django, fastapi, pydantic,
  ruff, uv, claude, gpt, gemini, openai, anthropic, model, llm, sdk, npm, pip, cargo, bun,
  node, python, typescript, supabase, jwks, pyproject.toml, package.json, requirements.txt.
---

# Knowpatch

> This skill provides corrections for version-sensitive information that may have drifted since training data was collected.

## Table of Contents

1. [Purpose](#purpose)
2. [Recommended Workflow](#recommended-workflow)
3. [When This Skill Is Most Useful](#when-this-skill-is-most-useful)
4. [Activation Protocol](#activation-protocol)
5. [Live Lookup Commands](#live-lookup-commands)
6. [When to Use Cached Knowledge](#when-to-use-cached-knowledge)
7. [Failure Handling](#failure-handling)
8. [Correction Entry Format](#correction-entry-format)
9. [Update Workflow](#update-workflow)

---

## Purpose

This skill addresses the gap between LLM training data and current reality for versioned information. It works through two mechanisms:

1. **Knowledge Corrections** — Pre-loaded fixes for breaking changes, renamed packages, deprecated APIs, and removed CLI commands that training data may get wrong
2. **Live Lookup Rules** — Package manager queries as the source of truth for version numbers

---

## Recommended Workflow

> Version numbers from training data may be outdated — verify before using.

To get accurate versions, you can:
1. **Query the package manager directly** — `npm view`, `pip index versions`, etc.
2. **Check corrections files** — Reference this skill's `corrections/` directory

Common pitfalls to avoid:
- Using version numbers recalled from training data without verification
- Trusting version numbers from web search results (these can also be stale)
- Claiming something is "the latest version" without checking
- Writing dependency files (`package.json`, `pyproject.toml`) with unverified versions

---

## When This Skill Is Most Useful

This skill is particularly helpful in the following situations:

### Check Corrections Files When:
- User requests package installation or addition (`install`, `add`, `bun add`, etc.)
- Creating a new project or scaffolding
- User mentions "latest version" or "latest"
- User specifies a version that needs validation
- Upgrading or migrating dependencies
- Writing dependency files (`pyproject.toml`, `package.json`, `requirements.txt`, `Cargo.toml`)
- Referencing AI model names or IDs (Claude, GPT, Gemini)
- Using CLI tools (shadcn, tailwind, eslint, vite, create-react-app)
- Writing code that uses library APIs known to have breaking changes (Zod, React, Pydantic, etc.)

### Run Live Lookup When:
- Any version number is needed for code or configuration
- Installing or adding any package
- Writing or modifying dependency files
- User asks about current/latest versions

---

## Activation Protocol

When this skill activates, the following sequence is recommended:

### Step 1: Scan corrections file frontmatter tags
Scan YAML frontmatter `tags` in each corrections file to identify which are relevant to the current task.

### Step 2: Read Relevant Corrections Files
Read all matching corrections files based on frontmatter tag matches. Check for breaking changes, renamed packages, and deprecated APIs.

### Step 3: Run Live Version Lookups
If package versions are needed, query the package manager directly using the Live Lookup Commands below.

---

## Live Lookup Commands

### Single Package Lookup

| Ecosystem | Command |
|-----------|---------|
| Python (PyPI) | `pip index versions {pkg} \| head -1` |
| npm | `npm view {pkg} version` |
| Bun | `bun pm info {pkg} version` |
| Rust (crates.io) | `cargo search {pkg} --limit 1` |
| Go | `go list -m -versions {module}@latest` |

### Batch Lookup (for project scaffolding)

**Python batch:**
```bash
for pkg in fastapi pydantic sqlalchemy alembic uvicorn; do
  ver=$(pip index versions "$pkg" 2>/dev/null | head -1 | sed 's/.*(\(.*\))/\1/')
  echo "$pkg|$ver"
done
```

**npm batch:**
```bash
for pkg in react react-dom typescript tailwindcss vite; do
  echo "$pkg|$(npm view "$pkg" version 2>/dev/null)"
done
```

### Lookup Priority

1. `pip index versions` / `npm view` (primary)
2. `uv pip compile` / `bun pm info` (fallback)
3. Corrections files (when network is unavailable)
4. Ask user for manual verification (when all else fails)

---

## When to Use Cached Knowledge

Corrections files are especially valuable in these cases (live lookup alone may not be enough):

- **Package renames**: `shadcn-ui` → `shadcn` (querying old name may still return results)
- **CLI command changes**: `npx shadcn-ui@latest` → `npx shadcn@latest`
- **API breaking changes**: `z.string().email()` → `z.email()` (version number alone doesn't reveal this)
- **AI model names**: Cannot be looked up via package managers — corrections are the source of truth
- **Config file format changes**: `.eslintrc` → `eslint.config.js`

Even in these cases, verify version numbers via live lookup when possible.

---

## Failure Handling

| Situation | Action |
|-----------|--------|
| Command succeeds | Use the returned version |
| Command fails (tool not installed) | Try fallback command |
| All commands fail | Reference corrections files, state "as of {date}" |
| Not in corrections either | Ask user for manual verification |

---

## Correction Entry Format

All entries in corrections files follow this format:

```
### {Topic} — {YYYY-MM}
- **Wrong (training data)**: {What the model would answer}
- **Correct (current)**: {Actual current state}
- **Impact**: {What goes wrong if outdated info is used}
- **Lookup**: {Package manager verification command}
```

---

## Update Workflow

### Adding New Corrections
1. Identify the relevant corrections file (scan frontmatter tags)
2. Add entry using the standard format above
3. Update the `last_updated` date in the YAML frontmatter
4. Add new tags to the frontmatter `tags` array if necessary

### Deletion Criteria
- Entries older than 2 years: model training data may have caught up — consider removal
- Tools no longer in use: remove entries

### Discoveries During Session
When a live lookup result differs from training data:
- Suggest updating the corrections file to the user
- Ask "Should I add this to corrections?"

---

## Corrections Index

Each corrections file contains YAML frontmatter with `tags` for keyword routing. Scan frontmatter to find relevant files.
