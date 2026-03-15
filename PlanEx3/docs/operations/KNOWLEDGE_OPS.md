# KNOWLEDGE_OPS — Knowledge 관리 운영 체계

> **목적**: 5개 Knowledge 레이어의 저장/갱신/승격/폐기 규칙을 정의한다

---

## Knowledge 레이어 개요

```
┌──────────────────────────────────────────────┐
│  stable/        안정 지식 (잘 바뀌지 않음)   │
├──────────────────────────────────────────────┤
│  decisions/     의사결정 지식 (ADR)           │
├──────────────────────────────────────────────┤
│  interface/     인터페이스 지식 (계약)        │
├──────────────────────────────────────────────┤
│  working/       작업 지식 (현재 컨텍스트)    │
├──────────────────────────────────────────────┤
│  episodic/      이력 지식 (시도/실패/체크포인트) │
└──────────────────────────────────────────────┘
```

---

## Layer 1: Stable Knowledge

**위치**: `docs/stable/`
**정의**: 프로젝트 기간 동안 거의 바뀌지 않는 목표, 제약, 핵심 원칙

**파일 목록**:
- `PROJECT_OVERVIEW.md` — 프로젝트 개요
- `GOALS_AND_SCOPE.md` — 목표와 범위
- `USER_SCENARIOS.md` — 사용자 시나리오
- `FUNCTIONAL_REQUIREMENTS.md` — 기능 요구사항
- `NONFUNCTIONAL_REQUIREMENTS.md` — 비기능 요구사항
- `ARCHITECTURE_PRINCIPLES.md` — 아키텍처 원칙
- `VSCODE_EXTENSION_STRUCTURE.md` — Extension 구조 계획

**갱신 주체**: ARCHITECT
**갱신 시점**: 아키텍처 결정 확정 시, 요구사항 변경 시
**갱신 전 조건**: ADR 생성 및 accepted 상태여야 함
**폐기 조건**: 해당 내용이 완전히 대체될 때 (ADR로 결정)

---

## Layer 2: Decision Knowledge (ADR)

**위치**: `docs/decisions/`
**정의**: 아키텍처, 기술, 워크플로우 관련 의사결정 기록

**파일 목록**:
- `ADR_INDEX.md` — ADR 인덱스
- `ADR_TEMPLATE.md` — ADR 작성 템플릿
- `ADR-XXXX-*.md` — 개별 ADR

**갱신 주체**: ARCHITECT, ORCHESTRATOR
**갱신 시점**: 설계 결정 필요 시 즉시
**상태 전이**: `proposed → accepted → deprecated / superseded`
**폐기 조건**: 새 ADR로 superseded 되거나 해당 결정이 더 이상 유효하지 않을 때

---

## Layer 3: Interface Knowledge

**위치**: `docs/interface/`
**정의**: 모듈 간, 에이전트 간, 문서 간 계약

**파일 목록**:
- `MODULE_CONTRACTS.md` — 코드 모듈 인터페이스
- `AGENT_CONTRACTS.md` — 에이전트 입출력 + Handoff 기록
- `DOCUMENT_CONTRACTS.md` — 문서 간 의존 관계

**갱신 주체**: ARCHITECT (MODULE_CONTRACTS), 모든 에이전트 (AGENT_CONTRACTS)
**갱신 시점**: 인터페이스 변경 시, Session 종료 시 (Handoff)
**갱신 전 조건**: MODULE_CONTRACTS 변경 시 ADR 또는 ARCHITECT 검토 필요

---

## Layer 4: Working Knowledge

**위치**: `docs/working/`
**정의**: 현재 진행 중인 작업 컨텍스트, 활성 이슈, 임시 가설

**파일 목록**:
- `CURRENT_STATUS.md` — 현재 작업 상태
- `ACTIVE_ISSUES.md` — 활성 이슈 목록
- `HYPOTHESES.md` — 작업 가설

**갱신 주체**: 모든 에이전트
**갱신 시점**: 작업 시작/종료 시, 이슈 발견 시, 가설 수립 시
**승격 조건**:
  - `HYPOTHESES.md` 의 VALIDATED 가설 → `stable/` 로 승격 가능
  - `ACTIVE_ISSUES.md` 의 RESOLVED 이슈 → 이력 보존 후 `episodic/JOB_HISTORY.md` 로 이동
**폐기 조건**: HYPOTHESES의 REFUTED 가설은 상태만 변경하고 보존

---

## Layer 5: Episodic Knowledge

**위치**: `docs/episodic/`
**정의**: Job별 진행 이력, 체크포인트, 실패 사례

**파일 목록**:
- `CHECKPOINT_LOG.md` — 체크포인트 기록
- `JOB_HISTORY.md` — Job 진행 이력

**갱신 주체**: 모든 에이전트
**갱신 시점**: Phase/Job 완료 시, 실패 발생 시
**보존 원칙**: 항목을 삭제하지 않는다. 영구 보존.

---

## Knowledge 갱신 흐름

```
새로운 정보 발견
      ↓
working/HYPOTHESES.md 에 PROPOSED 가설로 기록
      ↓
검증 (테스트, 실험, ADR 검토)
      ↓
VALIDATED → stable/ 에 반영 가능
REFUTED   → REFUTED 상태로 보존 (학습 자료)
      ↓
stable/ 반영 시 ADR 필요 (아키텍처 관련이면)
```

---

## 에이전트 Knowledge 접근 규칙

```
작업 시작 전 (읽기 의무):
  1. working/CURRENT_STATUS.md       ← 현재 상태
  2. 관련 stable/ 문서               ← 목표/원칙
  3. 관련 decisions/ ADR             ← 결정 맥락
  4. interface/MODULE_CONTRACTS.md   ← 계약

작업 종료 후 (쓰기 의무):
  1. working/CURRENT_STATUS.md       ← 상태 갱신
  2. episodic/CHECKPOINT_LOG.md      ← 체크포인트
  3. interface/AGENT_CONTRACTS.md    ← Handoff
```

---

## Knowledge Debt (기술 부채) 관리

Knowledge Debt: 문서가 실제 상태를 반영하지 못하는 상황

```
감지 방법:
  - CURRENT_STATUS 와 CHECKPOINT_LOG 불일치
  - ADR 상태가 실제 구현과 다름
  - 오래된 PROPOSED 가설이 검증 없이 방치

해소 방법:
  - 발견 즉시 ACTIVE_ISSUES.md 에 등록
  - 다음 작업 시작 전 해소
  - 해소 사유 갱신 이력에 기록
```
