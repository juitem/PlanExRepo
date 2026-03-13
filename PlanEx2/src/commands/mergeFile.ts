import * as vscode from 'vscode';
import * as nodePath from 'path';
import { DiffEntry } from '../compareEngine';
import { mergeFileEntry, MergeAdapter } from '../mergeEngine';
import { DiffTreeProvider } from '../treeProvider';

export function createVscodeMergeAdapter(): MergeAdapter {
  return {
    async copyFile(sourcePath: string, targetPath: string): Promise<void> {
      const srcUri = vscode.Uri.file(sourcePath);
      const dstUri = vscode.Uri.file(targetPath);
      await vscode.workspace.fs.copy(srcUri, dstUri, { overwrite: true });
    },

    async deleteFile(targetPath: string): Promise<void> {
      const uri = vscode.Uri.file(targetPath);
      await vscode.workspace.fs.delete(uri, { useTrash: true });
    },

    async createDirectory(dirPath: string): Promise<void> {
      const uri = vscode.Uri.file(dirPath);
      await vscode.workspace.fs.createDirectory(uri);
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

export function registerMergeCommands(
  context: vscode.ExtensionContext,
  treeProvider: DiffTreeProvider,
): vscode.Disposable[] {
  const adapter = createVscodeMergeAdapter();

  async function doMerge(entry: DiffEntry, direction: 'toTarget' | 'toSource') {
    // RULE-004: CONFLICT 파일 거부
    if (entry.status === 'CONFLICT') {
      vscode.window.showErrorMessage(
        `PlanEx2: Cannot auto-merge CONFLICT file "${entry.relativePath}". Please resolve manually.`
      );
      return;
    }

    const [srcDesc, dstDesc] =
      direction === 'toTarget'
        ? [entry.sourcePath ?? 'Source', entry.targetPath ?? 'Target']
        : [entry.targetPath ?? 'Target', entry.sourcePath ?? 'Source'];

    // RULE-003: 확인 다이얼로그
    const answer = await vscode.window.showWarningMessage(
      `Overwrite "${dstDesc}" with "${srcDesc}"?`,
      { modal: true },
      'Merge',
      'Cancel'
    );
    if (answer !== 'Merge') return;

    const result = await mergeFileEntry(
      entry,
      { direction, includeDeleted: true },
      adapter
    );

    if (result === 'merged') {
      vscode.window.showInformationMessage(`PlanEx2: Merged "${entry.relativePath}"`);
      treeProvider.markAsUnchanged(entry.relativePath);
    } else if (result === 'conflict') {
      vscode.window.showErrorMessage(
        `PlanEx2: CONFLICT — cannot merge "${entry.relativePath}" automatically.`
      );
    } else if (result === 'failed') {
      vscode.window.showErrorMessage(
        `PlanEx2: Failed to merge "${entry.relativePath}". Check the output channel.`
      );
    }
  }

  return [
    vscode.commands.registerCommand('planex2.mergeFileToTarget', (entry: DiffEntry) =>
      doMerge(entry, 'toTarget')
    ),
    vscode.commands.registerCommand('planex2.mergeFileToSource', (entry: DiffEntry) =>
      doMerge(entry, 'toSource')
    ),
  ];
}
