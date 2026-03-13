import * as vscode from 'vscode';
import { DiffTreeProvider } from './DiffTreeProvider';
import { DiffItem } from './DiffItem';
import { mergeFile, deleteFile, mergeDirectory } from './MergeOperations';

export function activate(context: vscode.ExtensionContext) {
    console.log('PlanEx extension is now active.');

    const diffTreeProvider = new DiffTreeProvider();

    // Track currently selected item for navigation
    let currentDiffIndex = -1;

    // Register the TreeView
    const treeView = vscode.window.createTreeView('planex-diff-tree', {
        treeDataProvider: diffTreeProvider,
        showCollapseAll: true
    });
    context.subscriptions.push(treeView);

    // Command: Compare Folders
    context.subscriptions.push(
        vscode.commands.registerCommand('planex.compareFolders', async () => {
            const sourceUri = await vscode.window.showOpenDialog({
                canSelectFolders: true,
                canSelectFiles: false,
                canSelectMany: false,
                openLabel: 'Select Source Folder'
            });
            if (!sourceUri || sourceUri.length === 0) { return; }

            const targetUri = await vscode.window.showOpenDialog({
                canSelectFolders: true,
                canSelectFiles: false,
                canSelectMany: false,
                openLabel: 'Select Target Folder'
            });
            if (!targetUri || targetUri.length === 0) { return; }

            try {
                await diffTreeProvider.setFolders(sourceUri[0], targetUri[0]);
                currentDiffIndex = -1;
                vscode.window.showInformationMessage(`PlanEx: Comparing "${sourceUri[0].fsPath}" ↔ "${targetUri[0].fsPath}"`);
            } catch (err: any) {
                console.error('PlanEx Error during comparison:', err);
                vscode.window.showErrorMessage(`Comparison failed: ${err.message || err}`);
            }
        })
    );

    // Command: Refresh
    context.subscriptions.push(
        vscode.commands.registerCommand('planex.refresh', () => {
            diffTreeProvider.refresh();
            currentDiffIndex = -1;
        })
    );

    // Command: Merge File
    context.subscriptions.push(
        vscode.commands.registerCommand('planex.action.mergeFile', async (item: DiffItem) => {
            if (!item.sourceUri) {
                vscode.window.showWarningMessage('No source file to merge.');
                return;
            }
            if (!item.targetUri) {
                vscode.window.showWarningMessage('No target path specified.');
                return;
            }
            try {
                await mergeFile(item.sourceUri, item.targetUri);
                vscode.window.showInformationMessage(`Merged: ${item.label}`);
                diffTreeProvider.refresh();
            } catch (e: any) {
                vscode.window.showErrorMessage(`Merge failed: ${e.message}`);
            }
        })
    );

    // Command: Merge Folder
    context.subscriptions.push(
        vscode.commands.registerCommand('planex.action.mergeFolder', async (item: DiffItem) => {
            if (!item.sourceUri || !item.targetUri) {
                vscode.window.showWarningMessage('Source or target folder is missing.');
                return;
            }
            try {
                await mergeDirectory(item.sourceUri, item.targetUri);
                vscode.window.showInformationMessage(`Merged folder: ${item.label}`);
                diffTreeProvider.refresh();
            } catch (e: any) {
                vscode.window.showErrorMessage(`Folder merge failed: ${e.message}`);
            }
        })
    );

    // Command: Delete File from Target
    context.subscriptions.push(
        vscode.commands.registerCommand('planex.action.deleteFile', async (item: DiffItem) => {
            if (!item.targetUri) {
                vscode.window.showWarningMessage('No target file to delete.');
                return;
            }
            try {
                await deleteFile(item.targetUri);
                vscode.window.showInformationMessage(`Deleted: ${item.label}`);
                diffTreeProvider.refresh();
            } catch (e: any) {
                vscode.window.showErrorMessage(`Delete failed: ${e.message}`);
            }
        })
    );

    // Command: Next Changed File
    context.subscriptions.push(
        vscode.commands.registerCommand('planex.action.nextDiffFile', async () => {
            const changedItems = diffTreeProvider.getChangedItems();
            if (changedItems.length === 0) {
                vscode.window.showInformationMessage('No differences found.');
                return;
            }
            currentDiffIndex = (currentDiffIndex + 1) % changedItems.length;
            const item = changedItems[currentDiffIndex];
            await treeView.reveal(item, { select: true, focus: true });
            if (item.sourceUri && item.targetUri && item.status === 'Modified') {
                await vscode.commands.executeCommand('vscode.diff', item.sourceUri, item.targetUri, `${item.label} (Source ↔ Target)`);
            }
        })
    );

    // Command: Previous Changed File
    context.subscriptions.push(
        vscode.commands.registerCommand('planex.action.prevDiffFile', async () => {
            const changedItems = diffTreeProvider.getChangedItems();
            if (changedItems.length === 0) {
                vscode.window.showInformationMessage('No differences found.');
                return;
            }
            currentDiffIndex = currentDiffIndex <= 0 ? changedItems.length - 1 : currentDiffIndex - 1;
            const item = changedItems[currentDiffIndex];
            await treeView.reveal(item, { select: true, focus: true });
            if (item.sourceUri && item.targetUri && item.status === 'Modified') {
                await vscode.commands.executeCommand('vscode.diff', item.sourceUri, item.targetUri, `${item.label} (Source ↔ Target)`);
            }
        })
    );
}

export function deactivate() {}
