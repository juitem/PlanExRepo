# DOCUMENT_CONTRACTS — 문서 간 계약

> **목적**: 문서들 사이의 의존 관계, 갱신 규칙, 일관성 유지 규칙을 정의한다

---

## 문서 의존성 맵

```
00_INDEX.md
  ├── 읽기 → working/CURRENT_STATUS.md
  ├── 읽기 → agents/AGENT_ROLES.md
  └── 읽기 → plans/MASTER_PLAN.md

working/CURRENT_STATUS.md
  ├── 참조 → jobs/<active_job>.md
  ├── 참조 → decisions/ADR_INDEX.md
  └── 갱신 by → 모든 에이전트 (작업 시작/종료 시)

decisions/ADR_INDEX.md
  ├── 포함 → decisions/ADR-XXXX-*.md (N개)
  └── 갱신 by → ARCHITECT

plans/MASTER_PLAN.md
  └── 상세화 by → plans/WBS.md
                   jobs/JOB-XXX-*.md

jobs/JOB-XXX-*.md
  ├── 참조 → specs/*.md
  ├── 참조 → interface/MODULE_CONTRACTS.md
  └── 갱신 by → ORCHESTRATOR, 해당 Job 담당 에이전트
```

---

## 일관성 규칙

### Rule 1: 상태 동기화
`working/CURRENT_STATUS.md` 의 `current_job` 필드는 항상 실제 활성 Job과 일치해야 한다.

### Rule 2: ADR 인덱스 동기화
`decisions/ADR_INDEX.md` 의 ADR 목록은 실제 `decisions/ADR-XXXX-*.md` 파일 목록과 일치해야 한다.

### Rule 3: WBS ↔ Job 파일 동기화
`plans/WBS.md` 의 Step 상태는 해당 Job 파일의 Phase/Step 상태와 일치해야 한다.

### Rule 4: 체크포인트 ↔ Job 이력 동기화
`episodic/CHECKPOINT_LOG.md` 에 기록된 체크포인트는 `episodic/JOB_HISTORY.md` 에도 참조된다.

---

## 갱신 우선순위

동시 갱신 시 아래 순서로 처리:

```
1. working/CURRENT_STATUS.md (최우선)
2. episodic/CHECKPOINT_LOG.md
3. decisions/ADR_INDEX.md (ADR 생성 시)
4. plans/WBS.md (Phase/Step 완료 시)
5. episodic/JOB_HISTORY.md
```

---

## 문서 접근 패턴

| 작업 유형 | 읽어야 할 문서 | 써야 할 문서 |
|-----------|---------------|--------------|
| 작업 시작 | 00_INDEX, CURRENT_STATUS, 해당 JOB | — |
| Phase 완료 | — | CURRENT_STATUS, CHECKPOINT_LOG, WBS |
| ADR 생성 | ADR_TEMPLATE | 새 ADR 파일, ADR_INDEX |
| Handoff | CURRENT_STATUS, 해당 JOB | CURRENT_STATUS, CHECKPOINT_LOG, AGENT_CONTRACTS |
| 버그 발견 | ACTIVE_ISSUES | ACTIVE_ISSUES |

---

## 문서 품질 기준

각 문서는 다음 기준을 충족해야 한다:

```
□ 에이전트가 이 문서만 읽고 다음 행동을 결정할 수 있는가?
□ 상태값이 명확히 표현되어 있는가? (NOT_STARTED/IN_PROGRESS/DONE 등)
□ 입력/출력/완료조건이 명시되어 있는가? (Job 문서)
□ 갱신 규칙이 명시되어 있는가?
□ 관련 문서 링크가 포함되어 있는가?
```
