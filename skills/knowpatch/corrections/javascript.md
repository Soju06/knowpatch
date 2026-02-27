---
ecosystem: javascript
description: JS/TS library API changes
tags: [zod, react, typescript, npm, bun, deno, pnpm, esm, types, javascript, js, ts]
last_updated: "2026-02-24"
---

# JavaScript/TypeScript — Version Corrections

> Last updated: 2026-02-24

## Table of Contents
- [Zod 4](#zod-4)
- [React 19](#react-19)
- [TypeScript 5.9](#typescript-59)

---

### Zod 4 — 2025
- **Outdated**: Zod 3.x with `z.string().email()`, `z.string().uuid()` method chaining
- **Current**: Zod 4

**Key API change — string format validators moved to top-level:**

| Zod 3 (deprecated) | Zod 4 (correct) | Notes |
|---------------------|-----------------|-------|
| `z.string().email()` | `z.email()` | Method form deprecated |
| `z.string().uuid()` | `z.uuid()` | Strict RFC 9562 validation |
| `z.string().url()` | `z.url()` | |
| `z.string().emoji()` | `z.emoji()` | |
| `z.string().base64()` | `z.base64()` | |
| `z.string().base64url()` | `z.base64url()` | No padding allowed |
| `z.string().nanoid()` | `z.nanoid()` | |
| `z.string().cuid()` | `z.cuid()` | |
| `z.string().cuid2()` | `z.cuid2()` | |
| `z.string().ulid()` | `z.ulid()` | |
| `z.string().ip()` | `z.ipv4()` / `z.ipv6()` | Split; combine with `z.union([z.ipv4(), z.ipv6()])` |
| `z.string().cidr()` | `z.cidrv4()` / `z.cidrv6()` | Split |
| `z.string().datetime()` | `z.iso.datetime()` | Moved to ISO namespace |
| `z.string().date()` | `z.iso.date()` | |
| `z.string().time()` | `z.iso.time()` | |
| `z.string().duration()` | `z.iso.duration()` | |

**UUID changes:**
- `z.uuid()` — Strict RFC 9562/4122 validation (checks variant bits)
- `z.guid()` — Loose 8-4-4-4-12 hex pattern (equivalent to old `z.string().uuid()` behavior)

**Object-related changes:**

| Zod 3 | Zod 4 | Notes |
|-------|-------|-------|
| `z.object().strict()` | `z.strictObject()` | Method deprecated |
| `z.object().passthrough()` | `z.looseObject()` | Method deprecated |
| `z.object().merge(other)` | `.extend(other.shape)` or `{...A.shape, ...B.shape}` | `.merge()` deprecated |
| `z.object().deepPartial()` | Removed | Removed in Zod 4 |
| `z.object().strip()` | Removed | Default behavior, unnecessary |

**Error handling changes:**

| Zod 3 | Zod 4 |
|-------|-------|
| `{ message: "..." }` | `{ error: "..." }` (message deprecated) |
| `{ errorMap: fn }` | `{ error: fn }` (can return string) |
| `invalid_type_error` / `required_error` | `{ error: (issue) => ... }` |
| `err.format()` | `z.treeifyError(err)` |
| `err.flatten()` | `z.treeifyError(err)` |
| `err.addIssue()` | `err.issues.push(...)` |

**Other major changes:**

| Zod 3 | Zod 4 | Notes |
|-------|-------|-------|
| `z.nativeEnum(MyEnum)` | `z.enum(MyEnum)` | Overloaded |
| `z.record(valueSchema)` | `z.record(keySchema, valueSchema)` | Single argument **not allowed** |
| `.default(inputValue)` | `.default(outputValue)` | Based on output type; use `.prefault()` for old behavior |
| `z.function().args().returns()` | `z.function({ input: [...], output })` | API completely changed |
| `z.coerce.string()` input: `string` | `z.coerce.string()` input: `unknown` | Type changed |
| `z.promise()` | Deprecated | Use `await` then parse instead |
| `ZodType<Out, Def, In>` | `ZodType<Out, In>` | Def parameter removed |
| `z.ZodTypeAny` | `z.ZodType` | Same |
| `z.ostring()`, `z.onumber()` | Removed | |
| `.refine()` type predicate narrowing | Ignored | Type narrowing not supported in Zod 4 |

**Migration tool**: `zod-v3-to-v4` (community codemod)
- **Lookup**: `npm view zod version`

---

### React 19 — 2024-12
- **Outdated**: React 18 is the latest, `@types/react` must be installed separately, `forwardRef` is required
- **Current**:
  - React 19
  - `@types/react` is **not needed** as a separate install (built into React 19)
  - `forwardRef` is **unnecessary** — `ref` is passed as a regular prop
  - `use` hook — Read Promises and Context directly
  - Server Components stabilized
  - `<form>` Actions — Bind server actions via `action` prop
  - `useActionState` — Form action state management
  - `useOptimistic` — Optimistic updates
  - `ref` callback cleanup function support
- **Impact**: Installing `@types/react` separately causes type conflicts; using `forwardRef` adds unnecessary complexity
- **Lookup**: `npm view react version`

---

### TypeScript 5.9 — 2025
- **Outdated**: TypeScript 5.3-5.5 is the latest
- **Current**:
  - TypeScript 5.9
  - `moduleResolution: "bundler"` now the default
  - `satisfies` operator stabilized
  - `import type` auto-separation improved
- **Impact**: Low (good backwards compatibility)
- **Lookup**: `npm view typescript version`
