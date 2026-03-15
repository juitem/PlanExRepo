# ADR_INDEX — Architecture Decision Record 인덱스

> **목적**: 모든 ADR의 목록, 상태, 관계를 한 곳에서 추적한다.
> **갱신 규칙**: 새 ADR 생성 시 이 인덱스에 즉시 추가해야 한다.

---

## ADR 운영 규칙

1. **결정 전 ADR 먼저**: 아키텍처/기술/인터페이스 결정 시 구현 전에 ADR을 생성한다
2. **상태 관리**: ADR 상태는 `proposed → accepted → deprecated/superseded` 단방향 전이
3. **Supersede 규칙**: 기존 ADR을 대체할 때는 새 ADR을 생성하고, 기존 ADR의 상태를 `superseded by ADR-XXXX` 로 변경
4. **삭제 금지**: ADR은 삭제하지 않는다. 폐기 시 상태를 `deprecated` 로 변경
5. **인덱스 동기화**: ADR 생성/상태 변경 시 이 파일을 즉시 갱신

---

## ADR 상태 정의

| 상태 | 의미 |
|------|------|
| `proposed` | 제안됨, 아직 확정 안 됨 |
| `accepted` | 채택됨, 현재 유효한 결정 |
| `deprecated` | 더 이상 유효하지 않음 (대체 ADR 없음) |
| `superseded by ADR-XXXX` | 다른 ADR로 대체됨 |

---

## ADR 목록

### 현재 유효한 ADR

| ID | 제목 | 날짜 | 상태 | 관련 Job |
|----|------|------|------|----------|
| [ADR-0001](ADR-0001-doc-based-devops.md) | 문서 기반 AI 에이전트 개발 운영체계 채택 | 2026-03-15 | `accepted` | 전체 |
| [ADR-0002](ADR-0002-vscode-architecture.md) | VS Code Extension 레이어드 아키텍처 채택 | 2026-03-15 | `accepted` | JOB-001 |

### 폐기된 ADR

| ID | 제목 | 날짜 | 상태 | 대체 ADR |
|----|------|------|------|----------|
| — | — | — | — | — |

---

## ADR 관계 맵

```
ADR-0001 (문서 기반 운영체계)
  └── ADR-0002 (VS Code 아키텍처) — 운영체계 위에서 결정됨

[향후 ADR들이 여기에 추가됨]
```

---

## 신규 ADR 생성 절차

```
1. decisions/ADR_TEMPLATE.md 를 복사
2. 파일명: ADR-XXXX-<kebab-case-title>.md
   예: ADR-0003-comparison-algorithm.md
3. 내용 작성 (Context → Decision → Rationale → Alternatives → Consequences)
4. 상태: proposed 로 시작
5. 검토 후 accepted 로 변경
6. 이 인덱스에 항목 추가
7. 관련 stable/ 문서에 ADR 참조 추가
```

---

## 다음 ADR 번호

```
현재 최신 번호: ADR-0002
다음 신규 ADR: ADR-0003
```
