# Job 04: UI Actions & Context Menus

## Objective
Wire up the `MergeOperations.ts` logic to the user interface via inline actions and context menus in the TreeView.

---

## 👨‍💻 Developer Agent Tasks
1. **[ADR Required]**: Create an ADR in `docs/adr/` regarding how UI interactions (Buttons, Context Menus) will trigger state changes and how errors will be surfaced to the user (e.g., `vscode.window.showErrorMessage`).
2. In `package.json`, contribute menu actions under `view/item/context`.
    - `planex.action.mergeFile`
    - `planex.action.mergeFolder`
    - `planex.action.deleteFile`
2. Add global/editor title commands in `package.json` for navigation:
    - `planex.action.nextDiffFile` (Jumps to the next modified file in the tree and opens its diff)
    - `planex.action.prevDiffFile` (Jumps to the previous modified file in the tree and opens its diff)
3. Assign respective inline icons to these commands in `contributes.commands`.
4. In `src/extension.ts`, register these commands (`vscode.commands.registerCommand`) to effectively call functions in `MergeOperations.ts` and UI Navigation Logic.
    - **Line-level Diff Support**: Note that line-level traversing in open files is natively handled by VS Code (`Alt+F5` next change). Ensure the diff editor is opened with a writable generic URI for the target so users can edit/copy lines manually if they want line-by-line vs full file merge.
5. Implement a refresh `EventEmitter` on the `DiffTreeProvider` to forcefully re-render the view post-merge.
6. Set status in `current_state.md` to `REVIEW_PENDING`.

## 🧐 Reviewer Agent Tasks
1. Review the UI contribution points in `package.json`. Are they scoped strictly to `view == planex-diff-tree`? (If not, they'll show up in global explorers too, which is bad).
2. Validate the refresh logic. Does `TreeView.reveal` or `refresh()` get called properly avoiding race conditions?
3. Approve -> `TEST_PENDING` or Reject -> `DEV_REVISION`.

## 🧪 Tester Agent Tasks
1. Run `npm run compile`.
2. Inspect the JSON schema structure of `package.json` to ensure the complex nested menus resolve properly.
3. If successful, update `docs/current_state.md`: `Phase 4 -> DONE`, `Phase 5 -> DEV_PENDING`.

---
## State Logs
*(Agents must log their handoffs/findings here)*
- **[Date]** - Job created.
