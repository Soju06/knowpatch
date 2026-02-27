# Git Workflow

## Commit Messages

```
type(scope): description
```

### Type

`feat`, `fix`, `refactor`, `test`, `docs`, `chore`

### Scope

`cli`, `core`, `skill`, `hook`, `ui`

### Correction Changes

- New correction: `feat(skill): add {ecosystem} corrections`
- Update existing correction: `fix(skill): update {entry-id} version`

## Branches

- `main` — stable branch
- `feat/{description}` — feature branch
- `fix/{description}` — bugfix branch

## Pre-push Requirements

```bash
tsc --noEmit && bun test
```

Both checks must pass before pushing.
