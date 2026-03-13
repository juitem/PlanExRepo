import * as vscode from 'vscode';

export type DiffStatus = 'Unchanged' | 'Added' | 'Deleted' | 'Modified';

export class DiffItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly status: DiffStatus,
        public readonly sourceUri: vscode.Uri | undefined,
        public readonly targetUri: vscode.Uri | undefined,
        public readonly isDirectory: boolean,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.contextValue = this.isDirectory ? 'folder' : 'file';
        this.description = status;

        // Set visual presentation based on status
        if (this.isDirectory) {
            this.iconPath = new vscode.ThemeIcon('folder');
        } else {
            switch (status) {
                case 'Added':
                    this.iconPath = new vscode.ThemeIcon('add', new vscode.ThemeColor('gitDecoration.addedResourceForeground'));
                    break;
                case 'Deleted':
                    this.iconPath = new vscode.ThemeIcon('trash', new vscode.ThemeColor('gitDecoration.deletedResourceForeground'));
                    break;
                case 'Modified':
                    this.iconPath = new vscode.ThemeIcon('diff-modified', new vscode.ThemeColor('gitDecoration.modifiedResourceForeground'));
                    break;
                default:
                    this.iconPath = new vscode.ThemeIcon('file');
                    break;
            }
        }

        // Click on modified file → open diff editor
        if (status === 'Modified' && !isDirectory && sourceUri && targetUri) {
            this.command = {
                command: 'vscode.diff',
                title: 'Compare',
                arguments: [sourceUri, targetUri, `${label} (Source ↔ Target)`]
            };
        }
    }
}
