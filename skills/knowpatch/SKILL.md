---
name: knowpatch
version: "0.4.1" # x-release-please-version
description: >
  LLM knowledge cutoff compensator — knowledge corrections for breaking changes and API drift.
  Covers: renamed packages (shadcn-ui→shadcn), changed APIs (z.string().email()→z.email()),
  new config formats (.eslintrc→eslint.config.js), current model IDs, Apple platform changes.
  Versions are NOT cached — always verify via package manager.
  Useful for: install, create, scaffold, upgrade, migrate, latest, version, dependency,
  shadcn, tailwind, vite, zod, eslint, react, next, svelte, nuxt,
  django, fastapi, pydantic, ruff, uv,
  claude, gpt, gemini, openai, anthropic, deepseek, qwen, llama, mistral, kimi, minimax, glm,
  node, bun, python, typescript, macos, xcode, swift, swiftui,
  supabase, npm, pip, cargo, package.json, pyproject.toml, requirements.txt.
---

# Knowpatch

> Knowledge corrections for version-sensitive information that may have drifted since training data.

## Table of Contents

1. [Purpose](#purpose)
2. [Core Principle](#core-principle)
3. [Activation Protocol](#activation-protocol)
4. [Version Lookup Commands](#version-lookup-commands)
5. [When Corrections Are Most Valuable](#when-corrections-are-most-valuable)
6. [Failure Handling](#failure-handling)
7. [Correction Format](#correction-format)
8. [Maintenance](#maintenance)

---

## Purpose

This skill addresses the gap between LLM training data and current reality. It provides **knowledge corrections** — pre-loaded fixes for breaking changes, renamed packages, deprecated APIs, and removed CLI commands that training data gets wrong.

Version numbers are **never stored** in corrections. Always verify versions via the package manager directly.

---

## Core Principle

> **Corrections = knowledge. Versions = package manager.**

- Corrections tell you **what changed** (API renames, breaking changes, deprecated patterns)
- Package managers tell you **what version** is current (`npm view`, `pip index versions`)
- Never trust version numbers from training data or from corrections — always verify

Common pitfalls to avoid:
- Using version numbers recalled from training data without verification
- Claiming something is "the latest version" without checking
- Writing dependency files (`package.json`, `pyproject.toml`) with unverified versions

---

## Activation Protocol

### Step 1: Scan correction file tags
Scan YAML frontmatter `tags` in each corrections file to identify which are relevant to the current task.

### Step 2: Read relevant corrections
Read matching corrections files. Check for breaking changes, renamed packages, deprecated APIs, and new patterns.

### Step 3: Verify versions via package manager
If package versions are needed, query the package manager directly using the commands below. Never use version numbers from memory.

---

## Version Lookup Commands

### Single Package

| Ecosystem | Command |
|-----------|---------|
| npm | `npm view {pkg} version` |
| Bun | `bun pm info {pkg} version` |
| Python (PyPI) | `pip index versions {pkg} \| head -1` |
| Rust (crates.io) | `cargo search {pkg} --limit 1` |
| Go | `go list -m -versions {module}@latest` |

### Batch Lookup (for project scaffolding)

**npm batch:**
```bash
for pkg in react react-dom typescript tailwindcss vite; do
  echo "$pkg|$(npm view "$pkg" version 2>/dev/null)"
done
```

**Python batch:**
```bash
for pkg in fastapi pydantic sqlalchemy alembic uvicorn; do
  ver=$(pip index versions "$pkg" 2>/dev/null | head -1 | sed 's/.*(\(.*\))/\1/')
  echo "$pkg|$ver"
done
```

---

## When Corrections Are Most Valuable

Corrections provide knowledge that **version numbers alone cannot reveal**:

- **Package renames**: `shadcn-ui` → `shadcn` (querying old name may still return results)
- **CLI command changes**: `npx shadcn-ui@latest` → `npx shadcn@latest`
- **API breaking changes**: `z.string().email()` → `z.email()` (version number alone doesn't reveal this)
- **Config format changes**: `.eslintrc` → `eslint.config.js`
- **AI model IDs**: Cannot be looked up via package managers — corrections are the source of truth
- **Open-source model recommendations**: Training data recommends outdated models (Llama, Mistral) — corrections provide current frontier options with selection guide
- **Platform API changes**: Supabase key renames, JWT verification pattern changes
- **Apple platform changes**: macOS version naming (15→26), Liquid Glass design system, Swift concurrency model, Metal API generation

### Check Corrections When:
- Installing or adding packages
- Creating or scaffolding a new project
- Writing code that uses library APIs known to have breaking changes
- Referencing AI model names or IDs
- Recommending open-source or self-hosted LLMs
- Using CLI tools (shadcn, tailwind, eslint, vite)
- Upgrading or migrating dependencies
- Writing Swift/SwiftUI code or targeting Apple platforms
- Referencing macOS version numbers or deployment targets

---

## Failure Handling

| Situation | Action |
|-----------|--------|
| Lookup command succeeds | Use the returned version |
| Lookup command fails (tool not installed) | Try fallback command from the table above |
| All commands fail | State uncertainty clearly, ask user to verify |

---

## Correction Format

Each correction entry in `corrections/` files follows this format:

```markdown
### {Topic} — {YYYY-MM}
- **Wrong (training data)**: {What the model would answer}
- **Correct (current)**: {Actual current state}
- **Impact**: {What goes wrong if outdated info is used}
- **Lookup**: {Package manager verification command}
```

---

## Maintenance

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
