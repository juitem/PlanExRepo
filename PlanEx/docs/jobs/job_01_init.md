# Job 01: Project Initialization

## Objective
Set up the standard VS Code Extension project scaffold for `PlanEx`.

---

## 👨‍💻 Developer Agent Tasks
1. Initialize the project using `npx --yes yo code` (or manual `package.json` creation) configured for TypeScript, npm, and no webpack (for simplicity in dev, add later if needed).
    - Extension Name: `PlanEx`
    - Identifier: `planex`
2. Update `package.json`:
    - Define basic activation events (`onCommand:planex.compareFolders`).
    - Define the basic command in `contributes.commands`.
3. Create `src/extension.ts` with a basic "Hello World" or "Compare Folders" command to test activation.
4. Set status in `current_state.md` to `REVIEW_PENDING`.

## 🧐 Reviewer Agent Tasks
1. Verify the `package.json` has correctly implemented the `planex.compareFolders` command structure without exposing unnecessary boilerplate.
2. Check `src/extension.ts` for clean TS code and a registered `planex.compareFolders` command without legacy `yo code` artifacts.
3. If issues found, list them here in a `Feedback` section and set state to `DEV_REVISION`.
4. If approved, set state to `TEST_PENDING`.

## 🧪 Tester Agent Tasks
1. Verify compiling (`npm run compile`) works without errors.
2. Add a `console.log` and verify the code can theoretically be launched in the VS Code Extension Development Host (F5).
3. If build fails, list errors here in a `Test Failures` section and set state to `DEV_REVISION`.
4. If test passes, update `docs/current_state.md`: `Phase 1 -> DONE`, `Phase 2 -> DEV_PENDING`.

---
## State Logs
*(Agents must log their handoffs/findings here)*
- **[Date]** - Job created.
