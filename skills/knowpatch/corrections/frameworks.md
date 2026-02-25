---
ecosystem: frameworks
description: Framework major version breaking changes
tags: [next, nextjs, svelte, vue, nuxt, astro, remix, angular, framework]
last_updated: "2026-02-24"
entries:
  - id: nextjs
    package: "next"
    lookup: "npm view next version"
    cached_version: null
    last_checked: "2026-02-24"
  - id: svelte
    package: "svelte"
    lookup: "npm view svelte version"
    cached_version: null
    last_checked: "2026-02-24"
  - id: nuxt
    package: "nuxt"
    lookup: "npm view nuxt version"
    cached_version: null
    last_checked: "2026-02-24"
  - id: astro
    package: "astro"
    lookup: "npm view astro version"
    cached_version: null
    last_checked: "2026-02-24"
---

# Frameworks — Version Corrections

> Last updated: 2026-02-24

## Table of Contents
- [Next.js 16](#nextjs-16)
- [Svelte 5](#svelte-5)
- [Nuxt 4](#nuxt-4)
- [Astro 5](#astro-5)

---

### Next.js 16 — 2025
- **Wrong (training data)**: Next.js 13 or 14 is the latest, Pages Router is mainstream
- **Correct (current)**:
  - Next.js 16 (npm view → 16.1.6)
  - App Router is the default (Pages Router is legacy)
  - Server Components are the default
  - `next/image`, `next/font` with automatic optimization
  - React 19 based
  - Turbopack is the default bundler (replaces webpack)
- **Impact**: Generating Pages Router-based code produces legacy patterns; new projects must use App Router
- **Lookup**: `npm view next version`

### Svelte 5 — 2024-10
- **Wrong (training data)**: Svelte 4, reactive declarations `$:`, stores `$store`
- **Correct (current)**:
  - Svelte 5 (npm view → 5.53.3)
  - **Runes** system — complete reactivity redesign:
    - `$state` — Reactive state declaration
    - `$derived` — Derived values (replaces `$:`)
    - `$effect` — Side effects (replaces `$:`)
    - `$props` — Component props
    - `$bindable` — Two-way binding props
  - `$:` reactive declaration — deprecated
  - Svelte stores (`writable`, `readable`) — replaceable with runes
  - Events: `onclick={handler}` (lowercase), NOT `on:click` — Svelte 5 uses `onclick`
- **Impact**: Writing Svelte 4 syntax causes deprecation warnings; new projects require runes
- **Lookup**: `npm view svelte version`

### Nuxt 4 — 2025
- **Wrong (training data)**: Nuxt 3 is the latest
- **Correct (current)**:
  - Nuxt 4 (npm view → 4.3.1)
  - Vue 3 based (maintained)
- **Impact**: Low; Nuxt 3 code is mostly compatible
- **Lookup**: `npm view nuxt version`

### Astro 5 — 2024
- **Wrong (training data)**: Astro 3 or 4 is the latest
- **Correct (current)**:
  - Astro 5 (npm view → 5.17.3)
  - Content Layer API improvements
  - Server Islands
- **Impact**: Low (good backwards compatibility)
- **Lookup**: `npm view astro version`
