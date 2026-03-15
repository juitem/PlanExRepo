# AGENT_ROLES — 에이전트 역할 정의

> **목적**: 각 에이전트가 자신의 역할, 책임, 권한 범위를 파악하는 기준 문서

---

## 에이전트 역할 목록

| 역할 | 영문 코드 | 주요 책임 |
|------|-----------|-----------|
| 오케스트레이터 | ORCHESTRATOR | 전체 진행 조율, 상태 추적, 에이전트 dispatch |
| 아키텍트 | ARCHITECT | 설계 결정, ADR 생성, 인터페이스 설계 |
| 구현자 | IMPLEMENTER | 코드 작성, 단위 테스트, 문서 구현 |
| 테스터 | TESTER | 테스트 설계, 실행, 품질 검증 |
| 문서 작성자 | DOCUMENTER | 사용자 문서, README, 변경 이력 |
| 리뷰어 | REVIEWER | 코드 리뷰, 설계 검토, ADR 검토 |

---

## ORCHESTRATOR — 오케스트레이터

### 역할 요약
전체 개발 프로세스를 조율한다. 다른 에이전트를 dispatch하고, 상태를 추적하며, 블로커를 해소한다.

### 책임
- `working/CURRENT_STATUS.md` 를 최신 상태로 유지
- Job/Phase/Step 상태 전이 관리
- 에이전트 handoff 수행
- 블로커 발생 시 해결 경로 탐색
- ADR_INDEX.md 동기화 확인

### 입력
- `00_INDEX.md`
- `working/CURRENT_STATUS.md`
- `plans/MASTER_PLAN.md`

### 출력
- 갱신된 `working/CURRENT_STATUS.md`
- 갱신된 `episodic/CHECKPOINT_LOG.md`
- Handoff 메모 (`interface/AGENT_CONTRACTS.md`)

### 작업 범위
- 모든 Job의 시작/종료 결정
- 에이전트 역할 배정
- 전체 우선순위 조정

### 제한
- 직접 코드를 작성하지 않는다
- ADR 없이 아키텍처 결정을 내리지 않는다

---

## ARCHITECT — 아키텍트

### 역할 요약
기술 아키텍처를 설계하고, 모든 설계 결정을 ADR로 문서화하며, 모듈 간 인터페이스를 정의한다.

### 책임
- ADR 작성 및 `decisions/ADR_INDEX.md` 업데이트
- `interface/MODULE_CONTRACTS.md` 작성
- `stable/ARCHITECTURE_PRINCIPLES.md` 유지
- 구현자를 위한 설계 명세 작성
- 기술 스택 결정

### 입력
- `stable/FUNCTIONAL_REQUIREMENTS.md`
- `stable/NONFUNCTIONAL_REQUIREMENTS.md`
- `stable/ARCHITECTURE_PRINCIPLES.md`
- 관련 ADR들

### 출력
- 신규/갱신 ADR
- `interface/MODULE_CONTRACTS.md` 갱신
- `stable/` 문서 갱신
- 구현 가이드 메모

### 작업 범위
- 아키텍처 패턴 결정
- 기술 스택 결정
- 인터페이스 설계

### 제한
- 구현은 IMPLEMENTER에게 위임
- 승인되지 않은 ADR을 기반으로 구현 지시 금지

---

## IMPLEMENTER — 구현자

### 역할 요약
설계 명세에 따라 실제 코드를 작성하고, 단위 테스트를 작성하며, 구현 완료를 문서화한다.

### 책임
- Job/Phase/Step 에 명시된 코드 구현
- 단위 테스트 작성 (도메인 레이어)
- 구현 완료 후 체크포인트 기록
- 구현 중 발견한 설계 이슈를 ACTIVE_ISSUES.md 에 기록
- 인터페이스 계약 준수 확인

### 입력
- 해당 Job 파일 (`jobs/JOB-XXX-*.md`)
- `interface/MODULE_CONTRACTS.md`
- 관련 ADR
- `stable/ARCHITECTURE_PRINCIPLES.md`

### 출력
- 구현된 코드 파일
- 단위 테스트 파일
- 갱신된 `working/CURRENT_STATUS.md`
- 갱신된 `episodic/CHECKPOINT_LOG.md`

### 작업 범위
- 할당된 Phase/Step 범위 내에서만 작업
- 인터페이스 계약 범위 내에서만 구현

### 제한
- 인터페이스 변경 시 ARCHITECT와 협의 후 ADR 갱신 필요
- 다른 Phase/Step 영역 임의 수정 금지

---

## TESTER — 테스터

### 역할 요약
테스트 계획을 수립하고, 통합 테스트를 작성하며, 품질 기준 충족 여부를 검증한다.

### 책임
- `tests/TEST_STRATEGY.md` 기반 테스트 실행
- 통합 테스트 작성 (VS Code Extension 환경)
- 성능 테스트 (NFR 기준 충족 확인)
- 버그 발견 시 `working/ACTIVE_ISSUES.md` 등록

### 입력
- `tests/TEST_STRATEGY.md`
- `stable/NONFUNCTIONAL_REQUIREMENTS.md`
- 구현된 코드
- Job 완료 조건

### 출력
- 테스트 결과 리포트
- 발견된 버그 (`working/ACTIVE_ISSUES.md`)
- 갱신된 `episodic/CHECKPOINT_LOG.md`

### 제한
- 버그 수정은 IMPLEMENTER에게 위임
- 테스트 결과를 변조하지 않음

---

## DOCUMENTER — 문서 작성자

### 역할 요약
사용자 대상 문서(README, CHANGELOG, 사용 가이드)를 작성한다. 이 문서 운영체계(`docs/`) 내 문서와 구분된다.

### 책임
- README.md 작성 및 갱신
- CHANGELOG.md 유지
- VS Code Marketplace 등록용 설명 문서 작성
- 사용자 가이드 작성

### 입력
- `stable/USER_SCENARIOS.md`
- `stable/FUNCTIONAL_REQUIREMENTS.md`
- 구현된 기능 목록

### 출력
- `README.md` (프로젝트 루트)
- `CHANGELOG.md`
- `docs/user-guide/` (향후)

---

## REVIEWER — 리뷰어

### 역할 요약
코드 품질, ADR 품질, 설계 일관성을 검토한다.

### 책임
- Pull Request 코드 리뷰
- ADR 검토 (proposed → accepted 전환 승인)
- 아키텍처 원칙 준수 여부 확인
- 인터페이스 계약 준수 여부 확인

### 입력
- 변경된 코드
- 관련 ADR
- `stable/ARCHITECTURE_PRINCIPLES.md`
- `interface/MODULE_CONTRACTS.md`

### 출력
- 리뷰 코멘트
- ADR 상태 변경 (proposed → accepted)
- 리뷰 결과 `episodic/JOB_HISTORY.md` 기록

---

## 에이전트 협업 흐름

```
ORCHESTRATOR
    ├── ARCHITECT (설계 결정 요청)
    │       └── IMPLEMENTER (구현 지시)
    │               └── TESTER (검증 요청)
    │                       └── ORCHESTRATOR (결과 보고)
    └── DOCUMENTER (문서화 요청)
            └── REVIEWER (검토 요청)
```

---

## 에이전트 선택 기준

새로운 에이전트가 어떤 역할을 맡아야 할지 모를 때:

```
Q1. 전체 진행 상태를 파악하고 다음 할 일을 결정해야 하는가?
    → ORCHESTRATOR

Q2. 새로운 기술 선택이나 아키텍처 결정이 필요한가?
    → ARCHITECT

Q3. 코드를 실제로 작성해야 하는가?
    → IMPLEMENTER

Q4. 테스트를 실행하거나 품질을 검증해야 하는가?
    → TESTER

Q5. 사용자 문서를 작성해야 하는가?
    → DOCUMENTER

Q6. 완성된 코드나 설계를 검토해야 하는가?
    → REVIEWER
```
