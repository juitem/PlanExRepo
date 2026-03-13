# PlanEx2: Advanced Folder & File Merge VS Code Extension

## 1. Project Goal

Develop a **Visual Studio Code Extension** named **PlanEx2** that enables users to compare two directories side-by-side, navigate differences at both folder and file level, and perform selective merges with fine-grained control. PlanEx2 is a clean-room re-implementation with a richer UI and a more robust merge engine compared to its predecessor.

## 2. Core Features

### 2-1. Folder Comparison
- Select two root directories: **Left (Source)** and **Right (Target)** via a command palette or sidebar UI.
- Recursively scan both directories and compute a diff tree.
- Categorize every entry as one of:
  - `ADDED` — exists in Source only
  - `DELETED` — exists in Target only
  - `MODIFIED` — exists in both but content differs (hash mismatch)
  - `UNCHANGED` — exists in both and content is identical

### 2-2. TreeView Sidebar Panel
- A dedicated ActivityBar icon opens the **PlanEx2 Explorer** sidebar.
- Displays a hierarchical tree mirroring the folder structure.
- Each node is decorated with a colored badge/icon (green=Added, red=Deleted, yellow=Modified, grey=Unchanged).
- Folder nodes show a **summary count** of changes within them.
- Only folders/files with at least one change are shown by default (toggleable).

### 2-3. File-Level Merge
- Right-click a file node → **"Merge Source → Target"** copies the source file to the target path.
- Right-click a file node → **"Merge Target → Source"** (reverse direction).
- Confirmation dialog shows file paths before overwriting.
- After merge, the node refreshes to `UNCHANGED`.

### 2-4. Folder-Level Merge
- Right-click a folder node → **"Merge Folder Source → Target"** recursively merges all ADDED and MODIFIED files.
- Option to exclude DELETED files (i.e., do NOT delete from Target).
- Progress notification shown during bulk merges.

### 2-5. Inline File Diff
- Click any MODIFIED file → opens VS Code's native **diff editor** (`vscode.diff`) comparing Source ↔ Target.
- Navigation: **Next Diff File / Prev Diff File** commands traverse the tree.
- Navigation: **Next Hunk / Prev Hunk** commands navigate within the open diff editor.

### 2-6. Conflict Awareness
- Detect **mutual modifications**: files modified in both Left and Right since a common base (if `.git` is available via `git merge-base`).
- Mark such files with a ⚠️ `CONFLICT` badge.
- Conflict files open in the diff editor; user must manually resolve (no auto-merge on conflicts).

### 2-7. Ignore Rules
- Respect a `.planex2ignore` file in either root (gitignore-style patterns).
- By default exclude: `node_modules/`, `.git/`, `*.DS_Store`, `Thumbs.db`.

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript (strict mode) |
| Runtime | Node.js (via VS Code Extension Host) |
| VS Code APIs | `vscode.TreeDataProvider`, `vscode.workspace.fs`, `vscode.commands`, `vscode.window`, `vscode.diff` |
| Hashing | Node.js built-in `crypto` (MD5/SHA256 for file change detection) |
| Ignore rules | `ignore` npm package (gitignore semantics) |
| Testing | Mocha + `@vscode/test-electron` (integration), custom mock for unit tests |
| Packaging | `vsce` (VS Code Extension CLI) |

## 4. Non-Goals (Out of Scope for v1)

- Three-way merge (common ancestor merge with auto-resolve)
- Real-time file watching / auto-refresh (manual refresh only)
- Remote / SSH workspace comparison
- Binary file diffing (binary files are flagged but cannot be diffed inline)

## 5. Directory Layout (Target)

```
PlanEx2/
├── docs/                    ← Agent work documents (YOU ARE HERE)
│   ├── 00_project_overview.md
│   ├── 01_agent_workflow_rules.md
│   ├── current_state.md
│   ├── lessons_learned.md
│   ├── PROMPT_TO_START.md
│   ├── adr/
│   │   └── template.md
│   └── jobs/
│       ├── job_00_harness.md
│       ├── job_01_init.md
│       ├── job_02_compare_engine.md
│       ├── job_03_treeview.md
│       ├── job_04_diff_navigation.md
│       ├── job_05_merge_engine.md
│       ├── job_06_conflict_detection.md
│       └── job_07_package.md
├── src/
│   ├── extension.ts
│   ├── compareEngine.ts
│   ├── treeProvider.ts
│   ├── mergeEngine.ts
│   ├── conflictDetector.ts
│   ├── ignoreRules.ts
│   └── commands/
│       ├── compareFolders.ts
│       ├── mergeFile.ts
│       ├── mergeFolder.ts
│       └── navigate.ts
├── test/
│   ├── harness/
│   │   └── mockVscode.ts
│   └── suite/
│       ├── compareEngine.test.ts
│       ├── mergeEngine.test.ts
│       └── treeProvider.test.ts
├── package.json
├── tsconfig.json
└── .vscodeignore
```
