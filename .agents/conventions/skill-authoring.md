# Skill Authoring Conventions

Principles for writing knowpatch skills/corrections. **Core convention** for this project.

## §1 Prompt Writing Principles

- **Intent Over Implementation**: Describe "what needs to be known", not "which tools to call"
- **No Micro-Managing**: Do not specify tool call sequences, response formats, or branching logic
- **Readability**: SKILL.md alone should convey purpose and scope
- **Conciseness**: Remove content that does not change agent behavior

## §2 Correction Entry Quality Standards

### Required YAML Frontmatter Fields

```yaml
ecosystem: "javascript"           # ecosystem identifier
description: "React 19 changes"   # one-line description
tags: ["react", "hooks"]          # lowercase tags
last_updated: "2026-02-27"        # ISO date
```

### Required Markdown Body Sections

Every correction entry **must** include these 4 sections:

| Section | Purpose |
|---------|---------|
| **Wrong** | Incorrect code/info the agent might generate |
| **Correct** | Currently correct code/info |
| **Impact** | Real-world effect when wrong (build failure, runtime error, etc.) |
| **Lookup** | Verification command (`npm view`, `pip index versions`, etc.) |

### Quality Checklist

| Criterion | Description |
|-----------|-------------|
| Specificity | Are version numbers and API names explicitly stated? |
| Verifiability | Can it be auto-verified via lookup command? |
| Impact clarity | Is the consequence of being wrong clear? |
| Freshness | Is last_updated within 6 months? |
| Completeness | Are all 4 sections (Wrong/Correct/Impact/Lookup) present? |
| Deletion rule | Entries older than 2 years should be reviewed for removal |

## §3 YAML Frontmatter Consistency

- Tags use **lowercase-hyphen** format (`next-js`, `react-hooks`)

## §4 File Organization

### When to Create a New File

- Adding to an existing file would exceed 150 lines
- Covering an entirely new ecosystem

### Naming

- **Lowercase-hyphen**: `ai-models.md`, `cli-tools.md`
- Ecosystem-based: `javascript.md`, `python.md`, `runtimes.md`

## §5 SKILL.md Structure

| Section | Purpose |
|---------|---------|
| Name + Description | One-line identification |
| Activation Triggers | When is this skill activated? |
| Workflow | Execution flow overview |
| Commands | CLI command reference |
| Correction Format | Entry structure explanation |
| Update Procedure | Maintenance procedure |

### Size Limits

| File | Recommended | Maximum |
|------|-------------|---------|
| SKILL.md | 200 lines | 300 lines |
| Correction files | 150 lines | 250 lines |

## §6 Review Checklist

Verify before merge:

- [ ] No YAML frontmatter parsing errors
- [ ] All 4 sections (Wrong/Correct/Impact/Lookup) present
- [ ] Tags are lowercase-hyphen
- [ ] Lookup command actually works
- [ ] Within file size limits
