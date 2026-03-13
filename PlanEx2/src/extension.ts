import * as vscode from 'vscode';
import { DiffTreeProvider } from './treeProvider';
import { registerCompareFoldersCommand, runComparison } from './commands/compareFolders';
import { registerNavigationCommands } from './commands/navigate';
import { registerMergeCommands } from './commands/mergeFile';
import { registerMergeFolderCommand } from './commands/mergeFolder';

export function activate(context: vscode.ExtensionContext): void {
  const treeProvider = new DiffTreeProvider();

  const treeView = vscode.window.createTreeView('planex2Tree', {
    treeDataProvider: treeProvider,
    showCollapseAll: true,
  });

  // 비교 중인 폴더 경로를 TreeView 제목에 표시
  treeProvider.onDidChangeTreeData(() => {
    const { source, target } = treeProvider.getRoots();
    if (source && target) {
      const srcName = source.split(/[\\/]/).pop() ?? source;
      const tgtName = target.split(/[\\/]/).pop() ?? target;
      treeView.title = `${srcName}  ↔  ${tgtName}`;
      treeView.description = 'Folder Diff';
    } else {
      treeView.title = 'Folder Diff';
    }
  });

  const compareFoldersCmd = registerCompareFoldersCommand(context, treeProvider);

  // Refresh: 저장된 source/target 경로로 재비교 실행
  const refreshCmd = vscode.commands.registerCommand('planex2.refresh', async () => {
    const sourceRoot = context.workspaceState.get<string>('planex2.sourceRoot');
    const targetRoot = context.workspaceState.get<string>('planex2.targetRoot');
    if (!sourceRoot || !targetRoot) {
      vscode.window.showWarningMessage('PlanEx2: No folders selected yet. Use Compare Folders first.');
      return;
    }
    treeProvider.setRoots(sourceRoot, targetRoot);
    await runComparison(sourceRoot, targetRoot, treeProvider);
  });

  const navDisposables = registerNavigationCommands(context, treeProvider, treeView);
  const mergeDisposables = registerMergeCommands(context, treeProvider);
  const mergeFolderCmd = registerMergeFolderCommand(context, treeProvider);

  context.subscriptions.push(
    treeView,
    compareFoldersCmd,
    refreshCmd,
    mergeFolderCmd,
    ...navDisposables,
    ...mergeDisposables,
  );

  // 이전 세션에서 비교했던 경로가 있으면 복원
  const savedSource = context.workspaceState.get<string>('planex2.sourceRoot');
  const savedTarget = context.workspaceState.get<string>('planex2.targetRoot');
  if (savedSource && savedTarget) {
    treeProvider.setRoots(savedSource, savedTarget);
    // 저장된 경로가 있으면 사이드바에 힌트 표시 (자동 재비교는 하지 않음)
    const srcName = savedSource.split(/[\\/]/).pop() ?? savedSource;
    const tgtName = savedTarget.split(/[\\/]/).pop() ?? savedTarget;
    treeView.title = `${srcName}  ↔  ${tgtName}`;
    treeView.description = 'Click Refresh to re-compare';
  }

  console.log('PlanEx2 extension activated');
}

export function deactivate(): void {
  // planex2Active 컨텍스트 해제
  vscode.commands.executeCommand('setContext', 'planex2Active', false);
}
