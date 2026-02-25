---
ecosystem: cli-tools
description: CLI tool renames, command changes, major versions
tags: [shadcn, tailwind, eslint, create-react-app, vite, webpack, prettier, cli]
last_updated: "2026-02-24"
entries:
  - id: shadcn
    package: "shadcn"
    lookup: "npm view shadcn version"
    cached_version: null
    last_checked: "2026-02-24"
  - id: tailwind-css
    package: "tailwindcss"
    lookup: "npm view tailwindcss version"
    cached_version: null
    last_checked: "2026-02-24"
  - id: eslint
    package: "eslint"
    lookup: "npm view eslint version"
    cached_version: null
    last_checked: "2026-02-24"
  - id: vite
    package: "vite"
    lookup: "npm view vite version"
    cached_version: null
    last_checked: "2026-02-24"
---

# CLI Tools — Version Corrections

> Last updated: 2026-02-24

## Table of Contents
- [shadcn (formerly shadcn-ui)](#shadcn)
- [Tailwind CSS v4](#tailwind-css-v4)
- [ESLint 10](#eslint-10)
- [Create React App (Deprecated)](#create-react-app)
- [Vite 7](#vite-7)

---

### shadcn — 2025-10
- **Wrong (training data)**: Package name `shadcn-ui`, install command `npx shadcn-ui@latest init`
- **Correct (current)**:
  - Package name: `shadcn` (npm view → 3.8.5)
  - Install: `npx shadcn@latest init`
  - The `shadcn-ui` package is discontinued — **it does not work**
  - shadcn dropped Tailwind CSS 3 support — **Tailwind 4 is required**
- **Impact**: `npx shadcn-ui@latest` fails or installs a broken version. Using with Tailwind 3 causes incompatibility.
- **Lookup**: `npm view shadcn version`

### Tailwind CSS v4 — 2025-03
- **Wrong (training data)**: Tailwind v3 is the current version, configured via `tailwind.config.js`, requires PostCSS plugin, `content: [...]` array is mandatory
- **Correct (current)**:
  - Tailwind CSS v4 (npm view → 4.2.1)
  - CSS-first configuration: use `@theme` directive directly in CSS files
  - `tailwind.config.js` is unnecessary (for new projects)
  - PostCSS plugin: `@tailwindcss/postcss` (npm view → 4.2.1)
  - Vite plugin: `@tailwindcss/vite` (npm view → 4.2.1)
  - Content detection is automatic — `content: [...]` config is unnecessary
  - CSS variable-based styling recommended over `@apply`
- **Impact**: Creating projects with Tailwind v3 config produces outdated code; incompatible with shadcn
- **Migration**: `npx @tailwindcss/upgrade`
- **Lookup**: `npm view tailwindcss version`

### ESLint 10 — 2026-01
- **Wrong (training data)**: ESLint 8/9, config files `.eslintrc.js` / `.eslintrc.json` / `.eslintrc.yaml`
- **Correct (current)**:
  - ESLint 10 (npm view → 10.0.2)
  - `.eslintrc.*` files are **completely removed** (not deprecated — **removed**)
  - **Only config format**: `eslint.config.js` (flat config)
  - `.eslintignore` → `ignores` array inside config
  - `--env` CLI flag removed
  - `/* eslint-env browser */` comments → **cause errors**
  - `LegacyESLint` API completely removed
  - Requires Node.js 20.19.0+ (Node 18 is unsupported)
  - Monorepos: config search is based on file directory (not CWD)
  - JSX reference tracking improved (`no-unused-vars` accuracy for JSX)
  - Uses `@eslint/js` (npm view → 10.0.1)
  - Migration: `npx @eslint/migrate-config .eslintrc.json`
- **Impact**: Creating `.eslintrc.*` files causes them to be completely ignored by ESLint 10. `/* eslint-env */` comments cause errors.
- **Lookup**: `npm view eslint version`

### Create React App — Deprecated
- **Wrong (training data)**: `npx create-react-app my-app` for React project creation
- **Correct (current)**:
  - Create React App (CRA) is **officially deprecated**
  - Alternative: `npm create vite@latest` (Vite-based)
  - Or: Next.js (`npx create-next-app@latest`), Remix
  - React official docs recommend frameworks instead of CRA
- **Impact**: CRA-generated projects use legacy webpack, slow builds, no maintenance
- **Lookup**: `npm view create-react-app version` (to verify last release date)

### Vite 7 — 2025
- **Wrong (training data)**: Vite 5 is the latest
- **Correct (current)**:
  - Vite 7 (npm view → 7.3.1)
  - Environment API introduced (from v6)
  - Create projects with `npm create vite@latest`
- **Impact**: Low (good backwards compatibility), but new projects should use the latest version
- **Lookup**: `npm view vite version`
