# RECOVERY_PROTOCOL — 장애 복구 프로토콜

> **목적**: 작업 실패, 에이전트 교체, 예상치 못한 중단 후 안정적으로 복구하는 절차

---

## 복구 시나리오 분류

| 시나리오 | 설명 |
|----------|------|
| S1: 정상 재진입 | Session 종료 후 새 에이전트가 이어받는 경우 |
| S2: 블로커 해소 후 재개 | 블로커가 해소된 후 중단된 작업을 재개 |
| S3: 실패 후 재시도 | Phase/Step 실패 후 재시도 |
| S4: 에이전트 역할 교체 | 다른 역할의 에이전트가 작업을 인계받는 경우 |
| S5: 문서 불일치 | 문서 간 상태 불일치 발견 |

---

## S1: 정상 재진입 절차

```
1. docs/00_INDEX.md 읽기
2. docs/working/CURRENT_STATUS.md 읽기
   → 현재 job/phase/step 확인
   → blocker 확인
3. docs/episodic/CHECKPOINT_LOG.md 읽기
   → 최근 체크포인트의 "다음 진입점" 확인
4. docs/interface/AGENT_CONTRACTS.md 읽기
   → 최근 Handoff 메모 확인
5. 해당 Job 파일 읽기
6. 선행조건 확인 후 작업 시작
```

---

## S2: 블로커 해소 후 재개

```
1. working/ACTIVE_ISSUES.md 에서 해당 블로커 이슈 확인
2. 블로커 해소 확인
3. ACTIVE_ISSUES.md 이슈 상태 → RESOLVED
4. working/CURRENT_STATUS.md 의 blocker → NONE
5. 중단된 Phase/Step 부터 재개
6. episodic/CHECKPOINT_LOG.md 에 재개 기록
```

---

## S3: 실패 후 재시도

```
STEP 1. 실패 원인 분석
        - 오류 메시지/로그 확인
        - working/HYPOTHESES.md 에 원인 가설 작성

STEP 2. 실패 기록
        - episodic/JOB_HISTORY.md 에 실패 항목 추가
        - working/ACTIVE_ISSUES.md 에 이슈 등록

STEP 3. 재시도 전략 수립
        - 동일 방법으로 재시도? → 근본 원인이 해결되었는가?
        - 다른 접근법 시도? → working/HYPOTHESES.md 에 새 가설
        - ADR 갱신 필요? → ARCHITECT 에게 요청

STEP 4. 재시도 실행 (최대 3회)
        - 3회 실패 시 ORCHESTRATOR 에게 에스컬레이션

STEP 5. 재시도 결과 기록
        - 성공 시: 체크포인트 기록
        - 실패 시: 실패 원인 재분석
```

---

## S4: 에이전트 역할 교체

```
현재 에이전트 (발신):
1. 작업 중단 지점 파악
2. working/CURRENT_STATUS.md 갱신
3. episodic/CHECKPOINT_LOG.md 에 체크포인트 기록
4. interface/AGENT_CONTRACTS.md 에 Handoff 메모 작성
5. agents/HANDOFF_PROTOCOL.md 의 형식 준수

새 에이전트 (수신):
1. S1 정상 재진입 절차 수행
2. 추가로 agents/AGENT_ROLES.md 에서 자신의 역할 확인
3. 이전 에이전트의 Handoff 메모 확인
```

---

## S5: 문서 불일치 해소

```
불일치 발견 시:

1. working/ACTIVE_ISSUES.md 에 이슈 등록 (BLOCKING 또는 OPEN)
2. 불일치 문서 쌍 명시 (예: CURRENT_STATUS vs CHECKPOINT_LOG)
3. 어떤 문서가 더 신뢰할 수 있는가 판단:
   - CHECKPOINT_LOG: 더 오래되었지만 명시적으로 기록됨
   - CURRENT_STATUS: 더 최신이지만 갱신 누락 가능성
4. 신뢰할 수 있는 문서 기준으로 다른 문서 갱신
5. 갱신 사유를 해당 문서의 갱신 이력에 기록
```

---

## 복구 불가 상황

다음 상황에서는 사람(개발자)에게 에스컬레이션:

```
- 3회 재시도 후에도 동일 실패
- 두 ADR이 서로 모순되는 상황
- 범위 변경이 필요한 블로커
- 외부 도구/서비스 장애로 인한 블로커
- 문서만으로 상황 판단 불가
```

에스컬레이션 방법:
```
working/ACTIVE_ISSUES.md 에 BLOCKING 이슈 등록 후
작업을 중단하고 Handoff 수행
```
