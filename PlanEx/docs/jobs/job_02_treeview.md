# Job 02: Diff TreeView Data Provider

## Objective
Implement a VS Code `TreeDataProvider` to display the file structures of the two compared folders.

---

## 👨‍💻 Developer Agent Tasks
1. **[ADR Required]**: Create an ADR in `docs/adr/` regarding the `DiffTreeProvider` data structure and how infinite loops from symlinks or deep directories will be handled.
2. In `src/`, create a new module `DiffTreeProvider.ts` implementing `vscode.TreeDataProvider<DiffItem>`.
2. Define `DiffItem` standardizing elements (Folder, File) and their status (`Unchanged`, `Added`, `Deleted`, `Modified`).
3. Create a logic module `DirectoryCompare.ts` that recursively reads two given directory paths (`vscode.workspace.fs.readDirectory`) and builds a tree of differences.
4. Register the TreeView in `src/extension.ts` using `vscode.window.registerTreeDataProvider`.
5. Add the view configuration to `package.json` under `contributes.views` (create a custom `PlanEx` view container in the Activity Bar/Sidebar).
6. Set status in `current_state.md` to `REVIEW_PENDING`.

## 🧐 Reviewer Agent Tasks
1. Review `DirectoryCompare.ts` logic. Are recursive calls handled optimally avoiding infinite loops in symlinks? Is `vscode.workspace.fs` used properly over raw `fs` where applicable?
2. Review `DiffTreeProvider.ts` to ensure UI scaling is addressed (e.g. `collapsibleState` handling).
3. Provide feedback below and set to `DEV_REVISION` if needed, else `TEST_PENDING`.

## 🧪 Tester Agent Tasks
1. Run `npm run compile`.
2. Ensure no linting errors exist in the newly added `DiffTreeProvider` files.
3. Verify that the command configuration in `package.json` connects cleanly to the registered view.
4. If successful, update `docs/current_state.md`: `Phase 2 -> DONE`, `Phase 3 -> DEV_PENDING`.

---
## State Logs
*(Agents must log their handoffs/findings here)*
- **[Date]** - Job created.
