/**
 * Mock VS Code API Sanity Tests
 * mockVscode.ts가 올바르게 동작하는지 검증합니다.
 */
import { strict as assert } from 'assert';
import { vscode } from './mockVscode';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs/promises';

describe('Mock VS Code API Sanity Tests', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'planex2-sanity-'));
    vscode.window.clearLog();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  // ─── Uri ───────────────────────────────────────────────────────────────────

  it('Uri.file() creates a valid URI with fsPath', () => {
    const uri = vscode.Uri.file('/some/path/file.ts');
    assert.equal(uri.scheme, 'file');
    assert.equal(uri.fsPath, '/some/path/file.ts');
  });

  it('Uri.joinPath() correctly joins paths', () => {
    const base = vscode.Uri.file('/root/dir');
    const joined = vscode.Uri.joinPath(base, 'sub', 'file.ts');
    assert.equal(joined.fsPath, path.join('/root/dir', 'sub', 'file.ts'));
    assert.equal(joined.scheme, 'file');
  });

  it('Uri.parse() handles untitled: scheme', () => {
    const uri = vscode.Uri.parse('untitled:empty-source');
    assert.equal(uri.scheme, 'untitled');
    assert.equal(uri.fsPath, 'empty-source');
  });

  // ─── workspace.fs ──────────────────────────────────────────────────────────

  it('workspace.fs.readDirectory() reads real temp directory', async () => {
    await fs.writeFile(path.join(tmpDir, 'a.txt'), 'hello');
    await fs.mkdir(path.join(tmpDir, 'subdir'));

    const uri = vscode.Uri.file(tmpDir);
    const entries = await vscode.workspace.fs.readDirectory(uri);

    assert.ok(Array.isArray(entries));
    const names = entries.map(([name]) => name);
    assert.ok(names.includes('a.txt'));
    assert.ok(names.includes('subdir'));

    const fileEntry = entries.find(([name]) => name === 'a.txt');
    const dirEntry = entries.find(([name]) => name === 'subdir');
    assert.ok(fileEntry);
    assert.ok(dirEntry);
    assert.equal(fileEntry[1], vscode.FileType.File);
    assert.equal(dirEntry[1], vscode.FileType.Directory);
  });

  it('workspace.fs.readFile() reads real temp file', async () => {
    const filePath = path.join(tmpDir, 'test.txt');
    await fs.writeFile(filePath, 'hello world');

    const uri = vscode.Uri.file(filePath);
    const content = await vscode.workspace.fs.readFile(uri);

    assert.ok(content instanceof Uint8Array);
    assert.equal(Buffer.from(content).toString(), 'hello world');
  });

  it('workspace.fs.writeFile() writes real temp file', async () => {
    const filePath = path.join(tmpDir, 'written.txt');
    const uri = vscode.Uri.file(filePath);
    const content = Buffer.from('written content');

    await vscode.workspace.fs.writeFile(uri, new Uint8Array(content));
    const read = await fs.readFile(filePath, 'utf8');
    assert.equal(read, 'written content');
  });

  it('workspace.fs.stat() returns correct FileType for file', async () => {
    const filePath = path.join(tmpDir, 'stat.txt');
    await fs.writeFile(filePath, 'data');
    const uri = vscode.Uri.file(filePath);
    const stat = await vscode.workspace.fs.stat(uri);
    assert.equal(stat.type, vscode.FileType.File);
    assert.ok(stat.size > 0);
  });

  it('workspace.fs.stat() returns Directory for directory', async () => {
    const uri = vscode.Uri.file(tmpDir);
    const stat = await vscode.workspace.fs.stat(uri);
    assert.equal(stat.type, vscode.FileType.Directory);
  });

  it('workspace.fs.createDirectory() creates nested directories', async () => {
    const nestedPath = path.join(tmpDir, 'a', 'b', 'c');
    const uri = vscode.Uri.file(nestedPath);
    await vscode.workspace.fs.createDirectory(uri);
    const stat = await fs.stat(nestedPath);
    assert.ok(stat.isDirectory());
  });

  // ─── EventEmitter ──────────────────────────────────────────────────────────

  it('EventEmitter fires events to listeners', () => {
    const emitter = new vscode.EventEmitter<string>();
    const received: string[] = [];
    emitter.event((val) => received.push(val));
    emitter.fire('hello');
    emitter.fire('world');
    assert.deepEqual(received, ['hello', 'world']);
  });

  it('EventEmitter does not fire after dispose()', () => {
    const emitter = new vscode.EventEmitter<number>();
    const received: number[] = [];
    emitter.event((n) => received.push(n));
    emitter.fire(1);
    emitter.dispose();
    emitter.fire(2);
    assert.deepEqual(received, [1]);
  });

  // ─── window ────────────────────────────────────────────────────────────────

  it('window.showWarningMessage returns first option by default', async () => {
    const result = await vscode.window.showWarningMessage('Are you sure?', 'Yes', 'No');
    assert.equal(result, 'Yes');
  });

  it('window.showWarningMessage with modal returns second item (first option after opts)', async () => {
    const result = await vscode.window.showWarningMessage(
      'Confirm?',
      { modal: true },
      'Merge',
      'Cancel'
    );
    assert.equal(result, 'Merge');
  });

  it('window._log records all messages', async () => {
    await vscode.window.showInformationMessage('info msg');
    await vscode.window.showErrorMessage('error msg');
    assert.equal(vscode.window._log.length, 2);
    assert.equal(vscode.window._log[0].type, 'info');
    assert.equal(vscode.window._log[1].type, 'error');
  });

  // ─── ThemeIcon / ThemeColor ────────────────────────────────────────────────

  it('ThemeIcon holds id correctly', () => {
    const icon = new vscode.ThemeIcon('diff-added');
    assert.equal(icon.id, 'diff-added');
  });

  it('ThemeIcon holds color correctly', () => {
    const color = new vscode.ThemeColor('gitDecoration.addedResourceForeground');
    const icon = new vscode.ThemeIcon('diff-added', color);
    assert.ok(icon.color instanceof vscode.ThemeColor);
  });
});
