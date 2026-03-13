/**
 * Conflict Detector
 * Git merge-base를 사용해 양쪽 모두 수정된 파일을 CONFLICT로 마킹합니다.
 * ⚠️ vscode import 금지 (RULE-001)
 * ⚠️ git 실패 시 CompareResult를 변경하지 않음 (graceful degradation)
 */
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as nodePath from 'path';
import { CompareResult, DiffEntry } from './compareEngine';

const execFileAsync = promisify(execFile);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConflictDetectorLog {
  log(message: string): void;
}

// ─── Git Helpers ──────────────────────────────────────────────────────────────

/**
 * 주어진 디렉토리의 git 저장소 루트를 반환합니다. git 없거나 저장소 아니면 null.
 */
export async function getGitRoot(
  dirPath: string,
  log?: ConflictDetectorLog
): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync('git', ['-C', dirPath, 'rev-parse', '--show-toplevel']);
    return stdout.trim();
  } catch (e) {
    log?.log(`[conflict] getGitRoot failed for "${dirPath}": ${e}`);
    return null;
  }
}

/**
 * 두 저장소(또는 같은 저장소의 두 브랜치)의 merge-base 해시를 반환합니다.
 */
export async function findMergeBase(
  sourceRepoRoot: string,
  targetRepoRoot: string,
  log: ConflictDetectorLog,
): Promise<string | null> {
  try {
    // Source HEAD
    const { stdout: srcHead } = await execFileAsync(
      'git', ['-C', sourceRepoRoot, 'rev-parse', 'HEAD']
    );
    // Target HEAD
    const { stdout: tgtHead } = await execFileAsync(
      'git', ['-C', targetRepoRoot, 'rev-parse', 'HEAD']
    );

    const { stdout: mergeBase } = await execFileAsync(
      'git', ['-C', sourceRepoRoot, 'merge-base', srcHead.trim(), tgtHead.trim()]
    );
    return mergeBase.trim() || null;
  } catch (e) {
    log.log(`[conflict] findMergeBase failed: ${e}`);
    return null;
  }
}

/**
 * merge-base 이후 해당 저장소에서 변경된 파일의 상대 경로 집합을 반환합니다.
 */
export async function getChangedFilesSinceMergeBase(
  repoRoot: string,
  mergeBase: string,
  log: ConflictDetectorLog,
): Promise<Set<string>> {
  try {
    const { stdout } = await execFileAsync(
      'git', ['-C', repoRoot, 'diff', '--name-only', mergeBase, 'HEAD']
    );
    const files = stdout.trim().split('\n').filter(Boolean);
    return new Set(files);
  } catch (e) {
    log.log(`[conflict] getChangedFilesSinceMergeBase failed: ${e}`);
    return new Set();
  }
}

// ─── Apply Conflict Detection ─────────────────────────────────────────────────

function markConflicts(entries: DiffEntry[], conflictPaths: Set<string>): void {
  for (const entry of entries) {
    if (entry.isDirectory) {
      if (entry.children) markConflicts(entry.children, conflictPaths);
    } else if (entry.status === 'MODIFIED' && conflictPaths.has(entry.relativePath)) {
      entry.status = 'CONFLICT';
    }
  }
}

/**
 * CompareResult에 CONFLICT 상태를 적용합니다.
 * git이 없거나 공통 조상을 찾지 못하면 결과를 변경하지 않습니다.
 */
export async function applyConflictDetection(
  result: CompareResult,
  log: ConflictDetectorLog,
): Promise<void> {
  const [sourceGitRoot, targetGitRoot] = await Promise.all([
    getGitRoot(result.sourceRoot, log),
    getGitRoot(result.targetRoot, log),
  ]);

  if (!sourceGitRoot || !targetGitRoot) {
    log.log('[conflict] One or both directories are not git repositories. Skipping conflict detection.');
    return;
  }

  const mergeBase = await findMergeBase(sourceGitRoot, targetGitRoot, log);
  if (!mergeBase) {
    log.log('[conflict] Could not find merge-base. Skipping conflict detection.');
    return;
  }

  const [sourceChanged, targetChanged] = await Promise.all([
    getChangedFilesSinceMergeBase(sourceGitRoot, mergeBase, log),
    getChangedFilesSinceMergeBase(targetGitRoot, mergeBase, log),
  ]);

  // 양쪽 모두 변경된 파일 = CONFLICT
  const conflictPaths = new Set<string>();
  for (const path of sourceChanged) {
    if (targetChanged.has(path)) conflictPaths.add(path);
  }

  if (conflictPaths.size === 0) {
    log.log('[conflict] No conflicts detected.');
    return;
  }

  log.log(`[conflict] ${conflictPaths.size} conflict(s) detected.`);
  markConflicts(result.entries, conflictPaths);
}
