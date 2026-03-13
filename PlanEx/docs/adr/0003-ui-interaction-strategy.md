# 0003 - UI Interaction and Error Surfacing Strategy

Date: 2026-03-13

## Status
Accepted

## Context
Phase 4 wires merge operations to the UI via context menus and inline buttons. We need to decide how UI errors (permission denied, file locked) are surfaced and how scoping prevents PlanEx menu items from appearing in unrelated views.

## Decision
1. **Scoped menus**: All `view/item/context` menu contributions will use `"when": "view == planex-diff-tree"` to prevent bleeding into the Explorer or other views.
2. **Error presentation**: All command handlers will wrap `MergeOperations` calls in `try/catch` and use `vscode.window.showErrorMessage(...)`. No raw uncaught exceptions.
3. **Post-action refresh**: After every merge/delete operation, call `diffTreeProvider.refresh()` to immediately reflect changes in the tree.
4. **Line-level nav**: VS Code natively provides `Alt+F5` / `Shift+Alt+F5` for next/prev diff hunk within the diff editor. We do not need to reimplement this.

## Consequences
- Users get immediate visual feedback after merge actions.
- PlanEx menus are invisible outside of the PlanEx sidebar.
