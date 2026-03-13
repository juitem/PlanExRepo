# Job 05: Final Review and Packaging

## Objective
Prepare the extension for release by polishing metadata, testing extreme edge-cases, and packaging a `.vsix`.

---

## 👨‍💻 Developer Agent Tasks
1. Update `README.md` in the project root comprehensively explaining how to use PlanEx, citing the TreeView and Merge operations.
2. Adjust `package.json` keywords, description, publisher, and repository URL.
3. Document any final manual setup required for the end user in a `CHANGELOG.md`.
4. Set status in `current_state.md` to `REVIEW_PENDING`.

## 🧐 Reviewer Agent Tasks
1. Review `README.md` for clarity and completeness. Does it explain what the extension actually does?
2. Verify visual placeholder tags (like `<icon>` or `[insert link]`) are resolved.
3. Check `package.json` for proper semantic versioning and complete meta fields.
4. Approve -> `TEST_PENDING` or Reject -> `DEV_REVISION`.

## 🧪 Tester Agent Tasks
1. Execute terminal command: `npx @vscode/vsce package --no-dependencies` (or standard `package` if deps are installed) to generate a `.vsix`.
2. If errors occur (like missing licenses or repository links), log them and transition to `DEV_REVISION`.
3. If the `.vsix` is successfully created: update `docs/current_state.md`: `Phase 5 -> DONE`.
4. Congratulate the orchestrator. Project Complete!

---
## State Logs
*(Agents must log their handoffs/findings here)*
- **[Date]** - Job created.
