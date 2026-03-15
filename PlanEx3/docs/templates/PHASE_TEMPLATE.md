# Phase X-X — [Phase 이름] (템플릿)

> **복사 방법**: Job 파일 내 Phase 섹션으로 복사하거나, 독립 Phase 문서로 사용

---

## Phase 메타데이터

```yaml
phase_id: Phase X-X
phase_name: [Phase 이름]
parent_job: JOB-XXX
status: PENDING    # PENDING | ACTIVE | DONE | BLOCKED | FAILED
assigned_role: [에이전트 역할]
started_at: ~
completed_at: ~
```

---

## 목적

[이 Phase 가 달성하는 것]

---

## 선행 Phase

- Phase X-X 완료 필요 (또는 N/A)

---

## Step 목록

| Step ID | 내용 | 상태 | 산출물 | 담당 |
|---------|------|------|--------|------|
| X-X-1 | [Step 내용] | `TODO` | [산출물] | [역할] |
| X-X-2 | [Step 내용] | `TODO` | [산출물] | [역할] |
| X-X-3 | [Step 내용] | `TODO` | [산출물] | [역할] |

---

## Step 상세

### Step X-X-1: [Step 이름]

**입력**: [이 Step 에 필요한 입력]
**출력**: [이 Step 이 생성하는 산출물]
**완료 조건**: [어떻게 완료를 판단하는가]
**실패 조건**: [실패로 판단하는 기준]
**재시도**: [재시도 방법]

---

### Step X-X-2: [Step 이름]

**입력**: ...
**출력**: ...
**완료 조건**: ...

---

## Phase 완료 조건 (Checklist)

- [ ] 모든 Step 상태가 DONE
- [ ] 산출물이 명시된 경로에 존재
- [ ] [추가 조건]

## Phase 실패 조건

- [실패 시나리오]: 대응 → [대응]

## 체크포인트

이 Phase 완료 시:
```
episodic/CHECKPOINT_LOG.md 에 기록
working/CURRENT_STATUS.md 의 active_phase 갱신
plans/WBS.md 의 해당 Phase 상태를 DONE 으로 변경
```
