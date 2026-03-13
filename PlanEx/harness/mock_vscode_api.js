"use strict";
// Mock VS Code API for Harness Engineering
Object.defineProperty(exports, "__esModule", { value: true });
exports.vscode = exports.Uri = exports.window = exports.commands = exports.workspace = void 0;
exports.workspace = {
    fs: {
        readDirectory: async (uri) => [],
        copy: async (source, target, options) => { },
        delete: async (uri, options) => { }
    }
};
exports.commands = {
    executeCommand: async (command, ...rest) => { },
    registerCommand: (command, callback) => ({ dispose: () => { } })
};
exports.window = {
    createTreeView: (viewId, options) => ({
        reveal: async () => { },
        dispose: () => { }
    }),
    registerTreeDataProvider: (viewId, treeDataProvider) => ({ dispose: () => { } }),
    showErrorMessage: async (message) => { }
};
exports.Uri = {
    file: (path) => ({ fsPath: path, path }),
    parse: (value) => ({ path: value })
};
exports.vscode = {
    workspace: exports.workspace,
    commands: exports.commands,
    window: exports.window,
    Uri: exports.Uri
};
exports.default = exports.vscode;
