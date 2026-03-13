import * as vscode from 'vscode';

/**
 * Copies a single file from source to target, overwriting target.
 */
export async function mergeFile(sourceUri: vscode.Uri, targetUri: vscode.Uri): Promise<void> {
    await vscode.workspace.fs.copy(sourceUri, targetUri, { overwrite: true });
}

/**
 * Deletes a file or empty directory.
 */
export async function deleteFile(uri: vscode.Uri): Promise<void> {
    await vscode.workspace.fs.delete(uri, { recursive: false });
}

/**
 * Recursively merges a source directory into a target directory.
 * - Files only in source → copied to target.
 * - Files in both that differ → overwritten.
 * - Files only in target → left as-is (user must explicitly delete).
 */
export async function mergeDirectory(sourceUri: vscode.Uri, targetUri: vscode.Uri): Promise<void> {
    // Ensure target directory exists
    try {
        await vscode.workspace.fs.stat(targetUri);
    } catch {
        await vscode.workspace.fs.createDirectory(targetUri);
    }

    const entries = await vscode.workspace.fs.readDirectory(sourceUri);

    for (const [name, fileType] of entries) {
        const sChild = vscode.Uri.joinPath(sourceUri, name);
        const tChild = vscode.Uri.joinPath(targetUri, name);

        if (fileType === vscode.FileType.Directory) {
            await mergeDirectory(sChild, tChild);
        } else {
            await vscode.workspace.fs.copy(sChild, tChild, { overwrite: true });
        }
    }
}
