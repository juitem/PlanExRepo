# JOB-XXXX — [Job 이름]

> **복사 방법**: 이 파일을 복사해 `JOB-XXX-<kebab-case-name>.md` 로 저장 후 작성

---

## Job 메타데이터

```yaml
job_id: JOB-XXX
job_name: [Job 이름]
status: NOT_STARTED    # NOT_STARTED | IN_PROGRESS | COMPLETED | BLOCKED | FAILED
priority: HIGH         # HIGH | MEDIUM | LOW
assigned_role: [에이전트 역할]   # ORCHESTRATOR | ARCHITECT | IMPLEMENTER | TESTER
started_at: ~          # YYYY-MM-DD
completed_at: ~        # YYYY-MM-DD
last_updated: YYYY-MM-DD
```

---

## 목적 (Purpose)

> 이 Job 이 존재하는 이유. 무엇을 달성하기 위한 Job 인가?

[Job 의 목적 설명]

---

## 선행조건 (Preconditions)

> 이 Job 을 시작하기 전에 반드시 완료/충족되어야 하는 조건

- [ ] [선행조건 1] — 참조: [관련 문서]
- [ ] [선행조건 2]
- [ ] [선행조건 3]

---

## 입력 (Inputs)

> 이 Job 을 실행하기 위해 필요한 입력 (문서, 코드, 결정 등)

| 입력 | 위치 | 필수 여부 |
|------|------|-----------|
| [입력 1] | [경로] | 필수 |
| [입력 2] | [경로] | 선택 |

---

## Phase 목록

### Phase X-1: [Phase 이름]

**목적**: [이 Phase 가 달성하는 것]

**담당 에이전트**: [역할]

| Step | 내용 | 상태 | 산출물 |
|------|------|------|--------|
| X-1-1 | [Step 내용] | `TODO` | [산출물] |
| X-1-2 | [Step 내용] | `TODO` | [산출물] |

**Phase 완료 조건**:
- [ ] [완료 조건 1]
- [ ] [완료 조건 2]

**Phase 실패 조건**:
- [실패 조건 1]: 대응 → [대응 방법]

---

### Phase X-2: [Phase 이름]

**목적**: [이 Phase 가 달성하는 것]

**담당 에이전트**: [역할]

| Step | 내용 | 상태 | 산출물 |
|------|------|------|--------|
| X-2-1 | [Step 내용] | `TODO` | [산출물] |

**Phase 완료 조건**:
- [ ] [완료 조건]

---

## 출력 (Outputs)

> 이 Job 이 완료되면 생성/갱신되어야 하는 산출물

| 산출물 | 위치 | 설명 |
|--------|------|------|
| [산출물 1] | [경로] | [설명] |
| [산출물 2] | [경로] | [설명] |

---

## Job 완료 조건 (Definition of Done)

- [ ] 모든 Phase 상태가 DONE
- [ ] 모든 출력 산출물 생성/갱신 완료
- [ ] [추가 완료 조건]

---

## 실패 조건 및 대응

| 실패 시나리오 | 대응 방법 | 에스컬레이션 조건 |
|---------------|-----------|------------------|
| [실패 1] | [대응] | [조건] |

---

## 재시도 규칙

```yaml
max_retries: 3
retry_strategy: |
  1. 실패 원인을 episodic/JOB_HISTORY.md 에 기록
  2. working/HYPOTHESES.md 에 새 가설 추가
  3. 다른 접근법으로 재시도
  4. 3회 실패 시 ORCHESTRATOR 에게 에스컬레이션
```

---

## 체크포인트 위치

> 이 Job 에서 반드시 체크포인트를 기록해야 하는 지점

- Phase X-1 완료 시 → `episodic/CHECKPOINT_LOG.md` 기록
- Phase X-2 완료 시 → `episodic/CHECKPOINT_LOG.md` 기록
- Job 완료 시 → `working/CURRENT_STATUS.md` + `episodic/JOB_HISTORY.md` 기록

---

## 관련 문서

- [문서 경로] — [관계]

---

## 갱신 이력

| 날짜 | 갱신자 | 내용 |
|------|--------|------|
| YYYY-MM-DD | [에이전트] | 초안 작성 |
