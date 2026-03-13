---
description: Apply the Ralph Loop, Harness Engineering, and Multi-Agent Orchestration methodology to initialize a new project
---

# Ralph Loop Methodology & Multi-Agent Orchestration (PlanEx2 참고용)

이 문서는 PlanEx2 프로젝트에서 사용하는 Ralph Loop 방법론을 요약합니다.
에이전트 워크플로의 구체적인 규칙은 `docs/01_agent_workflow_rules.md`를 참조하세요.

## 핵심 원칙

1. **에이전트는 무상태(Stateless)**: 각 에이전트는 이전 대화를 전혀 기억하지 못합니다. 모든 상태는 파일 시스템에 기록됩니다.
2. **State Machine**: `docs/current_state.md`가 중앙 Kanban 보드 역할을 합니다.
3. **Job Blueprints**: `docs/jobs/job_XX_*.md`가 각 Phase의 상세 요구사항을 정의합니다.
4. **Knowledge Base**: `docs/lessons_learned.md`가 실수 방지 지식을 축적합니다.
5. **ADR**: 코딩 전 아키텍처 결정을 `docs/adr/`에 기록합니다.
6. **Harness First**: Phase 0에서 반드시 테스트 인프라를 먼저 구축합니다.

## Phase 흐름 요약

```
Phase 0: Harness (테스트 인프라)
    ↓
Phase 1: Init (Extension 스캐폴딩)
    ↓
Phase 2: Compare Engine (순수 비교 로직)
    ↓
Phase 3: TreeView (사이드바 UI)
    ↓
Phase 4: Diff Navigation (diff 뷰어 + 네비게이션)
    ↓
Phase 5: Merge Engine (파일/폴더 머지)
    ↓
Phase 6: Conflict Detection (git 기반 충돌 감지)
    ↓
Phase 7: Package (VSIX 패키징 + 품질 검증)
```

## 에이전트 루프 한 사이클

```
[사용자가 Developer 프롬프트 전달]
    → Developer reads current_state.md
    → Developer reads lessons_learned.md
    → Developer reads active Job file
    → Developer writes ADR (if new module)
    → Developer writes code
    → Developer updates current_state.md (→ REVIEW_PENDING)
    → Developer reports to user
[사용자가 Reviewer 프롬프트 전달]
    → Reviewer reads current_state.md
    → Reviewer reads lessons_learned.md
    → Reviewer checks code against Job checklist
    → [Issues found] → Reviewer updates Job Feedback + lessons_learned → REVIEW_PENDING → DEV_REVISION
    → [Approved] → Reviewer updates current_state.md (→ TEST_PENDING)
[사용자가 Tester 프롬프트 전달]
    → Tester reads current_state.md
    → Tester reads lessons_learned.md
    → Tester runs npm test + checks DoD
    → [Failed] → Tester updates Job Test Failures + lessons_learned → TEST_PENDING → DEV_REVISION
    → [Passed] → Tester updates current_state.md (Phase N → DONE, Phase N+1 → DEV_PENDING)
[반복]
```
