---
ecosystem: cli-tools
description: CLI tool renames, command changes, major versions
tags: [shadcn, tailwind, eslint, create-react-app, vite, webpack, prettier, cli]
last_updated: "2026-02-24"
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
- **Outdated**: Package name `shadcn-ui`, install command `npx shadcn-ui@latest init`
- **Current**:
  - Package name: `shadcn`
  - Install: `npx shadcn@latest init`
  - The `shadcn-ui` package is discontinued — use `shadcn` package instead
  - shadcn dropped Tailwind CSS 3 support — **Tailwind 4 is required**
- **Impact**: `npx shadcn-ui@latest` fails or installs a broken version. Using with Tailwind 3 causes incompatibility.
- **Lookup**: `npm view shadcn version`

### Tailwind CSS v4 — 2025-03
- **Outdated**: Tailwind v3 is the current version, configured via `tailwind.config.js`, requires PostCSS plugin, `content: [...]` array is mandatory
- **Current**:
  - Tailwind CSS v4
  - CSS-first configuration: use `@theme` directive directly in CSS files
  - `tailwind.config.js` is unnecessary (for new projects)
  - PostCSS plugin: `@tailwindcss/postcss`
  - Vite plugin: `@tailwindcss/vite`
  - Content detection is automatic — `content: [...]` config is unnecessary
  - CSS variable-based styling recommended over `@apply`
- **Impact**: Creating projects with Tailwind v3 config produces outdated code; incompatible with shadcn
- **Migration**: `npx @tailwindcss/upgrade`
- **Lookup**: `npm view tailwindcss version`

### ESLint 10 — 2026-01
- **Outdated**: ESLint 8/9, config files `.eslintrc.js` / `.eslintrc.json` / `.eslintrc.yaml`
- **Current**:
  - ESLint 10
  - `.eslintrc.*` files are no longer supported — use `eslint.config.js`
  - **Only config format**: `eslint.config.js` (flat config)
  - `.eslintignore` → `ignores` array inside config
  - `--env` CLI flag removed
  - `/* eslint-env browser */` comments → no longer recognized
  - `LegacyESLint` API removed
  - Requires Node.js 20.19.0+ (Node 18 is unsupported)
  - Monorepos: config search is based on file directory (not CWD)
  - JSX reference tracking improved (`no-unused-vars` accuracy for JSX)
  - Uses `@eslint/js`
  - Migration: `npx @eslint/migrate-config .eslintrc.json`
- **Impact**: Creating `.eslintrc.*` files causes them to be completely ignored by ESLint 10. `/* eslint-env */` comments cause errors.
- **Lookup**: `npm view eslint version`

### Create React App — Deprecated
- **Outdated**: `npx create-react-app my-app` for React project creation
- **Current**:
  - Create React App (CRA) is **officially deprecated**
  - Alternative: `npm create vite@latest` (Vite-based)
  - Or: Next.js (`npx create-next-app@latest`), Remix
  - React official docs recommend frameworks instead of CRA
- **Impact**: CRA-generated projects use legacy webpack, slow builds, no maintenance
- **Lookup**: `npm view create-react-app version` (to verify last release date)

### Vite 7 — 2025
- **Outdated**: Vite 5 is the latest
- **Current**:
  - Vite 7
  - Environment API introduced (from v6)
  - Create projects with `npm create vite@latest`
- **Impact**: Low (good backwards compatibility), but new projects should use the latest version
- **Lookup**: `npm view vite version`
