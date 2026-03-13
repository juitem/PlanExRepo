import * as vscode from 'vscode';
import { DiffItem, DiffStatus } from './DiffItem';
import * as crypto from 'crypto';

export interface CompareResult {
    items: DiffItem[];
}

/**
 * Recursively compares two directories and returns a flat list of DiffItems.
 * Uses a visited‐path set to detect symlink‐induced loops (ADR‑0001).
 */
export async function compareDirectories(
    sourceUri: vscode.Uri,
    targetUri: vscode.Uri
): Promise<DiffItem[]> {
    const visited = new Set<string>();
    return compareRecursive(sourceUri, targetUri, visited);
}

async function compareRecursive(
    sourceUri: vscode.Uri,
    targetUri: vscode.Uri,
    visited: Set<string>
): Promise<DiffItem[]> {
    // --- loop guard (symlink detection) ---
    const pairKey = `${sourceUri.fsPath}|${targetUri.fsPath}`;
    if (visited.has(pairKey)) {
        return [];
    }
    visited.add(pairKey);

    const sourceEntries = await safeReadDirectory(sourceUri);
    const targetEntries = await safeReadDirectory(targetUri);

    const sourceMap = new Map(sourceEntries.map(([name, type]) => [name, type]));
    const targetMap = new Map(targetEntries.map(([name, type]) => [name, type]));

    const allNames = new Set([...sourceMap.keys(), ...targetMap.keys()]);
    const results: DiffItem[] = [];

    for (const name of [...allNames].sort()) {
        const inSource = sourceMap.has(name);
        const inTarget = targetMap.has(name);
        const sUri = vscode.Uri.joinPath(sourceUri, name);
        const tUri = vscode.Uri.joinPath(targetUri, name);
        const isDir = (inSource && sourceMap.get(name) === vscode.FileType.Directory)
                   || (inTarget && targetMap.get(name) === vscode.FileType.Directory);

        let status: DiffStatus;

        if (inSource && !inTarget) {
            status = 'Added';
        } else if (!inSource && inTarget) {
            status = 'Deleted';
        } else if (isDir) {
            status = 'Unchanged'; // folder status refined below
        } else {
            status = await filesAreEqual(sUri, tUri) ? 'Unchanged' : 'Modified';
        }

        const collapsible = isDir
            ? vscode.TreeItemCollapsibleState.Collapsed
            : vscode.TreeItemCollapsibleState.None;

        const item = new DiffItem(
            name,
            status,
            inSource ? sUri : undefined,
            inTarget ? tUri : undefined,
            isDir,
            collapsible
        );

        // Store children for directories
        if (isDir) {
            if (inSource && inTarget) {
                (item as any)._children = await compareRecursive(sUri, tUri, visited);
            } else if (inSource) {
                // Folder only in source - list all its children as 'Added'
                (item as any)._children = await listAllAsStatus(sUri, 'Added');
            } else if (inTarget) {
                // Folder only in target - list all its children as 'Deleted'
                (item as any)._children = await listAllAsStatus(tUri, 'Deleted');
            }
            
            // Propagate status: if any child is non‑Unchanged, mark folder as Modified
            const hasChanges = (item as any)._children?.some((c: DiffItem) => c.status !== 'Unchanged');
            if (hasChanges && status === 'Unchanged') {
                (item as any).status = 'Modified';
                item.description = 'Modified';
            }
        }

        results.push(item);
    }

    return results;
}

async function listAllAsStatus(uri: vscode.Uri, status: DiffStatus): Promise<DiffItem[]> {
    const entries = await safeReadDirectory(uri);
    const results: DiffItem[] = [];
    for (const [name, type] of entries) {
        const childUri = vscode.Uri.joinPath(uri, name);
        const isDir = type === vscode.FileType.Directory;
        const item = new DiffItem(
            name,
            status,
            status === 'Added' ? childUri : undefined,
            status === 'Deleted' ? childUri : undefined,
            isDir,
            isDir ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
        );
        if (isDir) {
            (item as any)._children = await listAllAsStatus(childUri, status);
        }
        results.push(item);
    }
    return results;
}

async function safeReadDirectory(uri: vscode.Uri): Promise<[string, vscode.FileType][]> {
    try {
        return await vscode.workspace.fs.readDirectory(uri);
    } catch {
        return [];
    }
}

async function filesAreEqual(a: vscode.Uri, b: vscode.Uri): Promise<boolean> {
    try {
        const [aData, bData] = await Promise.all([
            vscode.workspace.fs.readFile(a),
            vscode.workspace.fs.readFile(b)
        ]);
        if (aData.byteLength !== bData.byteLength) {
            return false;
        }
        const hashA = crypto.createHash('md5').update(aData).digest('hex');
        const hashB = crypto.createHash('md5').update(bData).digest('hex');
        return hashA === hashB;
    } catch {
        return false;
    }
}
