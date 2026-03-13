/**
 * Mock VS Code API
 * 실제 `vscode` 모듈 없이 단위 테스트에서 사용할 수 있는 Mock 구현체.
 * 실제 파일 I/O는 Node.js `fs/promises`를 통해 수행됩니다.
 */
import * as fs from 'fs/promises';
import * as nodePath from 'path';
import * as crypto from 'crypto';

// ─── Uri ─────────────────────────────────────────────────────────────────────

class MockUri {
  public readonly scheme: string;
  public readonly fsPath: string;
  public readonly path: string;

  constructor(scheme: string, fsPath: string) {
    this.scheme = scheme;
    this.fsPath = fsPath;
    this.path = fsPath;
  }

  static file(filePath: string): MockUri {
    return new MockUri('file', filePath);
  }

  static parse(value: string): MockUri {
    const colonIdx = value.indexOf(':');
    if (colonIdx === -1) return new MockUri('file', value);
    const scheme = value.slice(0, colonIdx);
    const rest = value.slice(colonIdx + 1);
    return new MockUri(scheme, rest);
  }

  static joinPath(base: MockUri, ...parts: string[]): MockUri {
    const joined = nodePath.join(base.fsPath, ...parts);
    return new MockUri(base.scheme, joined);
  }

  toString(): string {
    return `${this.scheme}:${this.fsPath}`;
  }
}

// ─── FileType ─────────────────────────────────────────────────────────────────

const MockFileType = {
  Unknown: 0,
  File: 1,
  Directory: 2,
  SymbolicLink: 64,
} as const;

// ─── workspace.fs ─────────────────────────────────────────────────────────────

const mockWorkspaceFs = {
  async readFile(uri: MockUri): Promise<Uint8Array> {
    const buf = await fs.readFile(uri.fsPath);
    return new Uint8Array(buf);
  },

  async writeFile(uri: MockUri, content: Uint8Array): Promise<void> {
    const dir = nodePath.dirname(uri.fsPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(uri.fsPath, Buffer.from(content));
  },

  async readDirectory(uri: MockUri): Promise<[string, number][]> {
    const entries = await fs.readdir(uri.fsPath, { withFileTypes: true });
    return entries.map((entry) => {
      let type: number;
      if (entry.isDirectory()) type = MockFileType.Directory;
      else if (entry.isSymbolicLink()) type = MockFileType.SymbolicLink;
      else if (entry.isFile()) type = MockFileType.File;
      else type = MockFileType.Unknown;
      return [entry.name, type] as [string, number];
    });
  },

  async stat(uri: MockUri): Promise<{ type: number; size: number; mtime: number; ctime: number }> {
    const stat = await fs.stat(uri.fsPath);
    let type: number;
    if (stat.isDirectory()) type = MockFileType.Directory;
    else if (stat.isSymbolicLink()) type = MockFileType.SymbolicLink;
    else if (stat.isFile()) type = MockFileType.File;
    else type = MockFileType.Unknown;
    return {
      type,
      size: stat.size,
      mtime: stat.mtimeMs,
      ctime: stat.ctimeMs,
    };
  },

  async createDirectory(uri: MockUri): Promise<void> {
    await fs.mkdir(uri.fsPath, { recursive: true });
  },

  async copy(source: MockUri, target: MockUri, options?: { overwrite?: boolean }): Promise<void> {
    const targetDir = nodePath.dirname(target.fsPath);
    await fs.mkdir(targetDir, { recursive: true });
    const flag = options?.overwrite ? undefined : fs.constants.COPYFILE_EXCL;
    if (flag !== undefined) {
      await fs.copyFile(source.fsPath, target.fsPath, flag);
    } else {
      await fs.copyFile(source.fsPath, target.fsPath);
    }
  },

  async delete(uri: MockUri, options?: { recursive?: boolean; useTrash?: boolean }): Promise<void> {
    if (options?.recursive) {
      await fs.rm(uri.fsPath, { recursive: true, force: true });
    } else {
      await fs.unlink(uri.fsPath);
    }
  },
};

// ─── window ───────────────────────────────────────────────────────────────────

type MessageHandler = (msg: string, ...args: unknown[]) => void;

const mockWindowLog: { type: string; message: string; items: unknown[] }[] = [];

const mockWindow = {
  _log: mockWindowLog,

  async showInformationMessage(msg: string, ...items: unknown[]): Promise<string | undefined> {
    mockWindowLog.push({ type: 'info', message: msg, items });
    return undefined;
  },

  async showWarningMessage(msg: string, ...items: unknown[]): Promise<string | undefined> {
    mockWindowLog.push({ type: 'warning', message: msg, items });
    // 기본값: 첫 번째 항목 반환 (확인 버튼 클릭 시뮬레이션)
    const opts = items[0];
    if (opts && typeof opts === 'object' && 'modal' in opts) {
      return items[1] as string | undefined;
    }
    return items[0] as string | undefined;
  },

  async showErrorMessage(msg: string, ...items: unknown[]): Promise<string | undefined> {
    mockWindowLog.push({ type: 'error', message: msg, items });
    return undefined;
  },

  async withProgress<T>(
    _options: unknown,
    task: (progress: { report(v: { message?: string; increment?: number }): void }) => Thenable<T>
  ): Promise<T> {
    return task({ report: () => {} });
  },

  createOutputChannel(name: string) {
    const lines: string[] = [];
    return {
      name,
      lines,
      appendLine(line: string) { lines.push(line); },
      append(text: string) { lines.push(text); },
      show() {},
      hide() {},
      dispose() {},
    };
  },

  async showOpenDialog(_options: unknown): Promise<MockUri[] | undefined> {
    return undefined;
  },

  clearLog() {
    mockWindowLog.length = 0;
  },
};

// ─── EventEmitter ─────────────────────────────────────────────────────────────

class MockEventEmitter<T> {
  private _listeners: ((e: T) => void)[] = [];
  private _disposed = false;

  get event(): (listener: (e: T) => void) => { dispose(): void } {
    return (listener: (e: T) => void) => {
      this._listeners.push(listener);
      return {
        dispose: () => {
          this._listeners = this._listeners.filter((l) => l !== listener);
        },
      };
    };
  }

  fire(data: T): void {
    if (this._disposed) return;
    this._listeners.forEach((l) => l(data));
  }

  dispose(): void {
    this._disposed = true;
    this._listeners = [];
  }
}

// ─── TreeItem & TreeItemCollapsibleState ──────────────────────────────────────

const MockTreeItemCollapsibleState = {
  None: 0,
  Collapsed: 1,
  Expanded: 2,
} as const;

class MockTreeItem {
  public label: string;
  public collapsibleState: number;
  public iconPath?: unknown;
  public contextValue?: string;
  public description?: string;
  public tooltip?: string;
  public command?: { command: string; title: string; arguments?: unknown[] };

  constructor(label: string, collapsibleState: number = MockTreeItemCollapsibleState.None) {
    this.label = label;
    this.collapsibleState = collapsibleState;
  }
}

// ─── ThemeIcon & ThemeColor ───────────────────────────────────────────────────

class MockThemeIcon {
  constructor(public readonly id: string, public readonly color?: unknown) {}
}

class MockThemeColor {
  constructor(public readonly id: string) {}
}

// ─── commands ─────────────────────────────────────────────────────────────────

const _registeredCommands: Map<string, (...args: unknown[]) => unknown> = new Map();

const mockCommands = {
  _registry: _registeredCommands,

  registerCommand(id: string, handler: (...args: unknown[]) => unknown) {
    _registeredCommands.set(id, handler);
    return { dispose: () => _registeredCommands.delete(id) };
  },

  async executeCommand(id: string, ...args: unknown[]): Promise<unknown> {
    const handler = _registeredCommands.get(id);
    if (handler) return handler(...args);
    return undefined;
  },

  clearAll() {
    _registeredCommands.clear();
  },
};

// ─── ProgressLocation ─────────────────────────────────────────────────────────

const MockProgressLocation = {
  Notification: 15,
  SourceControl: 1,
  Window: 10,
} as const;

// ─── Export ───────────────────────────────────────────────────────────────────

export const vscode = {
  Uri: MockUri,
  FileType: MockFileType,
  workspace: {
    fs: mockWorkspaceFs,
  },
  window: mockWindow,
  EventEmitter: MockEventEmitter,
  TreeItem: MockTreeItem,
  TreeItemCollapsibleState: MockTreeItemCollapsibleState,
  ThemeIcon: MockThemeIcon,
  ThemeColor: MockThemeColor,
  commands: mockCommands,
  ProgressLocation: MockProgressLocation,
};

export type MockVscode = typeof vscode;
