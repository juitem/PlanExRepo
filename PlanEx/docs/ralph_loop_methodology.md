---
description: Apply the Ralph Loop, Harness Engineering, and Multi-Agent Orchestration methodology to initialize a new project
---

# Ralph Loop Methodology & Multi-Agent Orchestration

When a user requests to develop a new application using the "Ralph Loop" or "Harness Engineering" methodology, you must scaffold the project documentation to support detached, stateless multi-agent collaboration before writing any functional code.

## Core Principles to Scaffold

1. **Agent Roles**: Divide the workflow into `Developer`, `Reviewer`, and `Tester`.
2. **State Machine (`docs/current_state.md`)**: A centralized Kanban-like board that tracks the `Active Phase`, `Active Job`, and `Required Role` (e.g., `DEV_PENDING`, `REVIEW_PENDING`, `TEST_PENDING`, `DEV_REVISION`, `DONE`).
3. **Job Blueprints (`docs/jobs/...`)**: Atomic, step-by-step markdown files detailing the exact requirements and DoD (Definition of Done) for each agent role in a specific phase.
4. **Knowledge Base (`docs/lessons_learned.md`)**: A feedback loop mechanism. Every agent MUST read this file upon waking up to avoid repeating mistakes rejected by Reviewers/Testers.
5. **Architectural Decision Records (`docs/adr/`)**: Before writing actual code, Developer agents must document their architectural choices in an ADR.
6. **Test Harness (`docs/jobs/job_00_harness.md`)**: Phase 0 must ALWAYS be setting up the detached testing environment/mocking framework so the business logic can be tested in isolation.

## Execution Steps

1. Create `docs/00_project_overview.md` defining the application.
2. Create `docs/01_agent_workflow_rules.md` explicitly giving instructions to the LLM agents on how to read state, transition state, and handle ADRs/Lessons Learned.
3. Create `docs/lessons_learned.md` (empty template for rules and anti-patterns).
4. Create `docs/current_state.md`.
5. Create `docs/adr/template.md`.
6. Break down the user's project into atomic tasks and create `docs/jobs/job_00__.md` through `docs/jobs/job_NN__.md`.
7. Define strict `Developer`, `Reviewer`, and `Tester` checklists within every job file.
