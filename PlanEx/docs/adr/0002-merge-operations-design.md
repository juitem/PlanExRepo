# 0002 - MergeOperations Design

Date: 2026-03-13

## Status
Accepted

## Context
PlanEx needs to merge files between two directories. The merge module must handle three operations: copy file, delete file, and recursive directory merge. We need to decide between a class-based or functional approach, and how errors (e.g., permission denied, file locked) will be communicated to the user.

## Decision
1. **Functional approach**: `MergeOperations.ts` will export stateless functions (`mergeFile`, `deleteFile`, `mergeDirectory`). No class is needed since these operations carry no state.
2. **Error handling**: All functions will throw errors, and the caller (command handlers in `extension.ts`) will catch them and show `vscode.window.showErrorMessage(...)` to the user. This keeps the merge module UI-agnostic and testable in the harness.
3. **Strictly `vscode.workspace.fs`**: Consistent with ADR-0001, we will not use raw `fs` to ensure VFS compatibility.

## Consequences
- The merge module remains pure logic, easily testable via the mock harness.
- All UI error presentation is centralized in the command handlers.
