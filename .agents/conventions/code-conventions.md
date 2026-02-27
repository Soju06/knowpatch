# Code Conventions

TypeScript/Bun project coding standards.

## TypeScript Strict Mode

| Option | Value |
|--------|-------|
| `strict` | `true` |
| `noUncheckedIndexedAccess` | `true` |
| `noUnusedLocals` | `true` |
| `noUnusedParameters` | `true` |

## Module System

- ESM (`"type": "module"`)
- Node.js built-in modules: use `node:` prefix (`import { readFile } from "node:fs/promises"`)
- Relative imports: include `.js` extension
- External packages: bare specifier (`import chalk from "chalk"`)

## Layer Separation

```
commands/ (CLI commands)
    ↓
  core/ (business logic)
    ↑
  ui/ (output/display)
```

- `core/` must not import from `commands/` or `ui/`
- `commands/` may import from both `core/` and `ui/`
- `ui/` must not import from `core/`

## Type Rules

- No `any` — use concrete types or generics
- No `unknown` — narrow with type guards
- Explicit interface/type definitions for public APIs
- Use utility types actively (`Partial`, `Pick`, `Omit`)

## Testing

- Framework: `bun:test`
- Test public interfaces
- File location: `tests/` (separate from source)
- Naming: `{module}.test.ts`

## Anti-patterns

| Anti-pattern | Correct Approach |
|--------------|------------------|
| `as any` cast | Type guards or generics |
| Hallucinated versions | Verify via package manager |
| `console.log` in `core/` | Separate to `ui/` layer |
| Sync file I/O (`readFileSync`) | `await readFile()` |
| `require()` | ESM `import` |
| Implicit `any` return | Explicit return types |

## Error Handling

- Try-catch only for external I/O (file, network, process)
- Prevent internal logic errors via types
- Catch errors at CLI top-level and output user-friendly messages
- Throw instead of `process.exit(1)` — handle at CLI entry
