# OPERATIONS_RULES — 에이전트 운영 규칙

> **적용 대상**: PlanEx3 프로젝트에 투입되는 모든 AI 에이전트
> **갱신 조건**: 운영 정책 변경 시 ADR을 먼저 생성한 뒤 이 문서를 갱신

---

## 1. 기본 원칙

### 1.1 문서 우선 원칙
- 모든 결정은 코드보다 문서가 먼저다
- 설계 변경 → ADR 생성/갱신 → 문서 반영 → 구현 순서를 반드시 따른다
- "구현하면서 생각하는" 방식은 금지

### 1.2 재진입 보장 원칙
- 어떤 에이전트도 이전 대화 기록 없이 문서만 읽고 작업을 이어받을 수 있어야 한다
- 작업 컨텍스트는 반드시 문서에 기록한다. 에이전트 메모리에 의존하지 않는다
- 모든 중간 산출물은 후속 에이전트의 입력으로 재사용 가능해야 한다

### 1.3 상태 추적 의무
- 작업 시작 시: `working/CURRENT_STATUS.md` 에서 현재 상태 확인
- 작업 종료 시: `working/CURRENT_STATUS.md` 갱신 (필수)
- Phase 완료 시: `episodic/CHECKPOINT_LOG.md` 에 체크포인트 기록 (필수)

---

## 2. 에이전트 작업 수명주기

### 2.1 작업 시작 (Start Protocol)

```
[REQUIRED READS]
1. docs/00_INDEX.md
2. docs/working/CURRENT_STATUS.md
3. docs/agents/AGENT_ROLES.md
4. docs/jobs/<current_job>.md
5. 해당 Phase/Step 입력 조건 문서

[REQUIRED CHECKS]
- blocker 필드가 NONE 인지 확인
- 선행조건(preconditions)이 모두 충족되었는지 확인
- 자신이 맡을 수 있는 역할인지 확인 (agents/AGENT_ROLES.md)
```

### 2.2 작업 중 (During Protocol)

```
[REQUIRED ACTIONS]
- working/HYPOTHESES.md 에 현재 가설 기록
- working/ACTIVE_ISSUES.md 에 발견한 문제 기록
- 주요 결정 시 decisions/ADR_TEMPLATE.md 복사 후 ADR 생성

[FORBIDDEN ACTIONS]
- 다른 Job/Phase 영역 임의 수정
- 미리 정의되지 않은 인터페이스 생성
- ADR 없이 아키텍처 결정 변경
```

### 2.3 작업 종료 (End Protocol)

```
[REQUIRED UPDATES]
1. working/CURRENT_STATUS.md 갱신
   - current_job, active_phase, active_step 업데이트
   - 완료된 항목 상태를 DONE 으로 변경
2. episodic/CHECKPOINT_LOG.md 에 체크포인트 항목 추가
3. episodic/JOB_HISTORY.md 에 이번 작업 이력 추가
4. 생성/수정한 문서 목록을 handoff 메모에 기록

[HANDOFF]
- 다음 에이전트를 위한 handoff 메모를 interface/AGENT_CONTRACTS.md 에 기록
- 미완료 항목, 블로커, 다음 에이전트가 해야 할 일을 명시
```

---

## 3. 상태 전이 규칙

### 3.1 Job 상태

```
NOT_STARTED → IN_PROGRESS → COMPLETED
                    ↓
               BLOCKED (blocker 문서화 필요)
                    ↓
               FAILED (실패 원인 episodic/JOB_HISTORY.md 에 기록)
                    ↓
               RETRYING (재시도 규칙 준수)
```

### 3.2 Phase 상태

```
PENDING → ACTIVE → DONE
            ↓
         BLOCKED
            ↓
         FAILED → RETRY (최대 3회)
```

### 3.3 Step 상태

```
TODO → IN_PROGRESS → DONE
           ↓
        SKIPPED (사유 기록 필수)
           ↓
        FAILED (실패 사유 + 재시도 여부 기록)
```

---

## 4. 블로커 처리 규칙

```yaml
# 블로커 발생 시 즉시 아래를 수행

1. working/CURRENT_STATUS.md 의 blocker 필드에 블로커 내용 기록
2. working/ACTIVE_ISSUES.md 에 이슈 항목 추가
3. 현재 상태를 BLOCKED 로 변경
4. 해결 없이 다음 단계로 진행 금지
5. 블로커 해결 후 blocker 필드를 NONE 으로 되돌림
```

---

## 5. ADR 운영 규칙

- 아키텍처, 기술 스택, 워크플로우, 인터페이스 변경 시 **반드시** ADR 먼저
- ADR 상태: `proposed` → `accepted` → `deprecated` / `superseded`
- 기존 ADR을 supersede 할 때: 새 ADR 생성 + 기존 ADR 상태를 `superseded by ADR-XXXX` 로 변경
- ADR 생성 후 `decisions/ADR_INDEX.md` 업데이트 필수

---

## 6. Knowledge 갱신 규칙

| Knowledge 유형 | 갱신 주체 | 갱신 시점 |
|----------------|-----------|-----------|
| `stable/` | ARCHITECT 에이전트 | 아키텍처 결정 확정 시 |
| `working/` | 모든 에이전트 | 작업 시작/종료 시 |
| `episodic/` | 모든 에이전트 | Phase/Step 완료 시 |
| `decisions/` | ARCHITECT / ORCHESTRATOR | 의사결정 발생 시 |
| `interface/` | ARCHITECT 에이전트 | 인터페이스 설계/변경 시 |

---

## 7. 재시도 규칙

```yaml
max_retries: 3
retry_interval: next_session  # 즉각 재시도 금지 (원인 분석 후)

retry_protocol:
  1. 실패 원인을 episodic/JOB_HISTORY.md 에 기록
  2. working/HYPOTHESES.md 에 원인 가설 추가
  3. working/ACTIVE_ISSUES.md 에 이슈 등록
  4. 원인 파악 후 다른 접근법으로 재시도
  5. 3회 실패 시 ORCHESTRATOR 에게 에스컬레이션
```

---

## 8. Handoff 규칙

에이전트 교체 시 반드시 `interface/AGENT_CONTRACTS.md` 의 handoff 섹션을 채운다:

```markdown
## Handoff — [날짜] [발신 에이전트] → [수신 에이전트]

### 완료된 작업
- ...

### 현재 상태
- current_job: ...
- active_phase: ...
- active_step: ...

### 다음 에이전트가 해야 할 일
- ...

### 주의 사항
- ...

### 관련 문서
- ...
```

---

## 9. 금지 행동

| 금지 행동 | 이유 |
|-----------|------|
| 문서 없이 아키텍처 결정 | 재진입 불가능 |
| CURRENT_STATUS.md 갱신 생략 | 다음 에이전트 혼란 |
| 다른 Job 영역 무단 수정 | 예측 불가능한 부작용 |
| ADR 없이 기술 스택 변경 | 결정 근거 소실 |
| 즉각 재시도 (원인 분석 없이) | 동일 실패 반복 |
