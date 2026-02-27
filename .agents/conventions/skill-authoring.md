# Skill Authoring Conventions

knowpatch 스킬/correction 작성 원칙. 이 프로젝트의 **핵심 컨벤션**.

## §1 프롬프트 작성 원칙

- **Intent Over Implementation**: "무엇을 알아야 하는가"를 기술. "어떤 도구를 호출하라"가 아님
- **No Micro-Managing**: 도구 호출 시퀀스, 응답 포맷, 분기 로직 지정 금지
- **Readability**: SKILL.md만으로 목적과 범위 파악 가능해야 함
- **Conciseness**: 에이전트 행동을 바꾸지 않는 내용은 제거

## §2 Correction 엔트리 품질 기준

### YAML Frontmatter 필수 필드

```yaml
ecosystem: "javascript"           # 생태계 식별자
description: "React 19 변경사항"   # 한 줄 설명
tags: ["react", "hooks"]          # 소문자 태그
last_updated: "2026-02-27"        # ISO 날짜
```

### 마크다운 본문 필수 섹션

모든 correction 엔트리는 다음 4개 섹션을 **반드시** 포함:

| 섹션 | 목적 |
|------|------|
| **Wrong** | 에이전트가 생성할 수 있는 잘못된 코드/정보 |
| **Correct** | 현재 올바른 코드/정보 |
| **Impact** | 틀렸을 때의 실제 영향 (빌드 실패, 런타임 에러 등) |
| **Lookup** | 검증 명령어 (`npm view`, `pip index versions` 등) |

### 품질 체크리스트

| 기준 | 설명 |
|------|------|
| 구체성 | 버전 번호, API 이름이 명시되어 있는가 |
| 검증 가능성 | lookup 명령으로 자동 검증 가능한가 |
| 임팩트 명확성 | 틀렸을 때 어떤 일이 일어나는지 명확한가 |
| 최신성 | last_updated가 6개월 이내인가 |
| 완전성 | Wrong/Correct/Impact/Lookup 4개 모두 있는가 |
| 삭제 규칙 | 2년 이상 지난 엔트리는 삭제 검토 |

## §3 YAML Frontmatter 일관성

- 태그는 **소문자 하이픈** 형식 (`next-js`, `react-hooks`)

## §4 파일 조직

### 새 파일 생성 조건

- 기존 파일에 추가하면 150줄을 초과할 때
- 완전히 새로운 생태계를 다룰 때

### 네이밍

- **소문자 하이픈**: `ai-models.md`, `cli-tools.md`
- 생태계 이름 기반: `javascript.md`, `python.md`, `runtimes.md`

## §5 SKILL.md 구조

| 섹션 | 목적 |
|------|------|
| Name + Description | 한 줄 식별 |
| Activation Triggers | 언제 이 스킬이 활성화되는가 |
| Workflow | 실행 흐름 개요 |
| Commands | CLI 명령어 레퍼런스 |
| Correction Format | 엔트리 구조 설명 |
| Update Procedure | 유지보수 절차 |

### 크기 제한

| 파일 | 권장 | 최대 |
|------|------|------|
| SKILL.md | 200줄 | 300줄 |
| Correction 파일 | 150줄 | 250줄 |

## §6 리뷰 체크리스트

머지 전 확인:

- [ ] YAML frontmatter 파싱 에러 없음
- [ ] Wrong/Correct/Impact/Lookup 4개 섹션 모두 존재
- [ ] 태그 소문자 하이픈
- [ ] lookup 명령어 실제 동작 확인
- [ ] 파일 크기 제한 이내
