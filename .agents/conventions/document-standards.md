# Document Standards

File size, structure, and navigation rules.

## File Size Limits

| File | Recommended | Maximum |
|------|-------------|---------|
| CLAUDE.md | 80 lines | 120 lines |
| Convention files | 50 lines | 100 lines |
| SKILL.md | 200 lines | 300 lines |
| Correction files | 150 lines | 250 lines |

## TOC (Table of Contents)

Required when any of the following conditions are met:

- 200+ lines
- 5+ H2 headings

## Progressive Disclosure

Structure information in 4 levels of depth:

| Level | File | Purpose |
|-------|------|---------|
| L1 | `CLAUDE.md` | Project overview, key rules, index |
| L2 | `conventions/*.md` | Detailed coding/docs/workflow rules |
| L3 | `skills/*/SKILL.md` | Per-skill usage guide |
| L4 | `skills/*/corrections/*.md` | Individual correction entries |

## YAML Frontmatter

Required fields for correction file YAML frontmatter:

```yaml
ecosystem: string       # lowercase (javascript, python, ...)
description: string     # one-line description
tags: string[]          # lowercase-hyphen format
last_updated: string    # ISO date (YYYY-MM-DD)
```

## Navigation

- Use relative paths (`./conventions/skill-authoring.md`)
- CLAUDE.md convention table serves as index
- No circular references — link only from parent to child

## Markdown Style

- Headings: `#` to `###` (no 4th level or deeper)
- Tables: use actively for comparisons
- Code blocks: language tag required (```yaml, ```typescript)
- Blank lines: 1 line before and after headings
