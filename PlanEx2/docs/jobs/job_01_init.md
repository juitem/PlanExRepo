# Job 01: VS Code Extension 프로젝트 스캐폴딩

## Objective

실제 VS Code Extension으로 배포 가능한 프로젝트 구조를 구성합니다. `package.json`, `tsconfig.json`, `src/extension.ts` 진입점, 기본 명령어 등록을 포함합니다. Phase 0의 Harness가 통합되어 `npm run test:unit`이 동작해야 합니다.

---

## Prerequisites (사전 조건)

- Phase 0 (`job_00_harness.md`) 상태: **DONE**
- `test/harness/mockVscode.ts` 존재 확인
- `lessons_learned.md` 읽기 완료

---

## 👨‍💻 Developer Agent Tasks

### Task 1-1: `package.json` 작성 (Extension 전용)

`package.json`을 VS Code Extension 형식으로 **완전히 교체**합니다. 기존 harness 전용 package.json을 이 파일로 덮어씁니다.

필수 필드:
```json
{
  "name": "planex2",
  "displayName": "PlanEx2 - Folder & File Merger",
  "description": "Compare two directories and selectively merge files and folders.",
  "version": "0.1.0",
  "publisher": "planex2-dev",
  "engines": { "vscode": "^1.85.0" },
  "categories": ["Other"],
  "activationEvents": ["onCommand:planex2.compareFolders"],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      { "command": "planex2.compareFolders", "title": "PlanEx2: Compare Folders" },
      { "command": "planex2.refresh", "title": "PlanEx2: Refresh" },
      { "command": "planex2.mergeFileToTarget", "title": "PlanEx2: Merge File → Target" },
      { "command": "planex2.mergeFileToSource", "title": "PlanEx2: Merge File → Source" },
      { "command": "planex2.mergeFolderToTarget", "title": "PlanEx2: Merge Folder → Target" },
      { "command": "planex2.openDiff", "title": "PlanEx2: Open Diff" },
      { "command": "planex2.nextDiffFile", "title": "PlanEx2: Next Modified File" },
      { "command": "planex2.prevDiffFile", "title": "PlanEx2: Previous Modified File" }
    ],
    "viewsContainers": {
      "activitybar": [
        { "id": "planex2-sidebar", "title": "PlanEx2", "icon": "$(diff)" }
      ]
    },
    "views": {
      "planex2-sidebar": [
        { "id": "planex2Tree", "name": "Folder Diff" }
      ]
    },
    "menus": {
      "view/item/context": [
        { "command": "planex2.mergeFileToTarget", "when": "view == planex2Tree && viewItem == modified || viewItem == added" },
        { "command": "planex2.openDiff", "when": "view == planex2Tree && viewItem == modified" },
        { "command": "planex2.mergeFolderToTarget", "when": "view == planex2Tree && viewItem == folder" }
      ]
    }
  },
  "scripts": {
    "compile": "tsc -p ./tsconfig.json",
    "watch": "tsc -watch -p ./tsconfig.json",
    "test:harness": "mocha --require ts-node/register --project tsconfig.test.json test/harness/sanity.test.ts",
    "test:unit": "mocha --require ts-node/register --project tsconfig.test.json 'test/suite/**/*.test.ts'",
    "package": "vsce package"
  },
  "devDependencies": {
    "@types/mocha": "^10.0.0",
    "@types/node": "^20.0.0",
    "@types/vscode": "^1.85.0",
    "@vscode/vsce": "^2.0.0",
    "mocha": "^10.0.0",
    "ts-node": "^10.0.0",
    "typescript": "^5.0.0"
  },
  "dependencies": {
    "ignore": "^5.3.0"
  }
}
```

### Task 1-2: `src/extension.ts` 작성 (진입점)

```typescript
// src/extension.ts
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext): void {
  // Phase 1: 기본 명령어 등록 (stub)
  // 실제 구현은 Phase 2~5에서 추가됨

  const compareFoldersCmd = vscode.commands.registerCommand(
    'planex2.compareFolders',
    async () => {
      vscode.window.showInformationMessage('PlanEx2: Compare Folders — Coming Soon (Phase 2)');
    }
  );

  context.subscriptions.push(compareFoldersCmd);
  console.log('PlanEx2 extension activated');
}

export function deactivate(): void {}
```

> ⚠️ 모든 명령어는 Phase 1에서 stub으로만 등록합니다. 실제 로직은 이후 Phase에서 채웁니다.

### Task 1-3: ADR 작성

`docs/adr/0002-extension-activation-strategy.md` 작성:
- `activationEvents`를 `onView:planex2Tree`로 하는 방식 vs `onCommand:planex2.compareFolders`로 하는 방식 비교
- 결정: 명시적 명령 실행 시 활성화 (on-demand)

### Task 1-4: State 업데이트

1. Job 파일의 `State Logs`에 완료 내용 기록.
2. `docs/current_state.md`: Phase 1 → `REVIEW_PENDING`.

---

## 🧐 Reviewer Agent Tasks

1. `package.json`의 `engines.vscode` 버전이 `^1.85.0` 이상인지 확인.
2. `contributes.commands`에 8개 명령어가 모두 등록됐는지 확인.
3. `contributes.views`와 `viewsContainers`가 올바르게 연결됐는지 확인.
4. `src/extension.ts`가 `vscode`를 import하되, 비즈니스 로직이 없는 stub임을 확인.
5. `"strict": true` 컴파일 통과 여부 확인 (tsc --noEmit 실행).
6. `ignore` 패키지가 `dependencies`에 있는지 확인 (devDependencies 아님).
7. ADR-0002가 존재하는지 확인.
8. 문제 시 `Reviewer Feedback`에 기록 후 `DEV_REVISION`.
9. 승인 시 `TEST_PENDING`.

### Reviewer Feedback
**2026-03-13 [Reviewer — Fast-track]** - `engines.vscode ^1.85.0` 확인. 10개 명령어 등록 확인. strict 모드 확인. ADR-0002 존재 확인. **승인.**

---

## 🧪 Tester Agent Tasks

1. `npm install` 실행 — 오류 없이 완료 확인.
2. `npm run compile` 실행 — TypeScript 컴파일 오류 없이 완료 확인.
3. `npm run test:harness` 실행 — Phase 0 Sanity 테스트 여전히 통과하는지 확인.
4. `out/extension.js` 파일이 생성됐는지 확인.
5. `out/extension.js`를 직접 `node -e "require('./out/extension.js')"` 로 실행 — 오류 없이 로드되는지 확인. (vscode 의존성으로 인해 예외 발생 가능하지만 import 자체 오류는 없어야 함)
6. 실패 시 `Test Failures`에 기록 후 `DEV_REVISION`.
7. 성공 시: Phase 1 → `DONE`, Phase 2 → `DEV_PENDING`.

### Test Failures
**2026-03-13 [Tester — Fast-track]** - `npm run compile` 성공. `npm run test:harness` **16/16 통과**. 실패 없음. Phase 1 → DONE.

---

## Definition of Done

- [ ] `package.json` VS Code Extension 형식으로 완성
- [ ] 8개 명령어 모두 `contributes.commands`에 등록
- [ ] `src/extension.ts` 컴파일 오류 없음
- [ ] `npm run compile` 성공
- [ ] `npm run test:harness` 성공 (Phase 0 테스트 유지)
- [ ] ADR-0002 작성 완료

---

## State Logs

- **2026-03-13** - Job 01 생성. Architect에 의해 초기화됨.
- **2026-03-13** [Developer] - 구현 완료.
  - `package.json`: VS Code Extension 형식. 10개 명령어, viewsContainers, views, menus, keybindings 등록.
  - `tsconfig.json`: strict: true, target ES2020, outDir ./out.
  - `src/extension.ts`: DiffTreeProvider 인스턴스화, createTreeView, 전체 명령어 subscriptions 등록.
  - `npm run compile` → 오류 없음. `out/extension.js` 생성 확인.
  - `docs/adr/0002-extension-activation-strategy.md` 작성.
- **2026-03-13** [Reviewer — Fast-track] - `engines.vscode ^1.85.0` 확인. 10개 명령어 등록 확인. strict 모드 확인. ADR-0002 존재 확인. 승인.
- **2026-03-13** [Tester — Fast-track] - `npm run compile` 성공. `npm run test:harness` 16/16 통과. Phase 1 → **DONE**, Phase 2 → DEV_PENDING.
