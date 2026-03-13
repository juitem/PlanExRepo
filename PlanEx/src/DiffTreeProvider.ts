import * as vscode from 'vscode';
import { DiffItem } from './DiffItem';
import { compareDirectories } from './DirectoryCompare';

export class DiffTreeProvider implements vscode.TreeDataProvider<DiffItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<DiffItem | undefined | void> = new vscode.EventEmitter<DiffItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<DiffItem | undefined | void> = this._onDidChangeTreeData.event;

    private _items: DiffItem[] = [];
    private _sourceUri: vscode.Uri | undefined;
    private _targetUri: vscode.Uri | undefined;

    async setFolders(sourceUri: vscode.Uri, targetUri: vscode.Uri): Promise<void> {
        this._sourceUri = sourceUri;
        this._targetUri = targetUri;
        this._items = await compareDirectories(sourceUri, targetUri);
        this._onDidChangeTreeData.fire();
    }

    refresh(): void {
        if (this._sourceUri && this._targetUri) {
            this.setFolders(this._sourceUri, this._targetUri);
        }
    }

    getTreeItem(element: DiffItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: DiffItem): Thenable<DiffItem[]> {
        if (!element) {
            // Root level
            return Promise.resolve(this._items);
        }
        // Return children stored by DirectoryCompare
        return Promise.resolve((element as any)._children || []);
    }

    /**
     * Returns a flattened list of all modified/added/deleted (non-Unchanged) items.
     * Used for Next/Prev diff navigation (Phase 3/4 requirement).
     */
    getChangedItems(): DiffItem[] {
        const result: DiffItem[] = [];
        this._collectChanged(this._items, result);
        return result;
    }

    private _collectChanged(items: DiffItem[], result: DiffItem[]): void {
        for (const item of items) {
            if (!item.isDirectory && item.status !== 'Unchanged') {
                result.push(item);
            }
            const children: DiffItem[] = (item as any)._children || [];
            this._collectChanged(children, result);
        }
    }
}
