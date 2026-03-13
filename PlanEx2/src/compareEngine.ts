/**
 * Compare Engine
 * 두 디렉토리를 재귀적으로 비교합니다.
 * ⚠️ vscode import 금지 — 순수 비즈니스 로직 (RULE-002)
 */
import * as crypto from 'crypto';
import * as nodePath from 'path';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DiffStatus = 'ADDED' | 'DELETED' | 'MODIFIED' | 'UNCHANGED' | 'CONFLICT';

export interface DiffEntry {
  relativePath: string;
  name: string;
  isDirectory: boolean;
  status: DiffStatus;
  sourcePath?: string;
  targetPath?: string;
  children?: DiffEntry[];
}

export interface CompareResult {
  sourceRoot: string;
  targetRoot: string;
  entries: DiffEntry[];
  totalModified: number;
  totalAdded: number;
  totalDeleted: number;
  totalUnchanged: number;
}

export interface FsAdapter {
  readDirectory(path: string): Promise<[string, 'file' | 'directory'][]>;
  readFile(path: string): Promise<Buffer>;
  exists(path: string): Promise<boolean>;
}

// ─── Core Functions ───────────────────────────────────────────────────────────

/**
 * 파일 내용의 SHA256 해시를 반환합니다.
 */
export async function hashFile(path: string, fsAdapter: FsAdapter): Promise<string> {
  const content = await fsAdapter.readFile(path);
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * 두 파일이 내용상 동일한지 해시로 비교합니다.
 */
export async function filesAreEqual(
  pathA: string,
  pathB: string,
  fsAdapter: FsAdapter
): Promise<boolean> {
  const [hashA, hashB] = await Promise.all([
    hashFile(pathA, fsAdapter),
    hashFile(pathB, fsAdapter),
  ]);
  return hashA === hashB;
}

/**
 * 두 루트 디렉토리를 재귀적으로 비교합니다.
 */
export async function compareDirectories(
  sourceRoot: string,
  targetRoot: string,
  relativePath: string,
  fsAdapter: FsAdapter,
  ignoreFilter?: (relativePath: string) => boolean
): Promise<DiffEntry[]> {
  const sourceDir = relativePath ? nodePath.join(sourceRoot, relativePath) : sourceRoot;
  const targetDir = relativePath ? nodePath.join(targetRoot, relativePath) : targetRoot;

  const [srcExists, tgtExists] = await Promise.all([
    fsAdapter.exists(sourceDir),
    fsAdapter.exists(targetDir),
  ]);
  const [sourceEntries, targetEntries] = await Promise.all([
    srcExists ? fsAdapter.readDirectory(sourceDir) : Promise.resolve([] as [string, 'file' | 'directory'][]),
    tgtExists ? fsAdapter.readDirectory(targetDir) : Promise.resolve([] as [string, 'file' | 'directory'][]),
  ]);

  const sourceMap = new Map(sourceEntries);
  const targetMap = new Map(targetEntries);
  const allNames = new Set([...sourceMap.keys(), ...targetMap.keys()]);

  const results: DiffEntry[] = [];

  for (const name of allNames) {
    const itemRelPath = relativePath ? `${relativePath}/${name}` : name;

    if (ignoreFilter && ignoreFilter(itemRelPath)) continue;

    const inSource = sourceMap.has(name);
    const inTarget = targetMap.has(name);
    const sourceType = sourceMap.get(name);
    const targetType = targetMap.get(name);
    const isDirectory = (sourceType === 'directory' || targetType === 'directory');

    const sourcePath = nodePath.join(sourceRoot, itemRelPath);
    const targetPath = nodePath.join(targetRoot, itemRelPath);

    if (isDirectory) {
      const children = await compareDirectories(
        sourceRoot,
        targetRoot,
        itemRelPath,
        fsAdapter,
        ignoreFilter
      );

      const hasChanges = children.some(
        (c) => c.status !== 'UNCHANGED'
      );

      let status: DiffStatus;
      if (!inSource) status = 'DELETED';
      else if (!inTarget) status = 'ADDED';
      else status = hasChanges ? 'MODIFIED' : 'UNCHANGED';

      results.push({
        relativePath: itemRelPath,
        name,
        isDirectory: true,
        status,
        sourcePath: inSource ? sourcePath : undefined,
        targetPath: inTarget ? targetPath : undefined,
        children,
      });
    } else {
      let status: DiffStatus;

      if (!inSource) {
        status = 'DELETED';
      } else if (!inTarget) {
        status = 'ADDED';
      } else {
        const equal = await filesAreEqual(sourcePath, targetPath, fsAdapter);
        status = equal ? 'UNCHANGED' : 'MODIFIED';
      }

      results.push({
        relativePath: itemRelPath,
        name,
        isDirectory: false,
        status,
        sourcePath: inSource ? sourcePath : undefined,
        targetPath: inTarget ? targetPath : undefined,
      });
    }
  }

  // 이름순 정렬: 디렉토리 먼저, 그다음 파일
  results.sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return results;
}

function countEntries(entries: DiffEntry[]): {
  modified: number; added: number; deleted: number; unchanged: number;
} {
  let modified = 0, added = 0, deleted = 0, unchanged = 0;

  function walk(items: DiffEntry[]) {
    for (const item of items) {
      if (item.isDirectory) {
        if (item.children) walk(item.children);
      } else {
        if (item.status === 'MODIFIED' || item.status === 'CONFLICT') modified++;
        else if (item.status === 'ADDED') added++;
        else if (item.status === 'DELETED') deleted++;
        else unchanged++;
      }
    }
  }
  walk(entries);
  return { modified, added, deleted, unchanged };
}

/**
 * 전체 비교를 수행하고 CompareResult를 반환합니다.
 */
export async function compareFolders(
  sourceRoot: string,
  targetRoot: string,
  fsAdapter: FsAdapter,
  ignoreFilter?: (relativePath: string) => boolean
): Promise<CompareResult> {
  const entries = await compareDirectories(sourceRoot, targetRoot, '', fsAdapter, ignoreFilter);
  const counts = countEntries(entries);

  return {
    sourceRoot,
    targetRoot,
    entries,
    totalModified: counts.modified,
    totalAdded: counts.added,
    totalDeleted: counts.deleted,
    totalUnchanged: counts.unchanged,
  };
}
