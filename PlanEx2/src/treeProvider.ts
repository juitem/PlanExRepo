import * as vscode from 'vscode';
import { CompareResult, DiffEntry, DiffStatus } from './compareEngine';

// ─── Icon Mapping ─────────────────────────────────────────────────────────────

const STATUS_ICONS: Record<DiffStatus, vscode.ThemeIcon> = {
  ADDED:     new vscode.ThemeIcon('diff-added',    new vscode.ThemeColor('gitDecoration.addedResourceForeground')),
  DELETED:   new vscode.ThemeIcon('diff-removed',  new vscode.ThemeColor('gitDecoration.deletedResourceForeground')),
  MODIFIED:  new vscode.ThemeIcon('diff-modified', new vscode.ThemeColor('gitDecoration.modifiedResourceForeground')),
  UNCHANGED: new vscode.ThemeIcon('circle-outline'),
  CONFLICT:  new vscode.ThemeIcon('warning',       new vscode.ThemeColor('list.warningForeground')),
};

const STATUS_CONTEXT: Record<DiffStatus, string> = {
  ADDED:     'added',
  DELETED:   'deleted',
  MODIFIED:  'modified',
  UNCHANGED: 'unchanged',
  CONFLICT:  'conflict',
};

// ─── DiffTreeItem ─────────────────────────────────────────────────────────────

export class DiffTreeItem extends vscode.TreeItem {
  constructor(public readonly entry: DiffEntry) {
    super(
      entry.name,
      entry.isDirectory
        ? vscode.TreeItemCollapsibleState.Expanded
        : vscode.TreeItemCollapsibleState.None
    );

    this.iconPath = STATUS_ICONS[entry.status];
    this.contextValue = entry.isDirectory ? 'folder' : STATUS_CONTEXT[entry.status];
    this.tooltip = entry.relativePath;

    if (entry.isDirectory) {
      const changeCount = countChanges(entry);
      this.description = changeCount > 0 ? `(${changeCount} changes)` : '';
      // 변경 없는 폴더는 접힌 상태로
      if (changeCount === 0) {
        this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
      }
    } else {
      this.description = entry.status;
      // MODIFIED, CONFLICT 파일은 클릭 시 diff 에디터 오픈
      if (entry.status === 'MODIFIED' || entry.status === 'CONFLICT') {
        this.command = {
          command: 'planex2.openDiff',
          title: 'Open Diff',
          arguments: [entry],
        };
      }
    }
  }
}

function countChanges(entry: DiffEntry): number {
  if (!entry.children) return 0;
  return entry.children.reduce((sum, child) => {
    if (child.isDirectory) return sum + countChanges(child);
    return sum + (child.status !== 'UNCHANGED' ? 1 : 0);
  }, 0);
}

// ─── DiffTreeProvider ─────────────────────────────────────────────────────────

export class DiffTreeProvider implements vscode.TreeDataProvider<DiffTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<DiffTreeItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private compareResult: CompareResult | null = null;
  private showUnchanged = false;
  private sourceRoot: string | null = null;
  private targetRoot: string | null = null;

  /** 비교 중인 폴더 경로를 설정합니다 (TreeView description 표시용). */
  setRoots(source: string, target: string): void {
    this.sourceRoot = source;
    this.targetRoot = target;
  }

  getRoots(): { source: string | null; target: string | null } {
    return { source: this.sourceRoot, target: this.targetRoot };
  }

  setResult(result: CompareResult | null): void {
    this.compareResult = result;
    this._onDidChangeTreeData.fire();
  }

  getCurrentResult(): CompareResult | null {
    return this.compareResult;
  }

  toggleShowUnchanged(): void {
    this.showUnchanged = !this.showUnchanged;
    this._onDidChangeTreeData.fire();
  }

  isShowingUnchanged(): boolean {
    return this.showUnchanged;
  }

  /**
   * 특정 파일을 UNCHANGED로 마킹합니다 (머지 완료 후 UI 갱신용).
   */
  markAsUnchanged(relativePath: string): void {
    if (!this.compareResult) return;
    markEntryUnchanged(this.compareResult.entries, relativePath);
    // 카운트 재계산
    this.compareResult.totalModified = countStatusInResult(this.compareResult.entries, 'MODIFIED');
    this.compareResult.totalAdded = countStatusInResult(this.compareResult.entries, 'ADDED');
    this.compareResult.totalDeleted = countStatusInResult(this.compareResult.entries, 'DELETED');
    this._onDidChangeTreeData.fire();
  }

  /**
   * MODIFIED/CONFLICT/ADDED/DELETED 파일 목록을 순서대로 반환합니다 (네비게이션용).
   */
  getModifiedFiles(): DiffEntry[] {
    if (!this.compareResult) return [];
    const result: DiffEntry[] = [];
    collectModifiedFiles(this.compareResult.entries, result);
    return result;
  }

  getTreeItem(element: DiffTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: DiffTreeItem): vscode.ProviderResult<DiffTreeItem[]> {
    if (!this.compareResult) return [];

    const entries = element ? (element.entry.children ?? []) : this.compareResult.entries;
    return this.filterEntries(entries).map((e) => new DiffTreeItem(e));
  }

  private filterEntries(entries: DiffEntry[]): DiffEntry[] {
    if (this.showUnchanged) return entries;
    return entries.filter((e) => {
      if (e.isDirectory) {
        // 변경사항이 있는 폴더만 표시
        return countChanges(e) > 0 || e.status === 'ADDED' || e.status === 'DELETED';
      }
      return e.status !== 'UNCHANGED';
    });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function markEntryUnchanged(entries: DiffEntry[], relativePath: string): void {
  for (const entry of entries) {
    if (entry.relativePath === relativePath) {
      entry.status = 'UNCHANGED';
      return;
    }
    if (entry.isDirectory && entry.children) {
      markEntryUnchanged(entry.children, relativePath);
    }
  }
}

function countStatusInResult(entries: DiffEntry[], status: DiffStatus): number {
  let count = 0;
  for (const entry of entries) {
    if (!entry.isDirectory && entry.status === status) count++;
    if (entry.children) count += countStatusInResult(entry.children, status);
  }
  return count;
}

function collectModifiedFiles(entries: DiffEntry[], result: DiffEntry[]): void {
  for (const entry of entries) {
    if (entry.isDirectory) {
      if (entry.children) collectModifiedFiles(entry.children, result);
    } else if (entry.status !== 'UNCHANGED') {
      result.push(entry);
    }
  }
}
