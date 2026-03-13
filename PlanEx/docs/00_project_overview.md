# PlanEx: Folder & File Merge VS Code Extension

## 1. Project Goal
Develop a Visual Studio Code extension named **PlanEx** that allows users to compare two directories, view differences at the file level (like Beyond Compare or VS Code's native diff), and merge changes selectively.

## 2. Core Features
- **Folder Selection**: Select two directories (Source and Target) to compare.
- **Diff Tree View**: A Sidebar UI (TreeView) displaying the hierarchical comparison of the two folders. Files will be tagged as Added, Deleted, Modified, or Unchanged.
- **Targeted Merging Strategy**:
  - **Folder Level**: Merge whole directories recursively.
  - **File Level**: Overwrite specific target files individually.
  - **Line Level**: Supported by opening the file in VS Code diff editor where granular hunks can be copied over or edited interactively.
- **Diff Navigation UI**: 
  - Ability to jump to the **Next/Prev Modified File** in the tree.
  - Ability to jump to the **Next/Prev Diff Hunk (Line)** within the open file diff editor.
- **Merge Actions**: Inline actions in the TreeView and Diff Editor to merge files (copying source to target).

## 3. Tech Stack
- TypeScript / Node.js
- VS Code Extension API (`vscode.workspace.fs`, `vscode.commands`, `vscode.window.createTreeView`)
- Built-in `vscode.diff` command for rich file comparisons.
