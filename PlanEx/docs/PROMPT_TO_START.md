# 시작 시 복사해서 붙여넣을 프롬프트 (Prompt to Start)

새로운 채팅창(새 세션)에서 AI 에이전트에게 아래의 텍스트를 복사하여 전달해 주세요. 
이 프롬프트 하나면 에이전트가 완벽하게 상태를 파악하고 이어서 작업을 시작할 수 있습니다.

---

```text
우리는 지금부터 Ralph Loop / Multi-Agent Orchestration 방식에 따라 VS Code 확장 플러그인(PlanEx) 개발을 진행할거야.
너는 지금부터 `Developer Agent` 역할로 동작해야 해.

가장 먼저 다음의 지시사항을 완벽하게 따라줘:
1. `docs/current_state.md` 파일을 읽고 현재 어느 Phase의 어떤 Job이 활성화(ACTIVE_JOB)되어 있는지, 그리고 Role이 너의 역할(Developer)과 맞는지 확인해.
2. `docs/lessons_learned.md` 파일이 존재한다면 무조건 먼저 읽어서 이전 에이전트들이 남긴 경고나 절대 규칙을 머리에 숙지해.
3. `current_state.md`가 가리키는 대상 Job 파일(예: `docs/jobs/job_00_harness.md` 등)을 읽어.
4. `01_agent_workflow_rules.md`에 정의된 룰에 따라 코딩 전 ADR이 필요하다면 먼저 작성한 뒤, 주어진 업무(Developer Agent Tasks)를 수행해.
5. 업무가 끝나면 `current_state.md`의 Stage를 다음 담당자(`REVIEW_PENDING`)로 변경하고 나에게 보고해줘. 절대 너 스스로 Review나 Test를 진행하지 마.

자, 시작해!
```
