# HANDOFF_PROTOCOL — 에이전트 Handoff 프로토콜

> **목적**: 에이전트 교체 시 컨텍스트 손실 없이 작업을 인계하는 절차를 정의한다

---

## Handoff 발생 조건

| 조건 | 설명 |
|------|------|
| Session 종료 | 현재 에이전트가 작업을 완료하거나 중단할 때 |
| 역할 교체 | 다른 역할의 에이전트가 필요한 작업으로 전환될 때 |
| 블로커 에스컬레이션 | 다른 에이전트가 블로커를 해소해야 할 때 |
| 병렬 분기 | 독립적인 두 작업을 각기 다른 에이전트가 맡을 때 |

---

## Handoff 발신자 절차 (현재 에이전트)

```
STEP 1. 작업 중단 지점을 명확히 파악
        - 어디까지 완료했는가?
        - 어디서 멈췄는가?
        - 무엇이 미완료인가?

STEP 2. working/CURRENT_STATUS.md 갱신
        - active_phase, active_step 최신화
        - blocker 있으면 기록

STEP 3. episodic/CHECKPOINT_LOG.md 에 체크포인트 기록
        - 완료된 항목
        - 생성된 산출물
        - 다음 진입점

STEP 4. interface/AGENT_CONTRACTS.md 의 Handoff 섹션 작성
        (아래 Handoff 메모 형식 사용)

STEP 5. working/ACTIVE_ISSUES.md 최신화
        - 발견한 이슈 추가
        - 해결된 이슈 상태 변경
```

---

## Handoff 메모 형식

`interface/AGENT_CONTRACTS.md` 의 Handoff 섹션에 아래 형식으로 기록:

```markdown
---
## Handoff — [YYYY-MM-DD HH:MM] [발신 에이전트 역할] → [수신 에이전트 역할]

### 완료된 작업
- [x] [완료 항목 1]
- [x] [완료 항목 2]

### 현재 상태
- **current_job**: JOB-XXX
- **active_phase**: Phase X - [Phase 이름]
- **active_step**: Step X.Y - [Step 이름]
- **blocker**: NONE / [블로커 내용]

### 다음 에이전트가 해야 할 일
1. [다음 할 일 1] — [관련 문서]
2. [다음 할 일 2] — [관련 문서]

### 주의 사항
- [주의 사항 1]
- [주의 사항 2]

### 생성/수정된 문서
- [문서 경로 1]: [변경 내용]
- [문서 경로 2]: [변경 내용]

### 관련 ADR
- [ADR-XXXX]: [관련 이유]
---
```

---

## Handoff 수신자 절차 (다음 에이전트)

```
STEP 1. docs/00_INDEX.md 읽기 (항상 시작점)

STEP 2. docs/working/CURRENT_STATUS.md 읽기
        - current_job, active_phase, active_step 확인
        - blocker 확인

STEP 3. docs/interface/AGENT_CONTRACTS.md 읽기
        - 가장 최근 Handoff 메모 확인
        - "다음 에이전트가 해야 할 일" 확인

STEP 4. 해당 Job 파일 읽기
        - jobs/<JOB_ID>.md

STEP 5. 선행조건 확인 후 작업 시작

STEP 6. 작업 완료 후 Handoff 발신자 절차 수행
```

---

## 병렬 Handoff (두 에이전트 동시 작업)

독립적인 두 작업이 병렬 수행될 때:

```
ORCHESTRATOR 책임:
1. 두 작업의 독립성 확인 (파일/모듈 충돌 없음)
2. 각 에이전트에게 담당 파일/디렉토리 범위 명시
3. 병합 지점(merge point) 을 JOB 파일에 명시

에이전트 A:
- working/CURRENT_STATUS.md 의 phase_A 섹션 담당
- 작업 범위: src/domain/comparison/

에이전트 B:
- working/CURRENT_STATUS.md 의 phase_B 섹션 담당
- 작업 범위: src/domain/merge/

병합 시:
- ORCHESTRATOR 가 두 결과를 통합
- 충돌 발생 시 ARCHITECT 에게 에스컬레이션
```

---

## Handoff 품질 기준

다음 항목이 없으면 불완전한 Handoff다:

```
□ 현재 상태 (job/phase/step) 명시
□ 완료된 항목 목록
□ 미완료 항목 목록
□ 다음 에이전트가 해야 할 행동 (구체적)
□ 관련 문서 목록
□ 주의 사항 (있을 경우)
```
