import { strict as assert } from 'assert';
import * as os from 'os';
import * as fs from 'fs/promises';
import * as path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

import {
  getGitRoot,
  applyConflictDetection,
  ConflictDetectorLog,
} from '../../src/conflictDetector';
import { CompareResult, DiffEntry } from '../../src/compareEngine';

const execAsync = promisify(execFile);

const noopLog: ConflictDetectorLog = { log: () => {} };

async function initGitRepo(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
  await execAsync('git', ['-C', dir, 'init']);
  await execAsync('git', ['-C', dir, 'config', 'user.email', 'test@test.com']);
  await execAsync('git', ['-C', dir, 'config', 'user.name', 'Test']);
  await fs.writeFile(path.join(dir, '.gitkeep'), '');
  await execAsync('git', ['-C', dir, 'add', '.']);
  await execAsync('git', ['-C', dir, 'commit', '-m', 'init']);
}

function makeResult(entries: DiffEntry[], sourceRoot: string, targetRoot: string): CompareResult {
  return {
    sourceRoot, targetRoot, entries,
    totalModified: 0, totalAdded: 0, totalDeleted: 0, totalUnchanged: 0,
  };
}

describe('conflictDetector', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'planex2-cd-'));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  describe('getGitRoot()', () => {
    it('일반 디렉토리는 null 반환', async () => {
      const dir = path.join(tmpDir, 'notgit');
      await fs.mkdir(dir);
      const root = await getGitRoot(dir, noopLog);
      assert.equal(root, null);
    });

    it('git 저장소 루트를 반환', async function () {
      // git 없는 환경 스킵
      try { await execAsync('git', ['--version']); } catch { this.skip(); }

      const repoDir = path.join(tmpDir, 'repo');
      await initGitRepo(repoDir);
      const root = await getGitRoot(repoDir, noopLog);
      assert.ok(root !== null);
      assert.ok(typeof root === 'string');
    });
  });

  describe('applyConflictDetection()', () => {
    it('git이 아닌 디렉토리면 CompareResult를 변경하지 않음', async () => {
      const srcDir = path.join(tmpDir, 'src');
      const tgtDir = path.join(tmpDir, 'tgt');
      await fs.mkdir(srcDir);
      await fs.mkdir(tgtDir);

      const entries: DiffEntry[] = [
        { relativePath: 'file.txt', name: 'file.txt', isDirectory: false,
          status: 'MODIFIED', sourcePath: path.join(srcDir, 'file.txt'),
          targetPath: path.join(tgtDir, 'file.txt') },
      ];
      const result = makeResult(entries, srcDir, tgtDir);

      await applyConflictDetection(result, noopLog);

      assert.equal(result.entries[0].status, 'MODIFIED');
    });

    it('로그 메시지가 기록됨 (git 없는 경우)', async () => {
      const srcDir = path.join(tmpDir, 'src');
      const tgtDir = path.join(tmpDir, 'tgt');
      await fs.mkdir(srcDir);
      await fs.mkdir(tgtDir);

      const logs: string[] = [];
      const log: ConflictDetectorLog = { log: (msg) => logs.push(msg) };

      const result = makeResult([], srcDir, tgtDir);
      await applyConflictDetection(result, log);

      assert.ok(logs.length > 0);
    });

    it('UNCHANGED 파일은 CONFLICT로 마킹되지 않음', async () => {
      const srcDir = path.join(tmpDir, 'src');
      const tgtDir = path.join(tmpDir, 'tgt');
      await fs.mkdir(srcDir);
      await fs.mkdir(tgtDir);

      const entries: DiffEntry[] = [
        { relativePath: 'same.txt', name: 'same.txt', isDirectory: false,
          status: 'UNCHANGED', sourcePath: path.join(srcDir, 'same.txt'),
          targetPath: path.join(tgtDir, 'same.txt') },
      ];
      const result = makeResult(entries, srcDir, tgtDir);

      await applyConflictDetection(result, noopLog);

      // git 저장소가 아니므로 변경 없음
      assert.equal(result.entries[0].status, 'UNCHANGED');
    });
  });
});
