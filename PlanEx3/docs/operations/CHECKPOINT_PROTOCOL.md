# CHECKPOINT_PROTOCOL — 체크포인트 프로토콜

> **목적**: 언제, 어떻게 체크포인트를 기록하고 복구 기점으로 활용하는지 정의한다

---

## 체크포인트 기록 시점 (필수)

```
MANDATORY:
  1. Phase 완료 시 (모든 Step 이 DONE 상태가 되었을 때)
  2. Job 완료 시
  3. 블로커 발생으로 작업 중단 시
  4. Session 종료 전 (작업 도중 중단 시)

OPTIONAL (권장):
  5. 복잡한 Step 완료 시
  6. 중요한 결정을 내린 후
  7. 실패 발생 직전 상태 보존이 필요할 때
```

---

## 체크포인트 기록 절차

```
STEP 1. episodic/CHECKPOINT_LOG.md 열기
STEP 2. 다음 CP 번호 확인 (파일 하단의 "다음 체크포인트 번호" 참조)
STEP 3. 아래 항목을 채워 새 항목 추가:
         - 날짜
         - 에이전트
         - 이벤트 (어떤 Phase/Job이 완료되었나)
         - 완료된 항목 체크리스트
         - 생성된 산출물
         - 다음 진입점 (다음 에이전트를 위한 가이드)
         - 메모 (특이사항)
STEP 4. "다음 체크포인트 번호" 증가
STEP 5. working/CURRENT_STATUS.md 갱신 (Phase/Job 상태 업데이트)
```

---

## 복구 기점 활용 방법

에이전트가 재진입 시 체크포인트를 기준으로 작업을 재개한다:

```
STEP 1. episodic/CHECKPOINT_LOG.md 읽기
         → 가장 최근 체크포인트 확인
STEP 2. 체크포인트의 "다음 진입점" 섹션 확인
         → 어떤 Phase/Step 부터 시작해야 하는가?
STEP 3. working/CURRENT_STATUS.md 와 일치 여부 확인
         → 불일치 시 CHECKPOINT_LOG 기준으로 판단
STEP 4. 해당 Job 파일 읽기 → 해당 Phase/Step 재개
```

---

## 체크포인트 일관성 확인

에이전트는 작업 전 다음을 확인해야 한다:

```
□ CHECKPOINT_LOG 의 최신 체크포인트와
  CURRENT_STATUS 의 active_phase/active_step 이 일치하는가?

불일치 시:
  - CHECKPOINT_LOG 가 더 최신 → CHECKPOINT_LOG 기준 채택
  - CURRENT_STATUS 가 더 최신 → CURRENT_STATUS 기준 채택
  - 판단 불가 → working/ACTIVE_ISSUES.md 에 이슈 등록 후 ORCHESTRATOR 에게 문의
```

---

## 체크포인트 품질 기준

불완전한 체크포인트의 예:
```
BAD: "Phase 1-1 완료"  ← 너무 짧음
BAD: 다음 진입점 없음  ← 재진입 불가능
BAD: 산출물 목록 없음  ← 무엇이 생성되었는지 불명확
```

완전한 체크포인트:
```
GOOD: 완료 항목 체크리스트 + 산출물 목록 + 다음 진입점 + 메모
```
