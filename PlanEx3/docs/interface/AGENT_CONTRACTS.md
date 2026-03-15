# AGENT_CONTRACTS — 에이전트 간 입출력 계약 및 Handoff 기록

> **목적**: 에이전트 간 handoff 메모를 기록하고, 각 에이전트의 입출력 계약을 정의한다
> **갱신 규칙**: 각 Session 종료 시 Handoff 섹션에 메모 추가

---

## 에이전트 입출력 계약 요약

| 에이전트 | 필수 입력 문서 | 필수 출력 문서 |
|----------|---------------|----------------|
| ORCHESTRATOR | 00_INDEX, CURRENT_STATUS | CURRENT_STATUS (갱신), CHECKPOINT_LOG |
| ARCHITECT | GOALS_AND_SCOPE, FUNCTIONAL_REQUIREMENTS | ADR (신규), MODULE_CONTRACTS (갱신) |
| IMPLEMENTER | 해당 JOB 파일, MODULE_CONTRACTS | CURRENT_STATUS (갱신), CHECKPOINT_LOG |
| TESTER | TEST_STRATEGY, NONFUNCTIONAL_REQUIREMENTS | ACTIVE_ISSUES (버그 등록), CHECKPOINT_LOG |
| DOCUMENTER | USER_SCENARIOS, 구현 완료 목록 | README.md, CHANGELOG.md |
| REVIEWER | 변경 코드, 관련 ADR | 리뷰 코멘트, ADR 상태 변경 |

---

## Handoff 기록

> 최신 Handoff 가 맨 위에 위치한다.

---

### Handoff — 2026-03-15 ORCHESTRATOR → [다음 에이전트]

**완료된 작업**:
- [x] PlanEx3/docs/ 전체 문서 운영체계 설계 및 생성
- [x] ADR-0001, ADR-0002 생성
- [x] 4개 Job 파일 생성 (JOB-001 ~ JOB-004)
- [x] stable/ 지식 문서 생성
- [x] 에이전트 역할 및 운영 규칙 문서화

**현재 상태**:
- **current_job**: NONE
- **active_phase**: NONE
- **active_step**: NONE
- **blocker**: NONE

**다음 에이전트가 해야 할 일**:
1. `jobs/JOB-001-FOUNDATION.md` 를 읽고 Phase 1-1 시작
2. VS Code Extension 개발 환경 설정 (IMPLEMENTER 역할)
3. 번들러 선택 시 ARCHITECT 에게 ADR-0003 생성 요청

**주의 사항**:
- 이 프로젝트는 PlanEx3 폴더에만 존재함 (다른 폴더 수정 금지)
- 모든 아키텍처 결정은 ADR 먼저

**생성된 문서**:
- `docs/` 전체 38개 문서 신규 생성

**관련 ADR**:
- ADR-0001: 문서 기반 운영체계
- ADR-0002: VS Code Extension 아키텍처

---

## 에이전트 계약 위반 기록

> 계약 위반 발생 시 이 섹션에 기록 (재발 방지용)

| 날짜 | 에이전트 | 위반 내용 | 결과 |
|------|----------|-----------|------|
| — | — | — | — |
