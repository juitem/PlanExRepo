# PlanEx2 — Folder & File Merger for VS Code

Compare two directories and selectively merge files and folders, with conflict detection.

## Features

- **Folder Comparison** — Select two directories (Source / Target) and view a hierarchical diff tree
- **Status Badges** — Files tagged as Added (🟢), Deleted (🔴), Modified (🟡), Unchanged (⚪), Conflict (⚠️)
- **File-level Merge** — Copy individual files Source → Target or Target → Source
- **Folder-level Merge** — Bulk merge all changes in a directory, with optional deletion of removed files
- **Inline Diff** — Click any modified file to open VS Code's built-in diff editor
- **Navigation** — Jump between modified files and diff hunks with keyboard shortcuts
- **Conflict Detection** — Git-based detection of files modified on both sides (requires git)
- **Ignore Rules** — Respects `.planex2ignore` (gitignore-style patterns); `node_modules`, `.git` excluded by default

## Usage

1. Open the **PlanEx2** icon in the Activity Bar (or run `PlanEx2: Compare Folders` from the Command Palette)
2. Select a **Source** folder, then a **Target** folder
3. The diff tree appears in the sidebar
4. Right-click any file/folder for merge options, or click a modified file to open the diff editor

## Merge Directions

| Command | Direction |
|---|---|
| Merge File → Target | Copies Source file to Target |
| Merge File → Source | Copies Target file to Source |
| Merge Folder → Target | Bulk copies Source folder to Target |

> ⚠️ A confirmation dialog is always shown before overwriting files.

## Conflict Handling

Files detected as modified on **both sides** (via `git merge-base`) are marked as **CONFLICT** and cannot be auto-merged. Open the diff editor and resolve manually.

## Ignore Rules

Create a `.planex2ignore` file in either root directory using gitignore syntax:

```
*.log
build/
dist/
```

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Alt+N` | Next modified file |
| `Alt+P` | Previous modified file |
| `Alt+.` | Next diff hunk |
| `Alt+,` | Previous diff hunk |

## Requirements

- VS Code 1.85 or later
- `git` in PATH (optional, for conflict detection)

## Known Limitations

- Binary files are shown in the diff tree but cannot be diffed inline
- No real-time file watching — use the Refresh button after external changes
- Three-way merge (auto-resolve) is not supported
