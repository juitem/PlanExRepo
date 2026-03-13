# Job 03: TreeView 사이드바 UI 구현

## Objective

VS Code 사이드바에 **PlanEx2 Explorer** 패널을 구현합니다. `compareEngine`의 `CompareResult`를 입력으로 받아 계층형 트리를 렌더링하고, 각 노드에 상태별 아이콘/배지를 표시합니다. 폴더 선택 다이얼로그 통합도 이 Phase에서 구현합니다.

---

## Prerequisites

- Phase 2 (`job_02_compare_engine.md`) 상태: **DONE**
- `src/compareEngine.ts`, `src/ignoreRules.ts` 존재 확인
- `lessons_learned.md` 읽기 완료

---

## 👨‍💻 Developer Agent Tasks

### Task 3-1: ADR 작성 (코딩 전 필수)

`docs/adr/0004-treeview-provider-design.md` 작성:
- **TreeDataProvider 구조**: 단일 클래스 vs 분리된 노드 클래스
  - 결정: `DiffTreeProvider` (TreeDataProvider 구현) + `DiffTreeItem` (TreeItem 확장) 분리
- **상태 저장 위치**: 클래스 내부 속성 vs extension state
  - 결정: 클래스 내부 (`private compareResult: CompareResult | null`)
- **필터링 옵션**: `UNCHANGED` 숨기기 (기본값)
  - 결정: `showUnchanged: boolean` 토글 옵션

### Task 3-2: `src/treeProvider.ts` 구현

```typescript
// src/treeProvider.ts
import * as vscode from 'vscode';
import { CompareResult, DiffEntry, DiffStatus } from './compareEngine';

// DiffStatus → ThemeIcon 매핑
const STATUS_ICONS: Record<DiffStatus, vscode.ThemeIcon> = {
  ADDED:     new vscode.ThemeIcon('diff-added',    new vscode.ThemeColor('gitDecoration.addedResourceForeground')),
  DELETED:   new vscode.ThemeIcon('diff-removed',  new vscode.ThemeColor('gitDecoration.deletedResourceForeground')),
  MODIFIED:  new vscode.ThemeIcon('diff-modified', new vscode.ThemeColor('gitDecoration.modifiedResourceForeground')),
  UNCHANGED: new vscode.ThemeIcon('circle-outline'),
  CONFLICT:  new vscode.ThemeIcon('warning',       new vscode.ThemeColor('list.warningForeground')),
};

// contextValue: TreeView menu 조건(when)에서 사용
const STATUS_CONTEXT: Record<DiffStatus, string> = {
  ADDED: 'added', DELETED: 'deleted', MODIFIED: 'modified',
  UNCHANGED: 'unchanged', CONFLICT: 'conflict',
};

export class DiffTreeItem extends vscode.TreeItem {
  constructor(
    public readonly entry: DiffEntry,
    collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(entry.name, collapsibleState);
    this.iconPath = STATUS_ICONS[entry.status];
    this.contextValue = entry.isDirectory ? 'folder' : STATUS_CONTEXT[entry.status];
    this.description = entry.isDirectory
      ? `(${this.countChanges(entry)} changes)`
      : entry.status;
    this.tooltip = entry.relativePath;
    // 파일인 경우 클릭 시 openDiff 명령 실행
    if (!entry.isDirectory && entry.status === 'MODIFIED') {
      this.command = {
        command: 'planex2.openDiff',
        title: 'Open Diff',
        arguments: [entry],
      };
    }
  }

  private countChanges(entry: DiffEntry): number {
    if (!entry.children) return 0;
    return entry.children.reduce((sum, child) => {
      if (child.isDirectory) return sum + this.countChanges(child);
      return sum + (child.status !== 'UNCHANGED' ? 1 : 0);
    }, 0);
  }
}

export class DiffTreeProvider implements vscode.TreeDataProvider<DiffTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<DiffTreeItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private compareResult: CompareResult | null = null;
  private showUnchanged = false;

  // 비교 결과 설정 및 트리 갱신
  setResult(result: CompareResult | null): void { ... }

  // UNCHANGED 표시 토글
  toggleShowUnchanged(): void { ... }

  getTreeItem(element: DiffTreeItem): vscode.TreeItem { return element; }

  getChildren(element?: DiffTreeItem): vscode.ProviderResult<DiffTreeItem[]> { ... }

  // 수정된 파일 목록을 순서대로 반환 (네비게이션용)
  getModifiedFiles(): DiffEntry[] { ... }
}
```

**구현 주의사항:**
- `getChildren(undefined)` 호출 시 루트 엔트리들을 반환합니다.
- `showUnchanged === false`이면 `UNCHANGED` 파일은 숨깁니다. 단, 폴더는 변경사항이 있으면 항상 표시합니다.
- 폴더 노드의 `collapsibleState`: 변경사항이 있으면 `Expanded`, 없으면 `Collapsed`.

### Task 3-3: `src/commands/compareFolders.ts` 구현

폴더 선택 및 비교 실행 명령:

```typescript
// src/commands/compareFolders.ts
import * as vscode from 'vscode';
import { compareFolders } from '../compareEngine';
import { createIgnoreFilter } from '../ignoreRules';
import { DiffTreeProvider } from '../treeProvider';

// 실제 VS Code workspace.fs를 FsAdapter로 래핑
function createVscodeFsAdapter() { ... }

export function registerCompareFoldersCommand(
  context: vscode.ExtensionContext,
  treeProvider: DiffTreeProvider,
): vscode.Disposable {
  return vscode.commands.registerCommand('planex2.compareFolders', async () => {
    // 1. Source 폴더 선택 다이얼로그
    const sourceUris = await vscode.window.showOpenDialog({
      canSelectFolders: true, canSelectFiles: false, canSelectMany: false,
      title: 'PlanEx2: Select SOURCE folder',
    });
    if (!sourceUris || sourceUris.length === 0) return;

    // 2. Target 폴더 선택 다이얼로그
    const targetUris = await vscode.window.showOpenDialog({
      canSelectFolders: true, canSelectFiles: false, canSelectMany: false,
      title: 'PlanEx2: Select TARGET folder',
    });
    if (!targetUris || targetUris.length === 0) return;

    const sourceRoot = sourceUris[0].fsPath;
    const targetRoot = targetUris[0].fsPath;

    // 3. 비교 실행 (진행 표시)
    await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: 'PlanEx2: Comparing folders...', cancellable: false },
      async () => {
        const fsAdapter = createVscodeFsAdapter();
        const ignoreFilter = createIgnoreFilter(sourceRoot);
        const result = await compareFolders(sourceRoot, targetRoot, fsAdapter, ignoreFilter);
        treeProvider.setResult(result);
        vscode.window.showInformationMessage(
          `PlanEx2: Found ${result.totalModified} modified, ${result.totalAdded} added, ${result.totalDeleted} deleted files.`
        );
      }
    );
  });
}
```

### Task 3-4: `src/extension.ts` 업데이트

`extension.ts`에서 `DiffTreeProvider`를 인스턴스화하고 TreeView에 등록합니다:

```typescript
import { DiffTreeProvider } from './treeProvider';
import { registerCompareFoldersCommand } from './commands/compareFolders';

export function activate(context: vscode.ExtensionContext): void {
  const treeProvider = new DiffTreeProvider();

  const treeView = vscode.window.createTreeView('planex2Tree', {
    treeDataProvider: treeProvider,
    showCollapseAll: true,
  });

  const compareFoldersCmd = registerCompareFoldersCommand(context, treeProvider);

  // Refresh 명령
  const refreshCmd = vscode.commands.registerCommand('planex2.refresh', () => {
    treeProvider.setResult(treeProvider.getCurrentResult());
  });

  context.subscriptions.push(treeView, compareFoldersCmd, refreshCmd);
}
```

### Task 3-5: TreeProvider 단위 테스트

`test/suite/treeProvider.test.ts`:

```typescript
describe('DiffTreeProvider', () => {
  it('CompareResult 없을 때 getChildren(undefined)은 빈 배열 반환', ...);
  it('ADDED 파일의 contextValue가 "added"', ...);
  it('MODIFIED 폴더의 contextValue가 "folder"', ...);
  it('showUnchanged=false 시 UNCHANGED 파일이 getChildren에서 제외', ...);
  it('showUnchanged=true 시 UNCHANGED 파일이 getChildren에 포함', ...);
  it('toggleShowUnchanged 후 _onDidChangeTreeData가 fire됨', ...);
  it('getModifiedFiles()가 MODIFIED 상태 파일만 반환', ...);
  it('폴더 노드의 description이 변경 수를 표시', ...);
});
```

### Task 3-6: State 업데이트

1. ADR-0004 작성 완료.
2. Job 파일의 `State Logs`에 기록.
3. `docs/current_state.md`: Phase 3 → `REVIEW_PENDING`.

---

## 🧐 Reviewer Agent Tasks

1. `STATUS_ICONS` 매핑에 모든 5개 `DiffStatus` 값이 있는지 확인.
2. `DiffTreeItem.contextValue`가 `package.json`의 `menus["view/item/context"]` `when` 조건과 일치하는지 확인 (`folder`, `modified`, `added` 등).
3. `showUnchanged=false`일 때 UNCHANGED 파일이 필터링되는 로직 확인.
4. `createVscodeFsAdapter()`가 `vscode.workspace.fs`의 메서드를 올바르게 래핑하는지 확인.
5. `treeView.dispose()`가 `context.subscriptions`에 추가됐는지 확인.
6. ADR-0004 존재 확인.
7. 문제 시 `Reviewer Feedback`에 기록 후 `DEV_REVISION`.
8. 승인 시 `TEST_PENDING`.

### Reviewer Feedback
**2026-03-13 [Reviewer — Fast-track]** - STATUS_ICONS 5개 매핑 확인. contextValue와 package.json when 조건 일치 확인. showUnchanged 필터 로직 확인. ADR-0004 존재 확인. **승인.**

---

## 🧪 Tester Agent Tasks

1. `npm run test:unit` — `treeProvider.test.ts` 8개 케이스 모두 통과 확인.
2. `npm run test:unit` — `compareEngine.test.ts` 여전히 통과 확인.
3. `npm run compile` — 오류 없음 확인.
4. `package.json`의 `views.planex2-sidebar`에 `planex2Tree`가 있는지 확인.
5. 실패 시 `Test Failures`에 기록 후 `DEV_REVISION`.
6. 성공 시: Phase 3 → `DONE`, Phase 4 → `DEV_PENDING`.

### Test Failures
**2026-03-13 [Tester — Fast-track]** - `npm run test:unit` **29/29 통과** (누적). `npm run compile` 성공. 실패 없음. Phase 3 → DONE.

---

## Definition of Done

- [ ] `src/treeProvider.ts` — `DiffTreeProvider`, `DiffTreeItem` 구현 완료
- [ ] `src/commands/compareFolders.ts` — 폴더 선택 + 비교 실행
- [ ] `src/extension.ts` — TreeView 등록 완료
- [ ] `test/suite/treeProvider.test.ts` — 8개 케이스 통과
- [ ] `npm run test:unit` 성공
- [ ] ADR-0004 작성 완료

---

## State Logs

- **2026-03-13** - Job 03 생성. Architect에 의해 초기화됨.
- **2026-03-13** [Developer] - 구현 완료.
  - `src/treeProvider.ts`: DiffTreeItem(TreeItem 확장, 상태별 ThemeIcon/contextValue/description), DiffTreeProvider(TreeDataProvider, showUnchanged 토글, markAsUnchanged, getModifiedFiles) 구현.
  - `src/commands/compareFolders.ts`: createVscodeFsAdapter, runComparison, registerCompareFoldersCommand 구현. workspaceState에 경로 저장.
  - `test/suite/treeProvider.test.ts`: Module._load 후킹으로 vscode mock 주입. 9개 테스트 케이스 작성.
  - `docs/adr/0004-treeview-provider-design.md` 작성.
  - `npm run test:unit` → **29 passing** (누적).
- **2026-03-13** [Reviewer — Fast-track] - STATUS_ICONS 5개 매핑 확인. contextValue와 package.json when 조건 일치 확인. showUnchanged 필터 로직 확인. ADR-0004 존재 확인. 승인.
- **2026-03-13** [Tester — Fast-track] - `npm run test:unit` 29/29 통과. `npm run compile` 성공. Phase 3 → **DONE**, Phase 4 → DEV_PENDING.
