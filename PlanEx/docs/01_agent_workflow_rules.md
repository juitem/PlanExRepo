# Agent Orchestration & Harness Rules (Ralph Loop)

This project uses a **Multi-Agent Orchestration Framework** where isolated, stateless AI Agents collaborate by assuming specialized roles (Developer, Reviewer, Tester). To ensure seamless continuity regardless of the agent's memory, we adhere to a strict **Ralph Loop / Harness Engineering** state-machine pattern via the file system.

## Agent Roles
1. **Developer Agent**: Writes the code and implements the features according to the active Job blueprint.
2. **Reviewer Agent**: Reviews the Developer's code against the job requirements, architectural guidelines, and checks for bugs or anti-patterns.
3. **Tester Agent**: Executes tests, validates the build, and performs manual/automated verification to ensure the code meets the Definition of Done.

## Workflow Execution Rules
1. **Initialize Context**: Every time an agent is invoked, it MUST immediately read:
    - `docs/current_state.md` (to find the active phase and role)
    - `docs/lessons_learned.md` (to review past mistakes and absolute rules)
2. **Identify Role and Task**: `docs/current_state.md` defines the `ACTIVE_JOB` and which role is currently required (e.g., `DEV_PENDING`, `REVIEW_PENDING`, `TEST_PENDING`). The agent must assume the persona of the required role.
3. **Architecture Decision Records (ADR)**: Before writing ANY code for a new module or feature, the Developer Agent **MUST** write an ADR document in `docs/adr/` (e.g., `0001-treeview-rendering-strategy.md`) explaining the design choices.
4. **Execute Role Duty**: Read the target job file (e.g., `docs/jobs/job_01_init.md`) carefully. Perform the specific duties assigned to your role.
4. **State Transition**: After completing your duty, update `docs/current_state.md` to transition the state.
    - Developer completes coding: `DEV_PENDING` ➔ `REVIEW_PENDING`
    - Reviewer finds issues: `REVIEW_PENDING` ➔ `DEV_REVISION`
    - Reviewer approves: `REVIEW_PENDING` ➔ `TEST_PENDING`
    - Tester finds issues: `TEST_PENDING` ➔ `DEV_REVISION`
    - Tester approves: `TEST_PENDING` ➔ `DONE` (Activate the next Phase, set to `DEV_PENDING`)
5. **Knowledge Management (CRITICAL)**: If a Reviewer or Tester rejects Developer code, they **MUST** append the root cause or rule violated to `docs/lessons_learned.md` before transitioning to `DEV_REVISION`.
6. **Handoff / Terminate**: Provide a summary of actions/feedback in the chat/output, and safely terminate. The orchestration loop will wake up the next relevant agent to pick up the new state.

## Rules of Engagement
- **Do not assume memory**: Always write down crucial feedback, architectural decisions, or bugs in a `.feedback.md` or directly inside the Job file using a "Status / Log" section. The next agent will NOT remember what you did unless it is written to disk.
- **Strict Role Boundary**: A Developer agent should not approve its own code. A Reviewer agent shouldn't write large features (only small suggestions or rejections).
- **Keep it atomic**: Focus only on the current state and role. Do not proceed to the next job until the current job reaches `DONE`.
