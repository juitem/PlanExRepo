import { strict as assert } from 'assert';
import { vscode } from '../harness/mockVscode';

const Module = require('module');
const originalLoad = Module._load;
Module._load = function (request: string, parent: unknown, isMain: boolean) {
  if (request === 'vscode') return vscode;
  return originalLoad.call(this, request, parent, isMain);
};

const { DiffNavigator, openDiffForEntry } = require('../../src/commands/navigate');
const { DiffTreeProvider } = require('../../src/treeProvider');

after(() => {
  Module._load = originalLoad;
});

import { DiffEntry, CompareResult } from '../../src/compareEngine';

function makeMockTreeView() {
  return {
    async reveal() {},
    dispose() {},
  };
}

function makeEntry(status: DiffEntry['status']): DiffEntry {
  return {
    relativePath: `${status}.txt`,
    name: `${status}.txt`,
    isDirectory: false,
    status,
    sourcePath: `/src/${status}.txt`,
    targetPath: `/tgt/${status}.txt`,
  };
}

describe('DiffNavigator', () => {
  let provider: InstanceType<typeof DiffTreeProvider>;
  let treeView: ReturnType<typeof makeMockTreeView>;
  let navigator: InstanceType<typeof DiffNavigator>;

  beforeEach(() => {
    vscode.window.clearLog();
    vscode.commands.clearAll();
    provider = new DiffTreeProvider();
    treeView = makeMockTreeView();
    navigator = new DiffNavigator(treeView, provider);
  });

  it('파일 목록이 없을 때 next()가 informationMessage 호출', async () => {
    await navigator.next();
    assert.ok(vscode.window._log.some((l: {type:string}) => l.type === 'info'));
  });

  it('파일 목록이 없을 때 prev()가 informationMessage 호출', async () => {
    await navigator.prev();
    assert.ok(vscode.window._log.some((l: {type:string}) => l.type === 'info'));
  });

  it('next()가 인덱스 0으로 설정하고 vscode.diff 명령을 실행', async () => {
    const executed: string[] = [];
    vscode.commands.registerCommand('vscode.diff', (...args: unknown[]) => {
      executed.push('vscode.diff');
    });

    const files = [makeEntry('MODIFIED')];
    navigator.updateFiles(files);
    await navigator.next();
    assert.ok(executed.includes('vscode.diff'));
  });

  it('마지막 파일에서 next()가 "end of list" 메시지 표시', async () => {
    navigator.updateFiles([makeEntry('MODIFIED')]);
    await navigator.next(); // index 0
    vscode.window.clearLog();
    await navigator.next(); // 끝 → 메시지
    assert.ok(vscode.window._log.some((l: {type:string; message:string}) =>
      l.type === 'info' && l.message.includes('end of list')
    ));
  });

  it('prev()가 목록 처음에서 "start of list" 메시지 표시', async () => {
    navigator.updateFiles([makeEntry('MODIFIED')]);
    await navigator.prev();
    assert.ok(vscode.window._log.some((l: {type:string; message:string}) =>
      l.type === 'info'
    ));
  });

  it('next() 후 prev()가 같은 파일로 돌아옴', async () => {
    const executed: string[][] = [];
    vscode.commands.registerCommand('vscode.diff', (src: unknown, tgt: unknown, title: unknown) => {
      executed.push([String(src), String(tgt), String(title)]);
    });

    navigator.updateFiles([makeEntry('MODIFIED'), makeEntry('ADDED')]);
    await navigator.next(); // index 0
    await navigator.next(); // index 1
    await navigator.prev(); // back to 0
    // 총 3번 vscode.diff 실행
    assert.equal(executed.length, 3);
    // 첫번째와 세번째가 같은 파일
    assert.deepEqual(executed[0], executed[2]);
  });
});

describe('openDiffForEntry()', () => {
  beforeEach(() => {
    vscode.window.clearLog();
    vscode.commands.clearAll();
  });

  it('MODIFIED 파일은 두 실제 URI로 vscode.diff 실행', async () => {
    let capturedArgs: unknown[] = [];
    vscode.commands.registerCommand('vscode.diff', (...args: unknown[]) => {
      capturedArgs = args;
    });

    const entry: DiffEntry = {
      relativePath: 'mod.txt', name: 'mod.txt', isDirectory: false, status: 'MODIFIED',
      sourcePath: '/src/mod.txt', targetPath: '/tgt/mod.txt',
    };
    await openDiffForEntry(entry);
    assert.ok(String(capturedArgs[0]).includes('/src/mod.txt'));
    assert.ok(String(capturedArgs[1]).includes('/tgt/mod.txt'));
  });

  it('ADDED 파일 (sourcePath 있음, targetPath 없음)은 untitled URI 사용', async () => {
    let capturedArgs: unknown[] = [];
    vscode.commands.registerCommand('vscode.diff', (...args: unknown[]) => {
      capturedArgs = args;
    });

    const entry: DiffEntry = {
      relativePath: 'added.txt', name: 'added.txt', isDirectory: false, status: 'ADDED',
      sourcePath: '/src/added.txt',
    };
    await openDiffForEntry(entry);
    assert.ok(String(capturedArgs[0]).includes('/src/added.txt'));
    assert.ok(String(capturedArgs[1]).includes('untitled'));
  });

  it('DELETED 파일 (targetPath 있음, sourcePath 없음)은 untitled URI 사용', async () => {
    let capturedArgs: unknown[] = [];
    vscode.commands.registerCommand('vscode.diff', (...args: unknown[]) => {
      capturedArgs = args;
    });

    const entry: DiffEntry = {
      relativePath: 'deleted.txt', name: 'deleted.txt', isDirectory: false, status: 'DELETED',
      targetPath: '/tgt/deleted.txt',
    };
    await openDiffForEntry(entry);
    assert.ok(String(capturedArgs[0]).includes('untitled'));
    assert.ok(String(capturedArgs[1]).includes('/tgt/deleted.txt'));
  });
});
