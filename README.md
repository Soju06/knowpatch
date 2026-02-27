<!--
About
LLM knowledge cutoff compensator for AI coding agents — corrects outdated versions, deprecated APIs, renamed packages, and removed CLI commands

Topics
typescript bun cli claude-code codex gemini skill knowledge-cutoff llm version deprecated-api breaking-changes

Resources
-->

# knowpatch

LLM knowledge cutoff compensator for AI coding agents. Corrects outdated versions, deprecated APIs, renamed packages, and removed CLI commands — so your agent stops confidently using last year's code.

## Quick Start

```bash
npx knowpatch
```

```
  Knowpatch v0.1.0

? Scope:
❯ User (~/…)
  Project (./)
  ← Exit

? Select platforms:
◉ Claude Code
◯ Codex CLI
◯ Gemini CLI

  ✔ Canonical skill installed
  ✔ Claude Code skill linked
  ✔ Claude Code hook registered
```

Done. Corrections start injecting into your agent automatically.

## What It Corrects

| Wrong (training data) | Correct (current) |
|-----------------------|-------------------|
| `npx shadcn-ui@latest` | `npx shadcn@latest` |
| `z.string().email()` | `z.email()` |
| `.eslintrc` | `eslint.config.js` |
| `claude-3-opus-20240229` | `claude-opus-4-6` |

<details>
<summary>All correction categories</summary>
<br>

| File | Covers |
|------|--------|
| `frontier-models.md` | Claude, GPT, Gemini model IDs |
| `open-source-models.md` | Llama, Mistral, DeepSeek, Qwen, GLM, Kimi |
| `cli-tools.md` | shadcn, tailwind, eslint, vite |
| `frameworks.md` | Next.js, Svelte, Nuxt, Django, FastAPI |
| `javascript.md` | Zod, React, TypeScript |
| `python.md` | Pydantic, Ruff, uv, pip |
| `platforms.md` | Supabase, Vercel, Cloudflare |
| `runtimes.md` | Node.js, Bun, Deno, Python |

</details>

## Development

```bash
bun install && bun run dev
bun run build
bun test
```

## License

MIT
