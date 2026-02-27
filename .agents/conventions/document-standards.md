# Document Standards

파일 크기, 구조, 네비게이션 규칙.

## 파일 크기 제한

| 파일 | 권장 | 최대 |
|------|------|------|
| AGENTS.md | 80줄 | 120줄 |
| Convention 파일 | 50줄 | 100줄 |
| SKILL.md | 200줄 | 300줄 |
| Correction 파일 | 150줄 | 250줄 |

## TOC (Table of Contents)

다음 조건 중 하나 충족 시 TOC 필수:

- 200줄 이상
- H2 헤딩 5개 이상

## Progressive Disclosure

4단계 깊이로 정보를 구조화:

| 레벨 | 파일 | 목적 |
|------|------|------|
| L1 | `AGENTS.md` | 프로젝트 개요, 핵심 규칙, 인덱스 |
| L2 | `conventions/*.md` | 코딩/문서/워크플로 상세 규칙 |
| L3 | `skills/*/SKILL.md` | 스킬별 사용 가이드 |
| L4 | `skills/*/corrections/*.md` | 개별 correction 엔트리 |

## YAML Frontmatter

Correction 파일의 YAML frontmatter 필수 필드:

```yaml
ecosystem: string       # 소문자 (javascript, python, ...)
description: string     # 한 줄 설명
tags: string[]          # 소문자 하이픈 형식
last_updated: string    # ISO 날짜 (YYYY-MM-DD)
```

## 네비게이션

- 상대 경로 사용 (`./conventions/skill-authoring.md`)
- AGENTS.md의 컨벤션 테이블이 인덱스 역할
- 순환 참조 금지 — 상위 → 하위 방향으로만 링크

## 마크다운 스타일

- 헤딩: `#` ~ `###` (4단계 이상 금지)
- 테이블: 정보 비교 시 적극 활용
- 코드 블록: 언어 태그 필수 (```yaml, ```typescript)
- 빈 줄: 헤딩 전후 1줄
