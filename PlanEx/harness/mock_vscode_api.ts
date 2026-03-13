// Mock VS Code API for Harness Engineering

export const workspace = {
    fs: {
        readDirectory: async (uri: any) => [],
        copy: async (source: any, target: any, options: any) => {},
        delete: async (uri: any, options: any) => {}
    }
};

export const commands = {
    executeCommand: async (command: string, ...rest: any[]) => {},
    registerCommand: (command: string, callback: (...args: any[]) => any) => ({ dispose: () => {} })
};

export const window = {
    createTreeView: (viewId: string, options: any) => ({
        reveal: async () => {},
        dispose: () => {}
    }),
    registerTreeDataProvider: (viewId: string, treeDataProvider: any) => ({ dispose: () => {} }),
    showErrorMessage: async (message: string) => {}
};

export const Uri = {
    file: (path: string) => ({ fsPath: path, path }),
    parse: (value: string) => ({ path: value })
};

export const vscode = {
    workspace,
    commands,
    window,
    Uri
};

export default vscode;
