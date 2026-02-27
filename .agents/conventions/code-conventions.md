# Code Conventions

TypeScript/Bun 프로젝트 코딩 표준.

## TypeScript Strict Mode

| 옵션 | 값 |
|------|-----|
| `strict` | `true` |
| `noUncheckedIndexedAccess` | `true` |
| `noUnusedLocals` | `true` |
| `noUnusedParameters` | `true` |

## Module System

- ESM (`"type": "module"`)
- Node.js 내장 모듈: `node:` 접두사 사용 (`import { readFile } from "node:fs/promises"`)
- 상대 임포트: `.js` 확장자 포함
- 외부 패키지: bare specifier (`import chalk from "chalk"`)

## 레이어 분리

```
commands/ (CLI 명령)
    ↓
  core/ (비즈니스 로직)
    ↑
  ui/ (출력/표시)
```

- `core/`는 `commands/`, `ui/`를 임포트하지 않음
- `commands/`는 `core/`와 `ui/` 모두 임포트 가능
- `ui/`는 `core/`를 임포트하지 않음

## 타입 규칙

- `any` 사용 금지 — 구체적 타입 또는 제네릭 사용
- `unknown` 사용 금지 — 타입 가드로 좁히기
- 공개 API에 명시적 인터페이스/타입 정의
- 유틸리티 타입 적극 활용 (`Partial`, `Pick`, `Omit`)

## 테스트

- 프레임워크: `bun:test`
- 공개 인터페이스 중심 테스트
- 파일 위치: `tests/` (소스와 분리)
- 네이밍: `{module}.test.ts`

## 안티패턴

| 안티패턴 | 올바른 접근 |
|----------|-------------|
| `as any` 캐스트 | 타입 가드 또는 제네릭 |
| 추측 버전 (hallucinated) | 패키지매니저로 직접 검증 |
| `core/`에서 `console.log` | `ui/` 레이어로 분리 |
| 동기 파일 I/O (`readFileSync`) | `await readFile()` |
| `require()` | ESM `import` |
| 암시적 `any` 반환 | 명시적 반환 타입 |

## 에러 처리

- 외부 I/O (파일, 네트워크, 프로세스)만 try-catch
- 내부 로직 오류는 타입으로 방지
- CLI 최상위에서 에러 잡아 사용자 친화적 메시지 출력
- `process.exit(1)` 대신 throw → CLI 엔트리에서 처리
