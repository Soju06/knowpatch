---
ecosystem: runtimes
description: Runtime version tracks, LTS status
tags: [node, python, bun, deno, go, java, runtime]
version: "0.4.1" # x-release-please-version
last_updated: "2026-03-10"
---

# Runtimes — Version Corrections

> Last updated: 2026-03-10

## Table of Contents
- [Node.js](#nodejs)
- [Python](#python)
- [Bun](#bun)
- [Deno](#deno)

---

### Node.js — 2026-03
- **Outdated**: Node.js 18 or 20 is the current LTS
- **Current** (verified via nodejs.org):
  - **Node 25** — Current (v25.8.0, 2026-03-03)
  - **Node 24** — Active LTS (Krypton, v24.14.0, 2026-02-24)
  - **Node 22** — Maintenance LTS (Jod, v22.22.1, 2026-03-04)
  - **Node 20** — Maintenance LTS (v20.20.1, 2026-03-04)
  - **Node 18** — **EOL** (end of life)
  - Node 23 — EOL
- **Minimum support baseline** (major tools as of 2026):
  - ESLint 10: Node.js ^20.19.0 || ^22.13.0 || >=24.0.0
  - Most modern tools: Node 20+ required
- **Impact**: Using Node 18 may cause compatibility issues with major tools; new projects should target Node 24 LTS
- **Lookup**: `node --version` (local), nodejs.org/en/about/previous-releases (full release list)

### Python — 2026-03
- **Outdated**: Python 3.11 or 3.12 is the latest stable
- **Current**:
  - **Python 3.14.3** — Current stable (2026-02-03)
  - Free-threaded Python **officially supported** (PEP 779, no longer experimental)
  - t-strings (PEP 750), deferred annotations (PEP 649)
  - `compression.zstd` module, `concurrent.interpreters` stdlib
  - JIT compiler in macOS/Windows binaries (experimental)
  - **No PGP signatures** — Sigstore only (PEP 761)
  - Python 3.13 — Previous stable, still maintained
  - Python 3.10 — Security-only, EOL Oct 2026
- **Impact**: Python 3.14 is the recommended version for new projects. Free-threaded support enables true multi-threading.
- **Lookup**: `python3 --version` (local)

### Bun — 2026-03
- **Outdated**: Bun 1.0 was recently released
- **Current**:
  - Bun 1.3.10 (2026-02-26)
  - Node.js compatibility significantly improved
  - Built-in bundler, test runner, package manager
- **Impact**: Low
- **Lookup**: `bun --version` (local), `npm view bun version`

### Deno — 2026-03
- **Outdated**: Deno 1.x
- **Current**:
  - Deno 2.7.4 (2026-03-05)
  - npm compatibility greatly enhanced (`npm:` prefix for direct npm package usage)
  - `deno.json` config file
  - Node.js API compatibility layer improved
- **Impact**: Deno 1 style code is mostly compatible, but npm compatibility support is worth noting
- **Lookup**: `deno --version` (local), `npm view deno version`
