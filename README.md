# Knowpatch

LLM knowledge cutoff compensator for Claude Code. Corrects outdated versions, deprecated APIs, renamed packages, and removed CLI commands.

## Why

LLM training data lags 1-2 years behind reality. When Claude Code generates `package.json`, scaffolds a project, or suggests an install command, it confidently uses **outdated** version numbers and **deprecated** APIs.

Knowpatch fixes this through two mechanisms:

1. **Knowledge Corrections** — Pre-loaded fixes for breaking changes (`shadcn-ui` → `shadcn`, `z.string().email()` → `z.email()`, `.eslintrc` → `eslint.config.js`, etc.)
2. **Live Lookup Rules** — Enforces package manager queries (`npm view`, `pip index versions`) as the single source of truth

## Install

```bash
# Install globally
npm install -g knowpatch

# Or run directly
npx knowpatch
```

### Register as Claude Code skill

```bash
knowpatch install            # user-level (default)
knowpatch install --scope project  # project-level
```

This creates a symlink so Claude Code automatically loads the skill.

## CLI Commands

| Command | Description |
|---------|-------------|
| `knowpatch install` | Install the skill by creating a symlink |
| `knowpatch uninstall` | Remove the skill symlink |
| `knowpatch check` | Validate corrections against live package data (OK / DRIFT / ERROR) |
| `knowpatch update` | Run live lookups and update drifted entries |

Running `knowpatch` with no arguments opens an interactive menu.

## Corrections

Corrections are organized by category in `skills/knowpatch/corrections/`:

| File | Covers |
|------|--------|
| `ai-models.md` | Claude, GPT, Gemini model IDs and naming |
| `cli-tools.md` | shadcn, tailwind, eslint, vite CLI changes |
| `frameworks.md` | Next.js, Svelte, Nuxt, Django, FastAPI |
| `javascript.md` | Zod, React, TypeScript API changes |
| `platforms.md` | Supabase, Vercel, Cloudflare |
| `python.md` | Pydantic, Ruff, uv, pip |
| `runtimes.md` | Node.js, Bun, Deno, Python versions |

Each entry follows a standard format:

```markdown
### {Topic} — {YYYY-MM}
- **Wrong (training data)**: What the model would answer
- **Correct (current)**: Actual current state
- **Impact**: What goes wrong if outdated info is used
- **Lookup**: Package manager verification command
```

## Development

```bash
# Install dependencies
bun install

# Run in dev mode
bun run dev

# Build
bun run build

# Run tests
bun test
```

## License

MIT
