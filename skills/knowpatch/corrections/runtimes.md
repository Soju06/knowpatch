---
ecosystem: runtimes
description: Runtime version tracks, LTS status
tags: [node, python, bun, deno, go, java, runtime]
last_updated: "2026-02-24"
---

# Runtimes — Version Corrections

> Last updated: 2026-02-24

## Table of Contents
- [Node.js](#nodejs)
- [Python](#python)
- [Bun](#bun)
- [Deno](#deno)

---

### Node.js — 2026-02
- **Wrong (training data)**: Node.js 18 or 20 is the current LTS
- **Correct (current)** (verified via nodejs.org):
  - **Node 24** — Active LTS (Krypton), released 2025-05-06
  - **Node 25** — Current, released 2025-10-15
  - **Node 22** — Maintenance LTS (Jod)
  - **Node 20** — Maintenance LTS (still supported, 20.19.0+)
  - **Node 18** — **EOL** (end of life)
  - Node 23 — EOL
- **Minimum support baseline** (major tools as of 2026):
  - ESLint 10: Node.js ^20.19.0 || ^22.13.0 || >=24.0.0
  - Most modern tools: Node 20+ required
- **Impact**: Using Node 18 causes incompatibility with major tools; new projects should target Node 24 LTS
- **Lookup**: `node --version` (local), nodejs.org/en/about/previous-releases (full release list)

### Python — 2026-02
- **Wrong (training data)**: Python 3.11 or 3.12 is the latest stable
- **Correct (current)**:
  - **Python 3.13** — Stable (recommended for production)
  - Free-threaded experimental support (GIL disable option)
  - `typing` module simplification in progress
- **Impact**: Low; 3.11/3.12 code is mostly compatible with 3.13
- **Lookup**: `python3 --version` (local)

### Bun — 2026-02
- **Wrong (training data)**: Bun 1.0 was recently released
- **Correct (current)**:
  - Bun 1.3.x stable
  - Node.js compatibility significantly improved
  - Built-in bundler, test runner, package manager
- **Impact**: Low
- **Lookup**: `bun --version` (local), `npm view bun version`

### Deno — 2026-02
- **Wrong (training data)**: Deno 1.x
- **Correct (current)**:
  - Deno 2.x
  - npm compatibility greatly enhanced (`npm:` prefix for direct npm package usage)
  - `deno.json` config file
  - Node.js API compatibility layer improved
- **Impact**: Deno 1 style code is mostly compatible, but failing to mention npm compatibility is a disservice
- **Lookup**: `deno --version` (local), `npm view deno version`
