# Agent Orchestration & Harness Rules (Ralph Loop)

이 프로젝트는 **Multi-Agent Orchestration** 방식을 사용합니다. 각 에이전트는 독립적이고 상태가 없으며(stateless), 파일 시스템의 상태 문서를 통해서만 서로 소통합니다. 에이전트는 이전 대화를 전혀 기억하지 못한다고 가정합니다.

---

## Agent Roles (에이전트 역할)

| Role | 한글명 | 책임 |
|---|---|---|
| **Developer Agent** | 개발자 에이전트 | Job 파일의 요구사항에 따라 코드를 작성하고 구현합니다. |
| **Reviewer Agent** | 리뷰어 에이전트 | 코드를 검토하고 아키텍처 가이드라인 위반, 버그, 안티패턴을 찾아냅니다. |
| **Tester Agent** | 테스터 에이전트 | 테스트를 실행하고, 빌드를 검증하며, DoD(완료 기준)를 확인합니다. |

---

## 세션 시작 시 필수 절차 (MANDATORY BOOT SEQUENCE)

**에이전트가 세션을 시작할 때 반드시 아래 순서를 따라야 합니다:**

1. **`docs/current_state.md` 읽기** → 현재 활성 Phase, Job 파일 경로, 필요한 Role을 파악합니다.
2. **`docs/lessons_learned.md` 읽기** → 과거 에이전트들이 남긴 경고, 절대 규칙, 알려진 실수를 숙지합니다. 이 파일이 없으면 괜찮습니다.
3. **활성 Job 파일 읽기** → `current_state.md`가 가리키는 `docs/jobs/job_XX_*.md` 파일을 읽습니다.
4. **자신의 Role에 해당하는 Tasks만 수행** → 다른 Role의 Tasks는 절대 실행하지 않습니다.
5. **완료 후 `current_state.md` 업데이트** → Stage를 다음 단계로 전환합니다.

---

## Stage 전환 규칙 (State Machine)

```
DEV_PENDING
    │  (Developer 완료)
    ▼
REVIEW_PENDING
    │  (Reviewer 승인)          (Reviewer 거부)
    ▼                               ▼
TEST_PENDING                   DEV_REVISION
    │  (Tester 승인)                │  (Developer 수정 완료)
    ▼                               ▼
  DONE               →      REVIEW_PENDING
(다음 Phase DEV_PENDING)
```

- `DEV_PENDING`: Developer Agent가 코드를 작성해야 합니다.
- `REVIEW_PENDING`: Reviewer Agent가 코드를 검토해야 합니다.
- `TEST_PENDING`: Tester Agent가 테스트를 실행해야 합니다.
- `DEV_REVISION`: Reviewer 또는 Tester가 문제를 발견했습니다. Developer가 수정해야 합니다.
- `DONE`: 해당 Phase가 완료됐습니다. 다음 Phase를 `DEV_PENDING`으로 설정합니다.

---

## 역할별 절대 규칙 (Non-Negotiable Rules)

### Developer Agent 규칙
1. 새 모듈/기능 코딩 시작 전에 **반드시** `docs/adr/` 에 ADR 문서를 먼저 작성합니다.
2. 자신이 작성한 코드를 스스로 Approve(REVIEW_PENDING → TEST_PENDING)하지 않습니다.
3. Job 파일의 **Developer Agent Tasks** 항목만 수행합니다.
4. 완료 후 해당 Job 파일의 `State Logs` 섹션에 수행 내용을 기록합니다.
5. Stage를 `REVIEW_PENDING`으로 업데이트합니다.

### Reviewer Agent 규칙
1. Job 파일의 **Reviewer Agent Tasks** 체크리스트를 항목별로 검토합니다.
2. 문제 발견 시:
   - Job 파일의 `Reviewer Feedback` 섹션에 구체적인 문제를 기록합니다.
   - `docs/lessons_learned.md`에 재발 방지 규칙을 추가합니다.
   - Stage를 `DEV_REVISION`으로 업데이트합니다.
3. 승인 시: Stage를 `TEST_PENDING`으로 업데이트합니다.
4. 자신이 대규모 코드를 작성하지 않습니다 (소규모 제안이나 거부만 가능).

### Tester Agent 규칙
1. Job 파일의 **Tester Agent Tasks** 체크리스트를 항목별로 검증합니다.
2. 실패 시:
   - Job 파일의 `Test Failures` 섹션에 정확한 오류/실패 내용을 기록합니다.
   - `docs/lessons_learned.md`에 재발 방지 규칙을 추가합니다.
   - Stage를 `DEV_REVISION`으로 업데이트합니다.
3. 성공 시: 현재 Phase를 `DONE`으로, 다음 Phase를 `DEV_PENDING`으로 업데이트합니다.

---

## ADR (Architectural Decision Record) 작성 규칙

- 파일 위치: `docs/adr/NNNN-{slug}.md` (예: `0001-compare-engine-strategy.md`)
- 번호는 순차적으로 부여합니다.
- 반드시 `docs/adr/template.md`를 복사해서 사용합니다.
- ADR 내용: 결정 사항, 왜 이 방법을 선택했는지, 거부한 대안들, 예상 결과.
- ADR은 **변경하지 않습니다**. 결정이 바뀌면 새 ADR을 작성하고 이전 ADR에 `Superseded by ADR-NNNN`을 표시합니다.

---

## 핵심 원칙 (Core Principles)

- **메모리를 가정하지 마세요**: 다음 에이전트는 이 대화를 전혀 기억하지 못합니다. 모든 중요한 정보는 반드시 파일에 기록하세요.
- **원자성 유지**: 현재 Phase의 현재 Role 작업만 수행하세요. 미래 Job에 대해 미리 코딩하지 마세요.
- **역할 경계 준수**: Developer는 Reviewer가 될 수 없습니다. Reviewer는 Tester가 될 수 없습니다.
- **항상 State Log에 기록**: Job 파일의 `State Logs` 섹션에 날짜와 함께 핵심 행동을 남기세요.
