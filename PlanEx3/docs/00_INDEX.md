# 00_INDEX — PlanEx3 에이전트 진입점

> **에이전트 필독**: 이 파일은 모든 작업의 시작점이다. 어떤 에이전트도 이 파일을 먼저 읽지 않고 작업을 시작해서는 안 된다.

---

## 프로젝트 상태 스냅샷

```yaml
project_name: PlanEx3
project_phase: PLANNING         # PLANNING | FOUNDATION | DEVELOPMENT | TESTING | RELEASE
current_job: NONE               # JOB-001 | JOB-002 | JOB-003 | JOB-004
active_phase: NONE
active_step: NONE
last_updated: 2026-03-15
last_agent: ORCHESTRATOR
blocker: NONE                   # NONE | <blocker description>
```

---

## 프로젝트 한 줄 요약

VS Code에서 동작하는 폴더 비교/병합 확장 플러그인을 **AI 에이전트 오케스트레이션** 방식으로 개발한다. 여러 에이전트가 중단과 재개를 반복해도 문서 기반으로 안정적으로 이어달리기 개발이 가능하도록 설계된 운영체계다.

---

## 에이전트 진입 프로토콜 (필수)

에이전트는 작업 시작 전 아래 순서를 반드시 따른다:

```
STEP 1. 이 파일(00_INDEX.md)을 읽는다
STEP 2. working/CURRENT_STATUS.md 를 읽는다  ← 현재 무엇을 해야 하는지 파악
STEP 3. agents/AGENT_ROLES.md 를 읽는다      ← 내 역할 파악
STEP 4. 해당 JOB 파일을 읽는다               ← jobs/ 폴더
STEP 5. 해당 PHASE/STEP 의 입력 조건 확인
STEP 6. 작업 수행
STEP 7. 완료 시 working/CURRENT_STATUS.md 갱신
STEP 8. episodic/CHECKPOINT_LOG.md 에 체크포인트 기록
```

---

## 빠른 내비게이션

| 문서 | 목적 | 우선순위 |
|------|------|----------|
| `working/CURRENT_STATUS.md` | 지금 무엇을 해야 하는가 | **항상 읽어야 함** |
| `agents/AGENT_ROLES.md` | 내 역할은 무엇인가 | **항상 읽어야 함** |
| `plans/MASTER_PLAN.md` | 전체 개발 계획 | 새 작업 시작 시 |
| `plans/WBS.md` | 작업 분해 구조 | 새 작업 시작 시 |
| `decisions/ADR_INDEX.md` | 아키텍처 결정 목록 | 기술 결정 시 |
| `OPERATIONS_RULES.md` | 에이전트 운영 규칙 | 운영 원칙 확인 시 |
| `interface/AGENT_CONTRACTS.md` | 에이전트 간 계약 | Handoff 시 |

---

## 지식 레이어 구조

```
docs/
├── stable/       안정 지식: 목표, 제약, 아키텍처 원칙 (잘 바뀌지 않음)
├── working/      작업 지식: 현재 상태, 가설, 활성 이슈 (자주 갱신)
├── episodic/     이력 지식: job 이력, 체크포인트, 실패 사례
├── decisions/    의사결정 지식: ADR 목록 및 개별 ADR
├── interface/    인터페이스 지식: 모듈/에이전트/문서 계약
├── plans/        개발 계획: 마스터 플랜, WBS
├── specs/        기능 명세: 비교, 병합, 파일 diff, 충돌 해결
├── agents/       에이전트 설계: 역할, 가이드, handoff 프로토콜
├── jobs/         Job 실행 계약: 각 Job의 입력/출력/완료조건
├── operations/   운영 절차: 체크포인트, 복구, knowledge 관리
├── templates/    재사용 템플릿: Phase, Step 템플릿
└── tests/        테스트 전략
```

---

## 현재 열려있는 결정 사항

| ID | 결정 사항 | 상태 |
|----|-----------|------|
| ADR-0001 | 문서 기반 개발 운영체계 채택 | `accepted` |
| ADR-0002 | VS Code Extension 아키텍처 방향 | `accepted` |

> 새로운 기술/설계 결정이 필요하면 `decisions/ADR_TEMPLATE.md` 를 복사해 ADR을 먼저 생성한 뒤 구현한다.

---

## 규칙 요약 (상세 내용은 OPERATIONS_RULES.md)

1. **코드보다 문서 먼저** — 모든 결정은 ADR로 기록한 뒤 구현
2. **상태 추적 의무** — 작업 종료 시 반드시 CURRENT_STATUS.md 갱신
3. **체크포인트 의무** — Phase 완료마다 CHECKPOINT_LOG.md 에 기록
4. **ADR 우선** — 설계 변경 시 ADR을 먼저 생성/갱신
5. **재진입 보장** — 이전 대화 없이 문서만으로 이어서 작업 가능해야 함
