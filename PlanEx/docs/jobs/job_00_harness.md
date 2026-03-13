# Phase 0: Harness Engineering Self-Test & Environment Setup

## Objective
Before allowing any Developer, Reviewer, or Tester to start coding PlanEx, we must ensure the "Harness" itself is fully functional. The Harness is the testing environment, mocking infrastructure, and CI/CD execution context.

---

## 👨‍💻 Developer Agent Tasks
1. Initialize a basic Node.js test harness environment (e.g. `npm init -y`, `npm install typescript @types/node ts-node --save-dev`).
2. Create `harness/mock_vscode_api.ts`. This file should export mock versions of `vscode.workspace.fs`, `vscode.commands`, and `vscode.window` so that isolated business logic can be tested *without* launching the heavy VS Code extension host.
3. Write a simple sanity-check test script in `harness/sanity.test.ts` that imports the mock VS Code API and asserts it exists.
4. Add a `test:harness` script to `package.json`.
5. Set status in `current_state.md` to `REVIEW_PENDING`.

## 🧐 Reviewer Agent Tasks
1. Verify the mocked `vscode` API reflects the actual API surface we need for PlanEx (`readDirectory`, `copy`, `delete`).
2. Ensure the `harness/` directory is isolated from the `src/` directory (extension source code).
3. If the harness isn't robust enough to fake a file system difference, add feedback and set to `DEV_REVISION`.
4. If approved, set state to `TEST_PENDING`.

## 🧪 Tester Agent Tasks
1. Run `npm run test:harness`.
2. The sanity test must pass, proving the harness can mock VS Code behavior locally.
3. If successful, update `docs/current_state.md`: `Phase 0 -> DONE`, `Phase 1 -> DEV_PENDING`.

---
## State Logs
*(Agents must log their handoffs/findings here)*
- **[Date]** - Job created.
