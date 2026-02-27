# Git Workflow

## 커밋 메시지

```
type(scope): description
```

### Type

`feat`, `fix`, `refactor`, `test`, `docs`, `chore`

### Scope

`cli`, `core`, `skill`, `hook`, `ui`

### Correction 변경

- 새 correction 추가: `feat(skill): add {ecosystem} corrections`
- 기존 correction 수정: `fix(skill): update {entry-id} version`

## 브랜치

- `main` — 안정 브랜치
- `feat/{description}` — 기능 브랜치
- `fix/{description}` — 버그 수정

## 푸시 전 필수

```bash
tsc --noEmit && bun test
```

두 체크 모두 통과해야 푸시 가능.
