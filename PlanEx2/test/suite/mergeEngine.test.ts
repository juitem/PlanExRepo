import { strict as assert } from 'assert';
import * as os from 'os';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  mergeFileEntry,
  mergeFolderEntry,
  MergeAdapter,
  MergeOptions,
} from '../../src/mergeEngine';
import { DiffEntry } from '../../src/compareEngine';

// Real fs-based MergeAdapter for testing
function createFsMergeAdapter(): MergeAdapter {
  return {
    async copyFile(src: string, dst: string): Promise<void> {
      await fs.mkdir(path.dirname(dst), { recursive: true });
      await fs.copyFile(src, dst);
    },
    async deleteFile(target: string): Promise<void> {
      await fs.unlink(target);
    },
    async createDirectory(dirPath: string): Promise<void> {
      await fs.mkdir(dirPath, { recursive: true });
    },
    async exists(p: string): Promise<boolean> {
      try { await fs.access(p); return true; } catch { return false; }
    },
  };
}

async function writeTmp(dir: string, relPath: string, content: string): Promise<string> {
  const full = path.join(dir, relPath);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, content);
  return full;
}

describe('mergeEngine', () => {
  let tmpDir: string;
  let srcDir: string;
  let tgtDir: string;
  let adapter: MergeAdapter;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'planex2-merge-'));
    srcDir = path.join(tmpDir, 'src');
    tgtDir = path.join(tmpDir, 'tgt');
    await fs.mkdir(srcDir);
    await fs.mkdir(tgtDir);
    adapter = createFsMergeAdapter();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  // ─── mergeFileEntry ─────────────────────────────────────────────────────────

  describe('mergeFileEntry()', () => {
    it('ADDED 파일 toTarget 머지 시 파일이 복사됨', async () => {
      const srcFile = await writeTmp(srcDir, 'new.txt', 'new content');
      const entry: DiffEntry = {
        relativePath: 'new.txt', name: 'new.txt', isDirectory: false,
        status: 'ADDED', sourcePath: srcFile, targetPath: path.join(tgtDir, 'new.txt'),
      };
      const result = await mergeFileEntry(entry, { direction: 'toTarget', includeDeleted: false }, adapter);
      assert.equal(result, 'merged');
      const content = await fs.readFile(path.join(tgtDir, 'new.txt'), 'utf8');
      assert.equal(content, 'new content');
    });

    it('MODIFIED 파일 toTarget 머지 시 덮어쓰기됨', async () => {
      const srcFile = await writeTmp(srcDir, 'mod.txt', 'new version');
      const tgtFile = await writeTmp(tgtDir, 'mod.txt', 'old version');
      const entry: DiffEntry = {
        relativePath: 'mod.txt', name: 'mod.txt', isDirectory: false,
        status: 'MODIFIED', sourcePath: srcFile, targetPath: tgtFile,
      };
      const result = await mergeFileEntry(entry, { direction: 'toTarget', includeDeleted: false }, adapter);
      assert.equal(result, 'merged');
      const content = await fs.readFile(tgtFile, 'utf8');
      assert.equal(content, 'new version');
    });

    it('CONFLICT 파일은 "conflict" 반환 — 절대 머지 안 함 (RULE-004)', async () => {
      const srcFile = await writeTmp(srcDir, 'conflict.txt', 'src version');
      const tgtFile = await writeTmp(tgtDir, 'conflict.txt', 'tgt version');
      const entry: DiffEntry = {
        relativePath: 'conflict.txt', name: 'conflict.txt', isDirectory: false,
        status: 'CONFLICT', sourcePath: srcFile, targetPath: tgtFile,
      };
      const result = await mergeFileEntry(entry, { direction: 'toTarget', includeDeleted: false }, adapter);
      assert.equal(result, 'conflict');
      // 파일이 변경되지 않아야 함
      const content = await fs.readFile(tgtFile, 'utf8');
      assert.equal(content, 'tgt version');
    });

    it('UNCHANGED 파일은 "skipped" 반환', async () => {
      const srcFile = await writeTmp(srcDir, 'same.txt', 'same');
      const tgtFile = await writeTmp(tgtDir, 'same.txt', 'same');
      const entry: DiffEntry = {
        relativePath: 'same.txt', name: 'same.txt', isDirectory: false,
        status: 'UNCHANGED', sourcePath: srcFile, targetPath: tgtFile,
      };
      const result = await mergeFileEntry(entry, { direction: 'toTarget', includeDeleted: false }, adapter);
      assert.equal(result, 'skipped');
    });

    it('복사 중 오류 발생 시 "failed" 반환', async () => {
      const entry: DiffEntry = {
        relativePath: 'ghost.txt', name: 'ghost.txt', isDirectory: false,
        status: 'MODIFIED',
        sourcePath: '/nonexistent/path/ghost.txt',
        targetPath: path.join(tgtDir, 'ghost.txt'),
      };
      const result = await mergeFileEntry(entry, { direction: 'toTarget', includeDeleted: false }, adapter);
      assert.equal(result, 'failed');
    });

    it('toSource 방향도 올바르게 동작', async () => {
      const srcFile = path.join(srcDir, 'reverse.txt');
      const tgtFile = await writeTmp(tgtDir, 'reverse.txt', 'target version');
      const entry: DiffEntry = {
        relativePath: 'reverse.txt', name: 'reverse.txt', isDirectory: false,
        status: 'MODIFIED', sourcePath: srcFile, targetPath: tgtFile,
      };
      const result = await mergeFileEntry(entry, { direction: 'toSource', includeDeleted: false }, adapter);
      assert.equal(result, 'merged');
      const content = await fs.readFile(srcFile, 'utf8');
      assert.equal(content, 'target version');
    });
  });

  // ─── mergeFolderEntry ───────────────────────────────────────────────────────

  describe('mergeFolderEntry()', () => {
    function makeEntry(children: DiffEntry[]): DiffEntry {
      return {
        relativePath: 'folder', name: 'folder', isDirectory: true,
        status: 'MODIFIED',
        sourcePath: srcDir, targetPath: tgtDir,
        children,
      };
    }

    it('하위 ADDED/MODIFIED 파일들이 모두 머지됨', async () => {
      const src1 = await writeTmp(srcDir, 'a.txt', 'aaa');
      const src2 = await writeTmp(srcDir, 'b.txt', 'bbb');
      const tgt2 = await writeTmp(tgtDir, 'b.txt', 'old');

      const children: DiffEntry[] = [
        { relativePath: 'folder/a.txt', name: 'a.txt', isDirectory: false, status: 'ADDED',
          sourcePath: src1, targetPath: path.join(tgtDir, 'a.txt') },
        { relativePath: 'folder/b.txt', name: 'b.txt', isDirectory: false, status: 'MODIFIED',
          sourcePath: src2, targetPath: tgt2 },
      ];

      const result = await mergeFolderEntry(makeEntry(children), { direction: 'toTarget', includeDeleted: false }, adapter);
      assert.equal(result.merged.length, 2);
      assert.equal(result.failed.length, 0);
    });

    it('CONFLICT 파일은 conflictCount에 포함되고 건너뜀 (RULE-004)', async () => {
      const src1 = await writeTmp(srcDir, 'conflict.txt', 'src');
      const tgt1 = await writeTmp(tgtDir, 'conflict.txt', 'tgt');

      const children: DiffEntry[] = [
        { relativePath: 'folder/conflict.txt', name: 'conflict.txt', isDirectory: false,
          status: 'CONFLICT', sourcePath: src1, targetPath: tgt1 },
      ];

      const result = await mergeFolderEntry(makeEntry(children), { direction: 'toTarget', includeDeleted: false }, adapter);
      assert.equal(result.conflictCount, 1);
      assert.equal(result.merged.length, 0);
      // CONFLICT 파일이 변경되지 않아야 함
      const content = await fs.readFile(tgt1, 'utf8');
      assert.equal(content, 'tgt');
    });

    it('includeDeleted=false 시 DELETED 파일이 Target에서 삭제되지 않음', async () => {
      const tgtFile = await writeTmp(tgtDir, 'deleted.txt', 'keep me');
      const children: DiffEntry[] = [
        { relativePath: 'folder/deleted.txt', name: 'deleted.txt', isDirectory: false,
          status: 'DELETED', targetPath: tgtFile },
      ];

      await mergeFolderEntry(makeEntry(children), { direction: 'toTarget', includeDeleted: false }, adapter);
      const exists = await adapter.exists(tgtFile);
      assert.equal(exists, true);
    });

    it('includeDeleted=true 시 DELETED 파일이 Target에서 삭제됨', async () => {
      const tgtFile = await writeTmp(tgtDir, 'delete-me.txt', 'bye');
      const children: DiffEntry[] = [
        { relativePath: 'folder/delete-me.txt', name: 'delete-me.txt', isDirectory: false,
          status: 'DELETED', targetPath: tgtFile },
      ];

      await mergeFolderEntry(makeEntry(children), { direction: 'toTarget', includeDeleted: true }, adapter);
      const exists = await adapter.exists(tgtFile);
      assert.equal(exists, false);
    });

    it('onProgress 콜백이 각 파일마다 호출됨', async () => {
      const src1 = await writeTmp(srcDir, 'f1.txt', 'a');
      const src2 = await writeTmp(srcDir, 'f2.txt', 'b');
      const children: DiffEntry[] = [
        { relativePath: 'folder/f1.txt', name: 'f1.txt', isDirectory: false, status: 'ADDED',
          sourcePath: src1, targetPath: path.join(tgtDir, 'f1.txt') },
        { relativePath: 'folder/f2.txt', name: 'f2.txt', isDirectory: false, status: 'ADDED',
          sourcePath: src2, targetPath: path.join(tgtDir, 'f2.txt') },
      ];

      const progressMessages: string[] = [];
      await mergeFolderEntry(makeEntry(children), { direction: 'toTarget', includeDeleted: false }, adapter,
        (msg) => progressMessages.push(msg));
      assert.equal(progressMessages.length, 2);
    });
  });
});
