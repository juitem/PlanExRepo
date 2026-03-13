# Job 03: Diff Viewing and Merge Operations

## Objective
Integrate file-level comparison using VS Code's internal commands, and add the core functional logic to merge files.

---

## 👨‍💻 Developer Agent Tasks
1. **[ADR Required]**: Create an ADR in `docs/adr/` regarding the design of `MergeOperations.ts` (e.g., whether to use a class-based or functional approach, and how errors will be bubbled up to the UI).
2. Modifying `DiffItem` behavior: When a `Modified` item is clicked, execute the built-in command `vscode.commands.executeCommand('vscode.diff', sourceUri, targetUri, "Source vs Target")`.
3. Create `src/MergeOperations.ts`.
4. Implement `mergeFile(sourceUri, targetUri)` using `vscode.workspace.fs.copy(sourceUri, targetUri, { overwrite: true })`.
5. Implement `deleteFile(targetUri)` using `vscode.workspace.fs.delete(targetUri)`.
6. Implement `mergeDirectory` to recursively copy new/modified items.
7. Create logic in `DiffTreeProvider.ts` to track a flattened list of modified `DiffItem`s so we can easily resolve the "Next File" and "Previous File" based on the currently selected item.
8. Set status in `current_state.md` to `REVIEW_PENDING`.

## 🧐 Reviewer Agent Tasks
1. Review `MergeOperations.ts` to ensure destructive operations (overwrites/deletes) have safety checks or standard VS Code API error handling.
2. Confirm the exact VS Code diff command uses appropriate `Uri` objects instead of raw strings.
3. Determine if architectural flow is clean; if yes -> `TEST_PENDING`, if no -> `DEV_REVISION`.

## 🧪 Tester Agent Tasks
1. Run `npm run compile`.
2. Ensure UI-less methods inside `MergeOperations.ts` are technically sound without referencing undefined UI pieces.
3. If successful, update `docs/current_state.md`: `Phase 3 -> DONE`, `Phase 4 -> DEV_PENDING`.

---
## State Logs
*(Agents must log their handoffs/findings here)*
- **[Date]** - Job created.
