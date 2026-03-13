import assert = require('assert');
import { vscode } from './mock_vscode_api';

async function verifyHarnessSanity() {
    try {
        console.log("Testing VS Code Mock API Inference...");
        
        // Assert objects are defined
        assert(vscode.workspace !== undefined, "vscode.workspace is undefined");
        assert(vscode.commands !== undefined, "vscode.commands is undefined");
        assert(vscode.window !== undefined, "vscode.window is undefined");
        assert(vscode.Uri !== undefined, "vscode.Uri is undefined");

        // Smoke test one logical method
        const uri = vscode.Uri.file('/fake/path');
        assert(uri.path === '/fake/path', "Uri.file did not parse path correctly");

        console.log("✅ Sanity Test Passed. The Harness environment is functional.");
    } catch (e) {
        console.error("❌ Sanity Test Failed:", e);
        process.exit(1);
    }
}

verifyHarnessSanity();
