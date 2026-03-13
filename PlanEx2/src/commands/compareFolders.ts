import * as vscode from 'vscode';
import * as nodePath from 'path';
import { compareFolders, FsAdapter } from '../compareEngine';
import { createIgnoreFilter } from '../ignoreRules';
import { applyConflictDetection } from '../conflictDetector';
import { DiffTreeProvider } from '../treeProvider';

const RECENT_KEY = 'planex2.recentFolders';
const MAX_RECENT = 10;

let outputChannel: vscode.OutputChannel | undefined;

function getOutputChannel(): vscode.OutputChannel {
  if (!outputChannel) {
    outputChannel = vscode.window.createOutputChannel('PlanEx2');
  }
  return outputChannel;
}

// ─── QuickPick 파일시스템 브라우저 ─────────────────────────────────────────────

/**
 * QuickPick으로 파일시스템을 직접 탐색하는 폴더 선택기.
 * OS 네이티브 다이얼로그 없이 VS Code 안에서 폴더를 고를 수 있습니다.
 */
async function browseFolderWithQuickPick(startPath: string, title: string): Promise<string | undefined> {
  let currentPath = startPath;

  while (true) {
    type Item = vscode.QuickPickItem & { targetPath: string; action: 'select' | 'navigate' };
    const items: Item[] = [];

    // ① 현재 폴더 선택
    items.push({
      label: `$(check) Select This Folder`,
      description: currentPath,
      detail: '현재 위치한 폴더를 선택합니다',
      targetPath: currentPath,
      action: 'select',
      alwaysShow: true,
    });

    // ② 상위 폴더로 이동
    const parent = nodePath.dirname(currentPath);
    if (parent !== currentPath) {
      items.push({
        label: '$(arrow-up) .. (상위 폴더)',
        description: parent,
        targetPath: parent,
        action: 'navigate',
        alwaysShow: true,
      });
    }

    // ③ 하위 디렉토리 목록
    try {
      const entries = await vscode.workspace.fs.readDirectory(vscode.Uri.file(currentPath));
      const dirs = entries
        .filter(([, type]) => type === vscode.FileType.Directory)
        .sort(([a], [b]) => a.localeCompare(b));

      if (dirs.length > 0) {
        items.push({ label: 'Subfolders', kind: vscode.QuickPickItemKind.Separator, targetPath: '', action: 'navigate' });
        dirs.forEach(([name]) => {
          items.push({
            label: `$(folder) ${name}`,
            description: nodePath.join(currentPath, name),
            targetPath: nodePath.join(currentPath, name),
            action: 'navigate',
          });
        });
      }
    } catch {
      // 읽기 권한 없음 — 상위로만 이동 가능
    }

    const picked = await vscode.window.showQuickPick(items, {
      title: `${title}  —  ${currentPath}`,
      placeHolder: '폴더를 선택하거나 하위 폴더로 이동하세요',
      ignoreFocusOut: true,
    });

    if (!picked) return undefined;
    if (picked.action === 'select') return picked.targetPath;
    currentPath = picked.targetPath;
  }
}

// ─── 폴더 선택기 (QuickPick 메인) ─────────────────────────────────────────────

async function pickFolder(
  title: string,
  context: vscode.ExtensionContext,
): Promise<string | undefined> {
  type Item = vscode.QuickPickItem & { path?: string; action?: 'browse' | 'input' };

  const items: Item[] = [];

  // 1) 워크스페이스 폴더
  const wsFolders = vscode.workspace.workspaceFolders ?? [];
  if (wsFolders.length > 0) {
    items.push({ label: 'Workspace Folders', kind: vscode.QuickPickItemKind.Separator });
    wsFolders.forEach((ws) => {
      items.push({
        label: `$(folder) ${ws.name}`,
        description: ws.uri.fsPath,
        path: ws.uri.fsPath,
      });
    });
  }

  // 2) 최근 사용 폴더
  const recent: string[] = context.globalState.get(RECENT_KEY, []);
  const usableRecent = recent.filter(
    (p) => !wsFolders.some((ws) => ws.uri.fsPath === p)
  );
  if (usableRecent.length > 0) {
    items.push({ label: 'Recent', kind: vscode.QuickPickItemKind.Separator });
    usableRecent.forEach((p) => {
      items.push({
        label: `$(history) ${nodePath.basename(p)}`,
        description: p,
        path: p,
      });
    });
  }

  // 3) 탐색 / 직접 입력
  items.push({ label: '', kind: vscode.QuickPickItemKind.Separator });
  items.push({
    label: '$(folder-opened) 폴더 탐색 (Browse)...',
    description: '파일시스템을 탐색하여 폴더를 선택합니다',
    action: 'browse',
  });
  items.push({
    label: '$(edit) 경로 직접 입력...',
    description: 'Type or paste a full folder path',
    action: 'input',
  });

  const picked = await vscode.window.showQuickPick(items, {
    title,
    placeHolder: '폴더를 선택하거나 아래 옵션을 선택하세요',
    matchOnDescription: true,
    ignoreFocusOut: true,
  });
  if (!picked) return undefined;

  // Browse: QuickPick 파일시스템 탐색기 사용 (OS 다이얼로그 대신)
  if (picked.action === 'browse') {
    const startPath =
      vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ??
      process.env.HOME ??
      '/';
    return browseFolderWithQuickPick(startPath, title);
  }

  // 직접 입력
  if (picked.action === 'input') {
    const input = await vscode.window.showInputBox({
      title,
      prompt: '폴더 경로를 입력하세요',
      placeHolder: '/Users/you/myproject',
      ignoreFocusOut: true,
      validateInput: async (value) => {
        if (!value.trim()) return 'Path cannot be empty';
        try {
          const stat = await vscode.workspace.fs.stat(vscode.Uri.file(value.trim()));
          if (stat.type !== vscode.FileType.Directory) return 'Not a directory';
        } catch {
          return 'Folder not found';
        }
        return undefined;
      },
    });
    return input?.trim();
  }

  return picked.path;
}

function saveRecentFolder(context: vscode.ExtensionContext, folderPath: string): void {
  const recent: string[] = context.globalState.get(RECENT_KEY, []);
  const updated = [folderPath, ...recent.filter((p) => p !== folderPath)].slice(0, MAX_RECENT);
  context.globalState.update(RECENT_KEY, updated);
}

// ─── Run Comparison ───────────────────────────────────────────────────────────

export async function runComparison(
  sourceRoot: string,
  targetRoot: string,
  treeProvider: DiffTreeProvider,
): Promise<void> {
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'PlanEx2: Comparing folders...',
      cancellable: false,
    },
    async (progress) => {
      progress.report({ message: 'Scanning files...' });

      const fsAdapter = createVscodeFsAdapter();
      const ignoreFilter = createIgnoreFilter();
      const result = await compareFolders(sourceRoot, targetRoot, fsAdapter, ignoreFilter);

      progress.report({ message: 'Detecting conflicts...' });
      const ch = getOutputChannel();
      await applyConflictDetection(result, { log: (msg) => ch.appendLine(msg) });

      treeProvider.setResult(result);
      vscode.commands.executeCommand('setContext', 'planex2Active', true);

      const summary = [
        result.totalModified > 0 ? `${result.totalModified} modified` : '',
        result.totalAdded > 0    ? `${result.totalAdded} added`        : '',
        result.totalDeleted > 0  ? `${result.totalDeleted} deleted`    : '',
      ].filter(Boolean).join(', ') || 'no changes';

      vscode.window.showInformationMessage(`PlanEx2: Done — ${summary}.`);
    }
  );
}

// ─── FsAdapter ────────────────────────────────────────────────────────────────

export function createVscodeFsAdapter(): FsAdapter {
  return {
    async readDirectory(path: string): Promise<[string, 'file' | 'directory'][]> {
      const uri = vscode.Uri.file(path);
      const entries = await vscode.workspace.fs.readDirectory(uri);
      return entries.map(([name, fileType]) => {
        const isDir = fileType === vscode.FileType.Directory;
        return [name, isDir ? 'directory' : 'file'] as [string, 'file' | 'directory'];
      });
    },
    async readFile(path: string): Promise<Buffer> {
      const content = await vscode.workspace.fs.readFile(vscode.Uri.file(path));
      return Buffer.from(content);
    },
    async exists(path: string): Promise<boolean> {
      try {
        await vscode.workspace.fs.stat(vscode.Uri.file(path));
        return true;
      } catch {
        return false;
      }
    },
  };
}

// ─── Register Command ─────────────────────────────────────────────────────────

export function registerCompareFoldersCommand(
  context: vscode.ExtensionContext,
  treeProvider: DiffTreeProvider,
): vscode.Disposable {
  return vscode.commands.registerCommand('planex2.compareFolders', async () => {
    const sourceRoot = await pickFolder('① SOURCE 폴더 선택 (Left)', context);
    if (!sourceRoot) return;

    const targetRoot = await pickFolder('② TARGET 폴더 선택 (Right)', context);
    if (!targetRoot) return;

    if (sourceRoot === targetRoot) {
      vscode.window.showWarningMessage('PlanEx2: Source와 Target이 같은 폴더입니다.');
      return;
    }

    saveRecentFolder(context, sourceRoot);
    saveRecentFolder(context, targetRoot);

    context.workspaceState.update('planex2.sourceRoot', sourceRoot);
    context.workspaceState.update('planex2.targetRoot', targetRoot);

    treeProvider.setRoots(sourceRoot, targetRoot);
    await runComparison(sourceRoot, targetRoot, treeProvider);
  });
}
