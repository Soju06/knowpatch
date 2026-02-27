# Knowpatch

AI 코딩 에이전트용 knowledge patch(스킬/correction) 관리 CLI 도구.

## Environment

| 항목 | 값 |
|------|-----|
| Runtime | Bun |
| Language | TypeScript (strict mode) |
| Package Manager | bun |
| Build | `bun run build` |
| Test | `bun test` |
| Type Check | `tsc --noEmit` |

## 프로젝트 컨텍스트

knowpatch는 **두 종류의 훅**을 다룬다:

| 구분 | 위치 | 목적 |
|------|------|------|
| **제품 훅** | `src/hooks/` | knowpatch가 설치하는 사용자용 훅 (detect.ts) |
| **개발 훅** | `.agents/hooks/` | 이 프로젝트 개발 시 품질 관리용 훅 (Python) |

`skills/knowpatch/`의 SKILL.md와 corrections/는 **제품 파일**이다.
코드 변경 후 반드시 타입체크+테스트를 통과한 뒤 스킬 파일을 수정한다.

## 코드 컨벤션 핵심

- TypeScript strict mode — `any`/`unknown` 금지
- ESM 모듈, `node:` 접두사, `.js` 확장자 임포트
- 레이어 분리: `commands/` → `core/` → `ui/` (core는 상위 임포트 금지)
- 버전/패키지 정보 추측 금지 — 패키지매니저로 직접 검증
- 상세: [code-conventions.md](./.agents/conventions/code-conventions.md)

## Quality Gate

코드 수정 후 반드시 실행:

```bash
tsc --noEmit && bun test
```

개발 훅이 dirty 상태를 추적하며, 미실행 시 Stop 훅에서 차단한다.

## 프로젝트 구조

| 디렉토리 | 역할 |
|----------|------|
| `src/commands/` | CLI 명령어 (install, uninstall) |
| `src/core/` | 비즈니스 로직 (parser, paths, hooks) |
| `src/ui/` | 터미널 출력 (palette, spinner, interactive) |
| `src/hooks/` | 제품 훅 (detect.ts) |
| `skills/knowpatch/` | **제품 파일** — SKILL.md + corrections/ |
| `tests/` | bun:test 테스트 |
| `bin/` | 빌드 출력 (gitignore) |
| `.agents/hooks/` | 개발 훅 (Python) |
| `.agents/conventions/` | 코딩/작성 표준 |
| `.agents/skills/` | 스킬 트리거/가드레일 규칙 |

## 컨벤션 인덱스

| 컨벤션 | 파일 | 핵심 내용 |
|--------|------|-----------|
| 코드 표준 | [code-conventions.md](./.agents/conventions/code-conventions.md) | TS strict, 레이어 분리, 안티패턴 |
| 스킬 작성 | [skill-authoring.md](./.agents/conventions/skill-authoring.md) | 프롬프트 원칙, correction 품질, YAML 규칙 |
| 문서 표준 | [document-standards.md](./.agents/conventions/document-standards.md) | 크기 제한, TOC, Progressive Disclosure |
| Git 워크플로 | [git-workflow.md](./.agents/conventions/git-workflow.md) | 커밋 규칙, 브랜치, 푸시 전 체크 |
