---
ecosystem: python
description: Python ecosystem tool/library changes
tags: [pip, uv, poetry, pydantic, fastapi, django, ruff, flask, sqlalchemy, python]
version: "0.4.2" # x-release-please-version
last_updated: "2026-03-10"
---

# Python — Version Corrections

> Last updated: 2026-03-10

## Table of Contents
- [uv](#uv)
- [Django 6](#django-6)
- [Pydantic v2](#pydantic-v2)
- [ruff](#ruff)
- [FastAPI](#fastapi)

---

### uv — 2026-03
- **Outdated**: `pip install` + `python -m venv` or `poetry` is the standard for Python package management
- **Current**:
  - uv 0.10.x — Mainstream replacement for pip/poetry
  - Project init: `uv init`
  - Add dependency: `uv add fastapi`
  - Run: `uv run python app.py`
  - Virtual env: `uv venv` (auto-created)
  - Lock file: `uv.lock` (auto-managed)
  - pip compatible: `uv pip install`, `uv pip compile`
  - Rust-based, 10-100x faster than pip
  - **Breaking in 0.10.0** (2026-02-05):
    - `uv venv` requires `--clear` to remove existing venvs
    - Multiple indexes with `default = true` now errors
    - `uv python upgrade` now stable (was preview)
- **Impact**: pip/poetry still work but are slow; modern Python projects default to uv. `uv venv` behavior change is a common footgun when upgrading from 0.9.x.
- **Lookup**: `pip index versions uv | head -1`

### Django 6 — 2026-03
- **Outdated**: Django 4.x or 5.x is the latest
- **Current**:
  - Django 6.0.3 (2026-03-03, security release)
  - CVE-2026-25673: DoS via `URLField` Unicode normalization on Windows
  - CVE-2026-25674: Incorrect permissions on filesystem objects in multi-threaded environments
  - Key features: template partials, background tasks (no Celery needed), native CSP middleware
- **Impact**: Django 4/5 code is mostly compatible. Security patches required — use 6.0.3+
- **Lookup**: `pip index versions django | head -1`

### Pydantic v2 — 2023-07
- **Outdated**: Pydantic v1 style usage
  - `class Config:` inner class
  - `@validator` decorator
  - `@root_validator` decorator
  - `from pydantic import validator`
- **Current**:
  - Pydantic v2
  - `model_config = ConfigDict(...)` (replaces `class Config`)
  - `@field_validator` decorator
  - `@model_validator` decorator
  - `from pydantic import field_validator, model_validator`
  - v1 compatibility layer (`pydantic.v1`) is being phased out
- **Impact**: v1-style code produces deprecation warnings; full removal is planned
- **Lookup**: `pip index versions pydantic | head -1`

### ruff — 2026-03
- **Outdated**: `flake8` + `black` + `isort` combo is the Python linting standard
- **Current**:
  - ruff 0.15.x — All-in-one replacement for flake8 + black + isort
  - Linting: `ruff check .`
  - Formatting: `ruff format .`
  - Auto-fix: `ruff check --fix .`
  - Rust-based, 10-100x faster than flake8
  - Config: `[tool.ruff]` section in `pyproject.toml`
  - Markdown formatting support in LSP (0.15.1+, preview)
- **Impact**: flake8/black/isort combo works but is slow with fragmented config. Modern projects default to ruff.
- **Lookup**: `pip index versions ruff | head -1`

### FastAPI — 2026-03
- **Outdated**: FastAPI 0.90-0.100 range is the latest; Pydantic v1 is supported
- **Current**:
  - FastAPI 0.129.x
  - **Pydantic v1 dropped** in 0.126+ — minimum `pydantic >= 2.7.0`
  - `pydantic.v1` namespace triggers deprecation warning (0.127+)
  - `lifespan` event handler (on_event is deprecated)
  - 2x+ JSON response performance improvement (0.129+)
- **Impact**: Code using `from pydantic.v1 import ...` or Pydantic v1 patterns will break on FastAPI 0.126+
- **Lookup**: `pip index versions fastapi | head -1`
