import * as vscode from 'vscode';
import { DiffEntry } from '../compareEngine';
import { DiffTreeProvider, DiffTreeItem } from '../treeProvider';

// ─── Open Diff ────────────────────────────────────────────────────────────────

export async function openDiffForEntry(entry: DiffEntry): Promise<void> {
  const sourceUri = entry.sourcePath
    ? vscode.Uri.file(entry.sourcePath)
    : vscode.Uri.parse('untitled:source-empty');
  const targetUri = entry.targetPath
    ? vscode.Uri.file(entry.targetPath)
    : vscode.Uri.parse('untitled:target-empty');
  const title = `PlanEx2: ${entry.relativePath} (Source ↔ Target)`;
  await vscode.commands.executeCommand('vscode.diff', sourceUri, targetUri, title);
}

// ─── DiffNavigator ────────────────────────────────────────────────────────────

export class DiffNavigator {
  private currentIndex = -1;
  private files: DiffEntry[] = [];

  constructor(
    private readonly treeView: vscode.TreeView<DiffTreeItem>,
    private readonly treeProvider: DiffTreeProvider,
  ) {}

  updateFiles(files: DiffEntry[]): void {
    this.files = files;
    this.currentIndex = -1;
  }

  async next(): Promise<void> {
    if (this.files.length === 0) {
      vscode.window.showInformationMessage('PlanEx2: No modified files to navigate.');
      return;
    }
    const newIndex = this.currentIndex + 1;
    if (newIndex >= this.files.length) {
      vscode.window.showInformationMessage('PlanEx2: No more modified files (end of list).');
      return;
    }
    this.currentIndex = newIndex;
    await this.openFileAtIndex(this.currentIndex);
  }

  async prev(): Promise<void> {
    if (this.files.length === 0) {
      vscode.window.showInformationMessage('PlanEx2: No modified files to navigate.');
      return;
    }
    const newIndex = this.currentIndex - 1;
    if (newIndex < 0) {
      vscode.window.showInformationMessage('PlanEx2: No more modified files (start of list).');
      return;
    }
    this.currentIndex = newIndex;
    await this.openFileAtIndex(this.currentIndex);
  }

  private async openFileAtIndex(index: number): Promise<void> {
    const entry = this.files[index];
    if (!entry) return;
    await openDiffForEntry(entry);
    // TreeView에서 해당 노드 reveal 시도
    try {
      const item = new DiffTreeItem(entry);
      await this.treeView.reveal(item, { select: true, focus: false });
    } catch {
      // reveal이 실패해도 diff 에디터는 열림 — 무시
    }
  }
}

// ─── Register Commands ────────────────────────────────────────────────────────

export function registerNavigationCommands(
  context: vscode.ExtensionContext,
  treeProvider: DiffTreeProvider,
  treeView: vscode.TreeView<DiffTreeItem>,
): vscode.Disposable[] {
  const navigator = new DiffNavigator(treeView, treeProvider);

  // treeProvider 데이터 변경 시 navigator 파일 목록 갱신
  const subscription = treeProvider.onDidChangeTreeData(() => {
    navigator.updateFiles(treeProvider.getModifiedFiles());
  });

  const disposables: vscode.Disposable[] = [
    subscription,

    vscode.commands.registerCommand('planex2.openDiff', async (entry: DiffEntry) => {
      await openDiffForEntry(entry);
    }),

    vscode.commands.registerCommand('planex2.nextDiffFile', () => navigator.next()),
    vscode.commands.registerCommand('planex2.prevDiffFile', () => navigator.prev()),

    vscode.commands.registerCommand('planex2.nextHunk', async () => {
      await vscode.commands.executeCommand('editor.action.moveCaretToNextChange');
    }),

    vscode.commands.registerCommand('planex2.prevHunk', async () => {
      await vscode.commands.executeCommand('editor.action.moveCaretToPrevChange');
    }),
  ];

  return disposables;
}
