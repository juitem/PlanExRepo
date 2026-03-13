import { strict as assert } from 'assert';
import { vscode } from '../harness/mockVscode';

// mockVscode를 모듈 레지스트리에 주입
// treeProvider는 vscode를 직접 import하므로 require hook으로 대체
// 대신 treeProvider의 핵심 로직을 독립적으로 테스트합니다.

import { CompareResult, DiffEntry } from '../../src/compareEngine';

// DiffTreeProvider를 직접 테스트하기 위해 vscode mock을 전역에 등록
// (ts-node 환경에서 require.cache 주입)
const Module = require('module');
const originalLoad = Module._load;
Module._load = function (request: string, parent: unknown, isMain: boolean) {
  if (request === 'vscode') return vscode;
  return originalLoad.call(this, request, parent, isMain);
};

const { DiffTreeProvider, DiffTreeItem } = require('../../src/treeProvider');

// 테스트 후 원래 _load 복구
after(() => {
  Module._load = originalLoad;
});

function makeResult(entries: DiffEntry[]): CompareResult {
  return {
    sourceRoot: '/src',
    targetRoot: '/tgt',
    entries,
    totalModified: entries.filter((e) => !e.isDirectory && e.status === 'MODIFIED').length,
    totalAdded: entries.filter((e) => !e.isDirectory && e.status === 'ADDED').length,
    totalDeleted: entries.filter((e) => !e.isDirectory && e.status === 'DELETED').length,
    totalUnchanged: entries.filter((e) => !e.isDirectory && e.status === 'UNCHANGED').length,
  };
}

describe('DiffTreeProvider', () => {
  let provider: InstanceType<typeof DiffTreeProvider>;

  beforeEach(() => {
    provider = new DiffTreeProvider();
    vscode.window.clearLog();
  });

  it('CompareResult 없을 때 getChildren(undefined)은 빈 배열 반환', async () => {
    const children = await provider.getChildren(undefined);
    assert.deepEqual(children, []);
  });

  it('ADDED 파일의 contextValue가 "added"', async () => {
    const entries: DiffEntry[] = [
      { relativePath: 'a.txt', name: 'a.txt', isDirectory: false, status: 'ADDED', sourcePath: '/src/a.txt' },
    ];
    provider.setResult(makeResult(entries));
    const children = await provider.getChildren(undefined);
    assert.equal(children.length, 1);
    assert.equal(children[0].contextValue, 'added');
  });

  it('MODIFIED 폴더의 contextValue가 "folder"', async () => {
    const entries: DiffEntry[] = [
      {
        relativePath: 'subdir', name: 'subdir', isDirectory: true, status: 'MODIFIED',
        children: [
          { relativePath: 'subdir/file.txt', name: 'file.txt', isDirectory: false, status: 'MODIFIED',
            sourcePath: '/src/subdir/file.txt', targetPath: '/tgt/subdir/file.txt' },
        ],
      },
    ];
    provider.setResult(makeResult(entries));
    const children = await provider.getChildren(undefined);
    assert.equal(children[0].contextValue, 'folder');
  });

  it('showUnchanged=false(기본값) 시 UNCHANGED 파일이 getChildren에서 제외', async () => {
    const entries: DiffEntry[] = [
      { relativePath: 'changed.txt', name: 'changed.txt', isDirectory: false, status: 'MODIFIED',
        sourcePath: '/src/changed.txt', targetPath: '/tgt/changed.txt' },
      { relativePath: 'same.txt', name: 'same.txt', isDirectory: false, status: 'UNCHANGED',
        sourcePath: '/src/same.txt', targetPath: '/tgt/same.txt' },
    ];
    provider.setResult(makeResult(entries));
    const children = await provider.getChildren(undefined);
    assert.equal(children.length, 1);
    assert.equal(children[0].entry.name, 'changed.txt');
  });

  it('showUnchanged=true 시 UNCHANGED 파일이 getChildren에 포함', async () => {
    const entries: DiffEntry[] = [
      { relativePath: 'changed.txt', name: 'changed.txt', isDirectory: false, status: 'MODIFIED',
        sourcePath: '/src/changed.txt', targetPath: '/tgt/changed.txt' },
      { relativePath: 'same.txt', name: 'same.txt', isDirectory: false, status: 'UNCHANGED',
        sourcePath: '/src/same.txt', targetPath: '/tgt/same.txt' },
    ];
    provider.setResult(makeResult(entries));
    provider.toggleShowUnchanged();
    const children = await provider.getChildren(undefined);
    assert.equal(children.length, 2);
  });

  it('toggleShowUnchanged 후 _onDidChangeTreeData가 fire됨', () => {
    let fired = false;
    provider.onDidChangeTreeData(() => { fired = true; });
    provider.toggleShowUnchanged();
    assert.equal(fired, true);
  });

  it('getModifiedFiles()가 UNCHANGED를 제외한 파일만 반환', () => {
    const entries: DiffEntry[] = [
      { relativePath: 'mod.txt', name: 'mod.txt', isDirectory: false, status: 'MODIFIED',
        sourcePath: '/src/mod.txt', targetPath: '/tgt/mod.txt' },
      { relativePath: 'same.txt', name: 'same.txt', isDirectory: false, status: 'UNCHANGED',
        sourcePath: '/src/same.txt', targetPath: '/tgt/same.txt' },
      { relativePath: 'added.txt', name: 'added.txt', isDirectory: false, status: 'ADDED',
        sourcePath: '/src/added.txt' },
    ];
    provider.setResult(makeResult(entries));
    const modFiles = provider.getModifiedFiles();
    const statuses = modFiles.map((f: DiffEntry) => f.status);
    assert.ok(!statuses.includes('UNCHANGED'));
    assert.ok(statuses.includes('MODIFIED'));
    assert.ok(statuses.includes('ADDED'));
  });

  it('폴더 노드의 description이 변경 수를 포함함', async () => {
    const entries: DiffEntry[] = [
      {
        relativePath: 'folder', name: 'folder', isDirectory: true, status: 'MODIFIED',
        children: [
          { relativePath: 'folder/a.txt', name: 'a.txt', isDirectory: false, status: 'MODIFIED',
            sourcePath: '/src/folder/a.txt', targetPath: '/tgt/folder/a.txt' },
          { relativePath: 'folder/b.txt', name: 'b.txt', isDirectory: false, status: 'ADDED',
            sourcePath: '/src/folder/b.txt' },
        ],
      },
    ];
    provider.setResult(makeResult(entries));
    const children = await provider.getChildren(undefined);
    assert.equal(children.length, 1);
    assert.ok(children[0].description.includes('2'));
  });

  it('markAsUnchanged 후 해당 파일이 UNCHANGED 처리됨', async () => {
    const entries: DiffEntry[] = [
      { relativePath: 'mod.txt', name: 'mod.txt', isDirectory: false, status: 'MODIFIED',
        sourcePath: '/src/mod.txt', targetPath: '/tgt/mod.txt' },
    ];
    provider.setResult(makeResult(entries));
    provider.markAsUnchanged('mod.txt');
    const result = provider.getCurrentResult();
    assert.equal(result.entries[0].status, 'UNCHANGED');
  });
});
