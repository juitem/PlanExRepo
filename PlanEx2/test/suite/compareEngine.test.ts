import { strict as assert } from 'assert';
import * as os from 'os';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  compareFolders,
  filesAreEqual,
  hashFile,
  FsAdapter,
} from '../../src/compareEngine';

// Real Node.js FsAdapter for testing
const realFsAdapter: FsAdapter = {
  async readDirectory(dirPath: string): Promise<[string, 'file' | 'directory'][]> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries.map((e) => [e.name, e.isDirectory() ? 'directory' : 'file'] as [string, 'file' | 'directory']);
  },
  async readFile(filePath: string): Promise<Buffer> {
    return fs.readFile(filePath);
  },
  async exists(p: string): Promise<boolean> {
    try { await fs.access(p); return true; } catch { return false; }
  },
};

async function writeTmp(dir: string, relPath: string, content: string): Promise<string> {
  const full = path.join(dir, relPath);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, content);
  return full;
}

describe('compareEngine', () => {
  let tmpDir: string;
  let srcDir: string;
  let tgtDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'planex2-ce-'));
    srcDir = path.join(tmpDir, 'src');
    tgtDir = path.join(tmpDir, 'tgt');
    await fs.mkdir(srcDir);
    await fs.mkdir(tgtDir);
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  // ─── filesAreEqual ──────────────────────────────────────────────────────────

  describe('filesAreEqual()', () => {
    it('동일한 내용의 파일을 UNCHANGED로 판단', async () => {
      await writeTmp(tmpDir, 'a.txt', 'hello');
      await writeTmp(tmpDir, 'b.txt', 'hello');
      const result = await filesAreEqual(
        path.join(tmpDir, 'a.txt'),
        path.join(tmpDir, 'b.txt'),
        realFsAdapter
      );
      assert.equal(result, true);
    });

    it('다른 내용의 파일을 MODIFIED로 판단', async () => {
      await writeTmp(tmpDir, 'a.txt', 'hello');
      await writeTmp(tmpDir, 'b.txt', 'world');
      const result = await filesAreEqual(
        path.join(tmpDir, 'a.txt'),
        path.join(tmpDir, 'b.txt'),
        realFsAdapter
      );
      assert.equal(result, false);
    });
  });

  // ─── compareFolders ─────────────────────────────────────────────────────────

  describe('compareFolders()', () => {
    it('Source에만 있는 파일을 ADDED로 판단', async () => {
      await writeTmp(srcDir, 'only-in-src.txt', 'data');

      const result = await compareFolders(srcDir, tgtDir, realFsAdapter);
      assert.equal(result.entries.length, 1);
      assert.equal(result.entries[0].status, 'ADDED');
      assert.equal(result.entries[0].name, 'only-in-src.txt');
      assert.equal(result.totalAdded, 1);
    });

    it('Target에만 있는 파일을 DELETED로 판단', async () => {
      await writeTmp(tgtDir, 'only-in-tgt.txt', 'data');

      const result = await compareFolders(srcDir, tgtDir, realFsAdapter);
      assert.equal(result.entries.length, 1);
      assert.equal(result.entries[0].status, 'DELETED');
      assert.equal(result.totalDeleted, 1);
    });

    it('양쪽에 다른 내용의 파일을 MODIFIED로 판단', async () => {
      await writeTmp(srcDir, 'shared.txt', 'version-A');
      await writeTmp(tgtDir, 'shared.txt', 'version-B');

      const result = await compareFolders(srcDir, tgtDir, realFsAdapter);
      assert.equal(result.entries.length, 1);
      assert.equal(result.entries[0].status, 'MODIFIED');
      assert.equal(result.totalModified, 1);
    });

    it('양쪽에 같은 내용의 파일을 UNCHANGED로 판단', async () => {
      await writeTmp(srcDir, 'same.txt', 'identical');
      await writeTmp(tgtDir, 'same.txt', 'identical');

      const result = await compareFolders(srcDir, tgtDir, realFsAdapter);
      assert.equal(result.entries.length, 1);
      assert.equal(result.entries[0].status, 'UNCHANGED');
      assert.equal(result.totalUnchanged, 1);
    });

    it('중첩 디렉토리를 재귀적으로 비교', async () => {
      await writeTmp(srcDir, 'sub/a.txt', 'aaa');
      await writeTmp(tgtDir, 'sub/a.txt', 'bbb');

      const result = await compareFolders(srcDir, tgtDir, realFsAdapter);
      assert.equal(result.entries.length, 1);
      const folder = result.entries[0];
      assert.equal(folder.isDirectory, true);
      assert.equal(folder.status, 'MODIFIED');
      assert.ok(folder.children);
      assert.equal(folder.children.length, 1);
      assert.equal(folder.children[0].status, 'MODIFIED');
    });

    it('ignoreFilter가 적용된 파일을 결과에서 제외', async () => {
      await writeTmp(srcDir, 'keep.txt', 'data');
      await writeTmp(srcDir, 'ignore-me.txt', 'data');

      const ignoreFilter = (rel: string) => rel === 'ignore-me.txt';
      const result = await compareFolders(srcDir, tgtDir, realFsAdapter, ignoreFilter);
      const names = result.entries.map((e) => e.name);
      assert.ok(names.includes('keep.txt'));
      assert.ok(!names.includes('ignore-me.txt'));
    });

    it('빈 Source와 비어있지 않은 Target 비교', async () => {
      await writeTmp(tgtDir, 'a.txt', 'data');
      await writeTmp(tgtDir, 'b.txt', 'data');

      const result = await compareFolders(srcDir, tgtDir, realFsAdapter);
      assert.equal(result.totalDeleted, 2);
      assert.equal(result.totalAdded, 0);
    });

    it('두 빈 디렉토리 비교 시 빈 결과 반환', async () => {
      const result = await compareFolders(srcDir, tgtDir, realFsAdapter);
      assert.equal(result.entries.length, 0);
      assert.equal(result.totalModified, 0);
      assert.equal(result.totalAdded, 0);
      assert.equal(result.totalDeleted, 0);
    });

    it('CompareResult의 totalModified/Added/Deleted 카운트가 정확', async () => {
      await writeTmp(srcDir, 'added.txt', 'new');
      await writeTmp(tgtDir, 'deleted.txt', 'old');
      await writeTmp(srcDir, 'modified.txt', 'v1');
      await writeTmp(tgtDir, 'modified.txt', 'v2');
      await writeTmp(srcDir, 'same.txt', 'same');
      await writeTmp(tgtDir, 'same.txt', 'same');

      const result = await compareFolders(srcDir, tgtDir, realFsAdapter);
      assert.equal(result.totalAdded, 1);
      assert.equal(result.totalDeleted, 1);
      assert.equal(result.totalModified, 1);
      assert.equal(result.totalUnchanged, 1);
    });
  });
});
