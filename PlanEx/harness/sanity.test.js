"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const mock_vscode_api_1 = require("./mock_vscode_api");
async function verifyHarnessSanity() {
    try {
        console.log("Testing VS Code Mock API Inference...");
        // Assert objects are defined
        assert(mock_vscode_api_1.vscode.workspace !== undefined, "vscode.workspace is undefined");
        assert(mock_vscode_api_1.vscode.commands !== undefined, "vscode.commands is undefined");
        assert(mock_vscode_api_1.vscode.window !== undefined, "vscode.window is undefined");
        assert(mock_vscode_api_1.vscode.Uri !== undefined, "vscode.Uri is undefined");
        // Smoke test one logical method
        const uri = mock_vscode_api_1.vscode.Uri.file('/fake/path');
        assert(uri.path === '/fake/path', "Uri.file did not parse path correctly");
        console.log("✅ Sanity Test Passed. The Harness environment is functional.");
    }
    catch (e) {
        console.error("❌ Sanity Test Failed:", e);
        process.exit(1);
    }
}
verifyHarnessSanity();
