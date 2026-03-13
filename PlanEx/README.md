# PlanEx — Folder & File Merge for VS Code

**PlanEx** is a Visual Studio Code extension that lets you compare two directories side-by-side and selectively merge changes at the **folder**, **file**, or **line** level.

## Features

| Feature | Description |
|---|---|
| **Folder Comparison** | Select two directories and see a hierarchical diff tree in the sidebar. |
| **Status Tags** | Each file/folder is tagged as `Added`, `Deleted`, `Modified`, or `Unchanged`. |
| **Click-to-Diff** | Click any modified file to open VS Code's built-in Diff Editor for side-by-side viewing. |
| **Merge File** | Copy a single file from Source → Target with one click (inline button). |
| **Merge Folder** | Recursively merge an entire directory from Source → Target. |
| **Delete from Target** | Remove files that exist only in Target. |
| **Next / Previous Diff** | Navigate between changed files using the ↑↓ buttons in the tree view title bar. |
| **Line-level Editing** | Use VS Code's native diff navigation (`Alt+F5`) to jump between hunks within a file. |

## Getting Started

1. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
2. Run **PlanEx: Compare Folders**.
3. Select a **Source** folder, then a **Target** folder.
4. The **PlanEx** sidebar will populate with the diff tree.

## Commands

| Command | Description |
|---|---|
| `PlanEx: Compare Folders` | Open folder pickers and start comparison. |
| `PlanEx: Refresh` | Re-scan the two folders and refresh the tree. |
| `PlanEx: Merge File` | Copy selected source file to target. |
| `PlanEx: Merge Folder` | Recursively copy source folder to target. |
| `PlanEx: Delete from Target` | Delete the selected file from the target directory. |
| `PlanEx: Next Changed File` | Jump to the next diff item in the tree. |
| `PlanEx: Previous Changed File` | Jump to the previous diff item in the tree. |

## Development

```bash
npm install
npm run compile
# Press F5 in VS Code to launch the Extension Development Host
```

## License
ISC
