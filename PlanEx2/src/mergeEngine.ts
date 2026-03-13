/**
 * Merge Engine
 * 파일/폴더를 Source ↔ Target 간 복사/머지합니다.
 * ⚠️ vscode import 금지 — 순수 비즈니스 로직 (RULE-001)
 * ⚠️ CONFLICT 파일 자동 머지 금지 (RULE-004)
 */
import * as nodePath from 'path';
import { DiffEntry } from './compareEngine';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MergeOptions {
  direction: 'toTarget' | 'toSource';
  includeDeleted: boolean;
}

export interface MergeResult {
  merged: string[];
  skipped: string[];
  failed: string[];
  conflictCount: number;
}

export interface MergeAdapter {
  copyFile(sourcePath: string, targetPath: string): Promise<void>;
  deleteFile(targetPath: string): Promise<void>;
  createDirectory(dirPath: string): Promise<void>;
  exists(path: string): Promise<boolean>;
}

// ─── File Merge ───────────────────────────────────────────────────────────────

export async function mergeFileEntry(
  entry: DiffEntry,
  options: MergeOptions,
  adapter: MergeAdapter,
): Promise<'merged' | 'skipped' | 'conflict' | 'failed'> {
  // RULE-004: CONFLICT 파일은 절대 자동 머지하지 않음
  if (entry.status === 'CONFLICT') {
    return 'conflict';
  }

  if (entry.status === 'UNCHANGED') {
    return 'skipped';
  }

  const src = options.direction === 'toTarget' ? entry.sourcePath : entry.targetPath;
  const dst = options.direction === 'toTarget' ? entry.targetPath : entry.sourcePath;

  try {
    if (entry.status === 'DELETED') {
      // DELETED = Source에 없음 / toTarget이면 Target에서 삭제
      if (!options.includeDeleted) return 'skipped';
      if (!dst) return 'skipped';
      await adapter.deleteFile(dst);
      return 'merged';
    }

    if (!src || !dst) return 'skipped';

    const dstDir = nodePath.dirname(dst);
    const dirExists = await adapter.exists(dstDir);
    if (!dirExists) {
      await adapter.createDirectory(dstDir);
    }

    await adapter.copyFile(src, dst);
    return 'merged';
  } catch {
    return 'failed';
  }
}

// ─── Folder Merge ─────────────────────────────────────────────────────────────

export async function mergeFolderEntry(
  entry: DiffEntry,
  options: MergeOptions,
  adapter: MergeAdapter,
  onProgress?: (message: string) => void,
): Promise<MergeResult> {
  const result: MergeResult = { merged: [], skipped: [], failed: [], conflictCount: 0 };

  async function walk(items: DiffEntry[]) {
    for (const item of items) {
      if (item.isDirectory) {
        if (item.children) await walk(item.children);
      } else {
        onProgress?.(item.relativePath);
        const outcome = await mergeFileEntry(item, options, adapter);
        if (outcome === 'merged') result.merged.push(item.relativePath);
        else if (outcome === 'conflict') {
          result.skipped.push(item.relativePath);
          result.conflictCount++;
        } else if (outcome === 'failed') {
          result.failed.push(item.relativePath);
        } else {
          result.skipped.push(item.relativePath);
        }
      }
    }
  }

  if (entry.children) {
    await walk(entry.children);
  }

  return result;
}
