import * as vscode from 'vscode';
import { DiffEntry } from '../compareEngine';
import { mergeFolderEntry, MergeOptions } from '../mergeEngine';
import { createVscodeMergeAdapter } from './mergeFile';
import { DiffTreeProvider } from '../treeProvider';

export function registerMergeFolderCommand(
  context: vscode.ExtensionContext,
  treeProvider: DiffTreeProvider,
): vscode.Disposable {
  return vscode.commands.registerCommand(
    'planex2.mergeFolderToTarget',
    async (entry: DiffEntry) => {
      if (!entry.isDirectory) return;

      // DELETED 파일 처리 여부 선택
      const deleteAnswer = await vscode.window.showWarningMessage(
        `Merge folder "${entry.relativePath}" Source → Target.\nAlso delete files from Target that don't exist in Source?`,
        'Yes, delete',
        'No, skip deleted',
        'Cancel'
      );
      if (!deleteAnswer || deleteAnswer === 'Cancel') return;
      const includeDeleted = deleteAnswer === 'Yes, delete';

      // RULE-003: 최종 확인 다이얼로그
      const confirm = await vscode.window.showWarningMessage(
        `This will overwrite files in Target. Continue?`,
        { modal: true },
        'Merge All',
        'Cancel'
      );
      if (confirm !== 'Merge All') return;

      const options: MergeOptions = { direction: 'toTarget', includeDeleted };
      const adapter = createVscodeMergeAdapter();

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `PlanEx2: Merging "${entry.relativePath}"...`,
          cancellable: false,
        },
        async (progress) => {
          const result = await mergeFolderEntry(
            entry,
            options,
            adapter,
            (msg) => progress.report({ message: msg })
          );

          const summary =
            `Merged: ${result.merged.length}, ` +
            `Skipped: ${result.skipped.length}, ` +
            `Failed: ${result.failed.length}` +
            (result.conflictCount > 0 ? `, Conflicts skipped: ${result.conflictCount}` : '');

          if (result.failed.length > 0) {
            vscode.window.showErrorMessage(`PlanEx2: Completed with errors — ${summary}`);
          } else if (result.conflictCount > 0) {
            vscode.window.showWarningMessage(`PlanEx2: Done (with conflicts) — ${summary}`);
          } else {
            vscode.window.showInformationMessage(`PlanEx2: Done — ${summary}`);
          }

          result.merged.forEach((path) => treeProvider.markAsUnchanged(path));
        }
      );
    }
  );
}
