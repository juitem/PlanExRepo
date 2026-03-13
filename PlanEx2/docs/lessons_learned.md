# Lessons Learned & Absolute Rules

> **Agent Instruction:** 세션 시작 시 이 파일을 반드시 읽으세요. 이 파일의 규칙들은 이전 에이전트들이 실수를 통해 배운 절대 규칙입니다. 반복하지 마세요.

---

## 규칙 분류 (Quick Reference)

| 분류 | 규칙 | 위반 시 영향 |
|---|---|---|
| **설계 규칙** (아키텍처 붕괴) | RULE-001, RULE-002, RULE-005 | 단위 테스트 불가, 런타임 오류 |
| **구현 규칙** (치명적 런타임 버그) | RULE-006 | TypeScript strict 컴파일 오류 |
| **UX/배포 규칙** (기능 불동작) | RULE-007, RULE-008, RULE-009, RULE-010, RULE-011 | 키보드 단축키/버튼/UI 미동작, 구 명령 ID 충돌 |
| **데이터 안전 규칙** | RULE-003, RULE-004 | 사용자 데이터 손실 |

---

## 절대 규칙 (Absolute Rules — Never Violate)

### [RULE-001] VS Code API는 Extension Host에서만 동작
- **규칙**: `vscode` 모듈은 Node.js 단독 실행 환경에서 import하면 런타임 오류가 발생합니다.
- **적용**: 모든 단위 테스트는 `test/harness/mockVscode.ts`의 Mock을 사용해야 합니다. 비즈니스 로직을 VS Code API 의존성과 반드시 분리하세요.

### [RULE-002] compareEngine/mergeEngine/conflictDetector는 순수 함수로 유지
- **규칙**: `src/compareEngine.ts`, `src/mergeEngine.ts`, `src/conflictDetector.ts`는 `vscode`를 import해서는 안 됩니다.
- **이유**: VS Code API 없이 단위 테스트 가능해야 합니다.

### [RULE-003] 머지 전 반드시 확인 다이얼로그 표시
- **규칙**: 파일 또는 폴더를 Target에 덮어쓰기 전에 반드시 `vscode.window.showWarningMessage()`로 사용자 확인을 받아야 합니다.
- **이유**: 실수로 인한 데이터 손실을 방지합니다.

### [RULE-004] CONFLICT 파일은 자동 머지 금지
- **규칙**: `CONFLICT` 상태로 마킹된 파일은 "Merge" 명령 실행 시 오류 메시지를 보여주고 동작을 거부해야 합니다.
- **이유**: 양측 변경사항을 모두 덮어쓰는 데이터 손실을 방지합니다.

### [RULE-005] TypeScript strict 모드 유지
- **규칙**: `tsconfig.json`의 `"strict": true`를 절대 제거하거나 완화하지 마세요.
- **이유**: 런타임 null 오류와 타입 불안전 코드를 방지합니다.

---

## 알려진 실수 패턴 (Known Anti-Patterns)

### [RULE-006] async 함수 반환값을 await 없이 조건식에 사용하지 마세요 — Phase 2에서 발생
- **실수**: `fsAdapter.exists(path)` 반환값(`Promise<boolean>`)을 삼항 연산자 `? :` 조건에 직접 사용.
- **문제**: TypeScript strict 모드에서 `"This condition will always return true since this 'Promise<boolean>' is always defined"` 오류 발생. Promise 객체는 항상 truthy.
- **올바른 방법**:
  ```typescript
  // ❌ 틀린 방법
  const entries = fsAdapter.exists(dir) ? await readDir(dir) : [];
  // ✅ 올바른 방법
  const exists = await fsAdapter.exists(dir);
  const entries = exists ? await readDir(dir) : [];
  ```
- **언제 적용**: async 함수 반환값을 조건식에 사용할 때 항상 먼저 await.

### [RULE-007] setContext 없이 keybinding when 조건을 사용하지 마세요 — Post-release 발견
- **실수**: `package.json` keybinding의 `"when": "planex2Active"` 조건을 사용했지만, 코드에서 `setContext('planex2Active', true)`를 단 한 번도 호출하지 않음.
- **문제**: 키보드 단축키가 전혀 동작하지 않음.
- **올바른 방법**: 커스텀 컨텍스트 키를 사용할 때는 반드시 활성화 시점에 `vscode.commands.executeCommand('setContext', 'myKey', value)` 호출.
- **언제 적용**: `package.json`에 커스텀 `when` 조건을 추가할 때마다.

### [RULE-008] view/title 명령에는 반드시 icon을 지정하세요 — Post-release 발견
- **실수**: `view/title` 메뉴에 `planex2.compareFolders`를 등록했지만 `"icon"` 필드 없음.
- **문제**: VS Code는 icon 없는 명령을 툴바에 표시하지 않고 `...` 오버플로 메뉴로 이동시킴. 사용자가 버튼을 찾을 수 없음.
- **올바른 방법**: `contributes.commands`에서 해당 명령에 `"icon": "$(icon-id)"` 필드 추가.
- **언제 적용**: `view/title` 또는 `editor/title`에 명령을 등록할 때.

### [RULE-009] 빈 TreeView에는 반드시 viewsWelcome을 등록하세요 — Post-release 발견
- **실수**: TreeView가 비어 있을 때 아무것도 표시되지 않아 사용자가 시작 방법을 알 수 없음.
- **올바른 방법**: `contributes.viewsWelcome`에 안내 문구와 버튼 링크 등록:
  ```json
  { "view": "myView", "contents": "설명\n\n[$(icon) 시작하기](command:my.command)" }
  ```
- **언제 적용**: 새로운 TreeView를 추가할 때.

### [RULE-010] showOpenDialog로 폴더 선택은 macOS에서 직관적이지 않습니다 — Post-release 발견
- **실수**: `showOpenDialog({ canSelectFolders: true, canSelectFiles: false })`를 폴더 선택 UI로 사용.
- **문제**: macOS에서 폴더 더블클릭 시 탐색(navigate)이 되어 사용자가 선택 방법을 모름. "폴더를 선택하는 기능이 안 보인다"는 피드백 발생.
- **올바른 방법**: QuickPick + 워크스페이스 폴더 목록 + 최근 사용 + Browse 옵션 조합 사용 (`src/commands/compareFolders.ts`의 `pickFolder()` 참조).
- **언제 적용**: 사용자에게 디렉토리 경로를 입력받을 때.

---

### [RULE-011] VSIX 재설치 시 VS Code 캐시로 인해 이전 명령 ID가 남을 수 있습니다 — Post-release 발견
- **증상**: 새 VSIX를 설치했는데 `"OldCommandId.xxx not found"` 오류 발생.
- **원인**: VS Code가 기존 확장 등록 정보를 캐시하여 구 버전 명령 ID가 남아있음. 단순 재설치(덮어쓰기)로는 해결 안 됨.
- **올바른 방법**: ① 기존 확장 완전 제거(Uninstall) → ② VS Code 재시작 → ③ 새 VSIX 설치.
- **언제 적용**: VSIX를 사용자에게 배포하거나 테스트 설치할 때마다.

---

## 참고 사항 (Notes for Agents)

- `ignore` npm 패키지가 gitignore 패턴 파싱에 사용됩니다. `minimatch`나 직접 정규식 파싱을 시도하지 마세요.
- `vscode.workspace.fs`는 비동기 API입니다. 모든 파일 I/O는 `async/await`로 처리하세요.
- TreeView 노드의 상태 변경 후 반드시 `_onDidChangeTreeData.fire()`를 호출해 UI를 새로고침하세요.
- Module._load 후킹 방식으로 vscode mock을 주입할 때, `after()` 훅에서 반드시 원래 `_load`를 복구하세요.
- `treeView.title`과 `treeView.description`은 런타임에 직접 할당 가능합니다 (`vscode.TreeView` 속성).
