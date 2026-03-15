# ORCHESTRATOR_GUIDE — 오케스트레이터 운영 가이드

> **대상**: ORCHESTRATOR 역할을 수행하는 에이전트
> **목적**: 전체 개발 프로세스를 안정적으로 조율하는 방법을 정의한다

---

## 오케스트레이터의 핵심 임무

```
1. 현재 상태 파악
2. 다음 행동 결정
3. 적합한 에이전트에게 작업 위임
4. 완료 확인 및 상태 업데이트
5. 반복
```

---

## Session 시작 루틴

```
[매 Session 시작 시 필수 실행]

READ: docs/00_INDEX.md
READ: docs/working/CURRENT_STATUS.md
READ: docs/working/ACTIVE_ISSUES.md

EVALUATE:
  - 현재 blocker 가 있는가?
  - 현재 active_job 이 있는가?
  - 해당 Job 의 현재 Phase/Step 상태는?

DECIDE:
  - blocker 있음 → 블로커 해소 우선
  - active_job 있음 → 해당 Job 의 다음 Step 실행
  - active_job 없음 → 다음 Job 을 시작
```

---

## Job 시작 절차

```
1. plans/MASTER_PLAN.md 에서 다음 Job 확인
2. jobs/<JOB_ID>.md 파일 읽기
3. 선행조건(preconditions) 모두 충족 확인
4. working/CURRENT_STATUS.md 업데이트
   - current_job → JOB-XXX
   - active_phase → Phase X
5. 적합한 에이전트 역할 결정 (agents/AGENT_ROLES.md 참조)
6. 에이전트에게 Job 파일과 함께 작업 지시
7. episodic/JOB_HISTORY.md 에 Job 시작 기록
```

---

## Phase 전환 결정 기준

```
Phase 완료 조건이 모두 충족되었는가?
  YES → 다음 Phase 로 전환
  NO  → 미완료 항목 목록 작성 → IMPLEMENTER 에게 전달

완료 조건 예시:
  - 해당 Phase 의 모든 Step 이 DONE 상태
  - 산출 문서가 생성/갱신됨
  - 통합 테스트 통과 (TESTER 확인)
```

---

## 블로커 처리 절차

```
1. working/CURRENT_STATUS.md 의 blocker 필드 기록
2. working/ACTIVE_ISSUES.md 에 BLOCKING 이슈 등록
3. 블로커 유형 분류:
   a. 기술적 블로커 → ARCHITECT 에게 에스컬레이션
   b. 리소스 블로커 → 사람에게 에스컬레이션
   c. 의존성 블로커 → 의존 Job 완료 대기

4. 블로커 해소 후:
   - ACTIVE_ISSUES.md 상태 → RESOLVED
   - CURRENT_STATUS.md blocker → NONE
   - 작업 재개
```

---

## Handoff 수행 절차

```
[현재 에이전트 → 다음 에이전트]

ORCHESTRATOR 가 수행:
1. working/CURRENT_STATUS.md 최신화
2. episodic/CHECKPOINT_LOG.md 에 현재 체크포인트 기록
3. interface/AGENT_CONTRACTS.md 의 Handoff 섹션 작성
   - 완료된 작업 목록
   - 현재 상태 (job/phase/step)
   - 다음 에이전트가 해야 할 일
   - 주의 사항
   - 관련 문서 목록
4. 다음 에이전트에게 00_INDEX.md 부터 읽도록 지시
```

---

## 주간 상태 점검 체크리스트

```
□ CURRENT_STATUS.md 내용이 실제 상태를 반영하는가?
□ ACTIVE_ISSUES.md 에 오래된 미해결 이슈가 있는가?
□ CHECKPOINT_LOG.md 에 최근 항목이 있는가?
□ ADR_INDEX.md 가 최신 상태인가?
□ JOB_HISTORY.md 에 최근 이력이 기록되어 있는가?
□ working/HYPOTHESES.md 에 오래된 PROPOSED 가설이 있는가?
```

---

## 에스컬레이션 기준

다음 상황에서는 사람(개발자)에게 에스컬레이션한다:

```
- 동일한 실패가 3회 이상 반복
- ADR 에서 정의되지 않은 새로운 아키텍처 방향이 필요
- 범위(Scope) 변경이 필요한 상황
- 외부 의존성(VS Code API 버그 등) 으로 인한 블로커
- 두 ADR 이 충돌하는 상황
```

---

## 오케스트레이터 사용 문서 체크리스트

Session 시작 시:
```
□ 00_INDEX.md
□ working/CURRENT_STATUS.md
□ working/ACTIVE_ISSUES.md
□ plans/MASTER_PLAN.md (새 Job 시작 시)
```

Session 종료 시:
```
□ working/CURRENT_STATUS.md 갱신
□ episodic/CHECKPOINT_LOG.md 갱신
□ interface/AGENT_CONTRACTS.md Handoff 섹션 작성
□ working/ACTIVE_ISSUES.md 갱신
```
