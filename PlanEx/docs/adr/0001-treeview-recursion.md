# 0001 - DiffTreeProvider and Directory Recursion Handling

Date: 2026-03-13

## Status
Accepted

## Context
When comparing two large directories, we must render a hierarchical view of the differences in VS Code's sidebar. Reading deep directories poses two risks:
1. Infinite loops caused by symlinks pointing back to parent directories.
2. Performance bottlenecks reading deeply nested folders that the user might not even expand in the tree UI.

## Decision
1. **Lazy Loading vs Eager Traversal**: We will use Eager Traversal up to a reasonable depth or process the entire structure in the background. For phase 2, we will process eagerly but rely strictly on `vscode.workspace.fs.readDirectory` which handles basic VFS mapping, but we MUST implement a visited-path `Set<string>` to track symlink targets to break infinite loops.
2. **Data Structure (`DiffItem`)**: We will extend `vscode.TreeItem`. The `DiffItem` will hold references to `sourceUri` and `targetUri`, and a `status` property (`Unchanged`, `Added`, `Deleted`, `Modified`). 
3. **No raw `fs`**: We will strictly use `vscode.workspace.fs` to ensure compatibility with remote workspaces (e.g. Remote SSH or WSL).

## Consequences
- Eager traversal might be slow on massive directories (like `node_modules`). We may need to add ignore mechanisms later.
- VFS compatibility ensures the extension works broadly.
