# Step X-X-X — [Step 이름] (템플릿)

> **복사 방법**: Phase 문서 내 Step 섹션으로 복사하여 사용

---

## Step 메타데이터

```yaml
step_id: X-X-X
step_name: [Step 이름]
parent_phase: Phase X-X
parent_job: JOB-XXX
status: TODO       # TODO | IN_PROGRESS | DONE | SKIPPED | FAILED
assigned_role: [에이전트 역할]
estimated_effort: SMALL   # SMALL | MEDIUM | LARGE
```

---

## 목적 (Purpose)

[이 Step 이 달성하는 것. 한 문장으로.]

---

## 입력 (Inputs)

| 입력 | 위치/설명 | 필수 여부 |
|------|-----------|-----------|
| [입력 1] | [경로 또는 설명] | 필수 |
| [입력 2] | [경로 또는 설명] | 선택 |

---

## 실행 지시 (Execution Instructions)

> 에이전트가 이 Step 을 실행하기 위한 구체적인 지시

```
1. [구체적인 행동 1]
2. [구체적인 행동 2]
3. [구체적인 행동 3]
```

---

## 출력 (Outputs)

| 산출물 | 위치 | 설명 |
|--------|------|------|
| [산출물 1] | [경로] | [설명] |

---

## 완료 조건 (Done Criteria)

```
□ [확인 항목 1]
□ [확인 항목 2]
□ [확인 항목 3]
```

---

## 실패 조건 및 재시도

| 실패 상황 | 재시도 방법 |
|-----------|-------------|
| [실패 1] | [재시도 방법] |
| [실패 2] | [에스컬레이션] |

---

## 에이전트 결정 포인트

> 이 Step 실행 중 에이전트가 결정해야 할 사항 (있을 경우)

```
결정 필요: [결정 내용]
선택지:
  A) [선택 A] — 영향: [영향]
  B) [선택 B] — 영향: [영향]
결정 기준: [무엇을 보고 결정하는가]
결정 전 ADR 필요 여부: YES / NO
```

---

## 완료 후 업데이트

```
이 Step 완료 후:
  □ 해당 Job 파일의 Step 상태 → DONE
  □ plans/WBS.md 의 Step 상태 → DONE
  □ (Phase 마지막 Step 이면) episodic/CHECKPOINT_LOG.md 기록
```
