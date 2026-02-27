---
ecosystem: python
description: Python ecosystem tool/library changes
tags: [pip, uv, poetry, pydantic, fastapi, django, ruff, flask, sqlalchemy, python]
version: "0.4.0" # x-release-please-version
last_updated: "2026-02-24"
---

# Python — Version Corrections

> Last updated: 2026-02-24

## Table of Contents
- [uv](#uv)
- [Django 6](#django-6)
- [Pydantic v2](#pydantic-v2)
- [ruff](#ruff)
- [FastAPI](#fastapi)

---

### uv — 2025
- **Outdated**: `pip install` + `python -m venv` or `poetry` is the standard for Python package management
- **Current**:
  - uv — Mainstream replacement for pip/poetry
  - Project init: `uv init`
  - Add dependency: `uv add fastapi`
  - Run: `uv run python app.py`
  - Virtual env: `uv venv` (auto-created)
  - Lock file: `uv.lock` (auto-managed)
  - pip compatible: `uv pip install`, `uv pip compile`
  - Rust-based, 10-100x faster than pip
- **Impact**: pip/poetry still work but are slow; modern Python projects default to uv
- **Lookup**: `pip index versions uv | head -1`

### Django 6 — 2025
- **Outdated**: Django 4.x or 5.x is the latest
- **Current**:
  - Django 6.0
- **Impact**: Django 4/5 code is mostly compatible, but installing legacy versions for new projects is inappropriate
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

### ruff — 2024
- **Outdated**: `flake8` + `black` + `isort` combo is the Python linting standard
- **Current**:
  - ruff — All-in-one replacement for flake8 + black + isort
  - Linting: `ruff check .`
  - Formatting: `ruff format .`
  - Auto-fix: `ruff check --fix .`
  - Rust-based, 10-100x faster than flake8
  - Config: `[tool.ruff]` section in `pyproject.toml`
- **Impact**: flake8/black/isort combo works but is slow with fragmented config. Modern projects default to ruff.
- **Lookup**: `pip index versions ruff | head -1`

### FastAPI — 2024
- **Outdated**: FastAPI 0.90-0.100 range is the latest
- **Current**:
  - FastAPI
  - Full Pydantic v2 support
  - `lifespan` event handler (on_event is deprecated)
- **Impact**: Low (good backwards compatibility); just use accurate version numbers
- **Lookup**: `pip index versions fastapi | head -1`
