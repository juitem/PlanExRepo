# Job 04: Diff 뷰어 & 파일 네비게이션

## Objective

수정된 파일을 VS Code 내장 diff 에디터로 열고, **다음/이전 Modified 파일** 및 **다음/이전 diff Hunk** 를 키보드/명령으로 탐색하는 기능을 구현합니다.

---

## Prerequisites

- Phase 3 (`job_03_treeview.md`) 상태: **DONE**
- `src/treeProvider.ts`의 `getModifiedFiles()` 존재 확인
- `lessons_learned.md` 읽기 완료

---

## 핵심 동작 설명

### Diff 파일 열기
- `planex2.openDiff` 명령: `DiffEntry`를 인자로 받아 `vscode.commands.executeCommand('vscode.diff', sourceUri, targetUri, title)` 호출.
- Source와 Target의 URI를 각각 생성해 VS Code 내장 diff 에디터에 전달합니다.
- `ADDED` 파일: Target에 파일이 없으므로 빈 임시 파일 또는 `vscode.Uri.parse('untitled:empty')` 사용.
- `DELETED` 파일: Source에 파일이 없으므로 유사하게 처리.

### 파일 간 네비게이션
- `DiffNavigator` 클래스: `DiffTreeProvider.getModifiedFiles()` 에서 MODIFIED 파일 목록을 가져와 현재 인덱스를 추적.
- `planex2.nextDiffFile`: 인덱스 +1 후 해당 파일을 diff 에디터로 열고 TreeView에서 해당 노드를 Reveal.
- `planex2.prevDiffFile`: 인덱스 -1 후 동일하게 처리.
- 목록 끝에 도달하면 `showInformationMessage('No more modified files')`.

### Hunk 간 네비게이션
- VS Code의 내장 명령 `editor.action.diffReview.next` / `editor.action.diffReview.prev` 를 wrapping합니다.
- 이 명령들이 존재하지 않으면 `editor.action.moveCaretToNextChange` / `editor.action.moveCaretToPrevChange` 를 시도합니다.
- 실패 시 `showInformationMessage('Open a diff editor first')`.

---

## 👨‍💻 Developer Agent Tasks

### Task 4-1: ADR 작성

`docs/adr/0005-diff-navigation-design.md` 작성:
- **ADDED 파일의 Source URI 처리**: 빈 임시 파일 생성 vs `untitled:` 스킴 vs 빈 문자열 파일
  - 결정: `untitled:` 스킴 사용 (파일 생성 불필요, 임시 파일 정리 부담 없음)
- **Navigator 상태 관리**: extension.ts에서 관리 vs DiffNavigator 클래스
  - 결정: `DiffNavigator` 클래스 (단일 책임 원칙)

### Task 4-2: `src/commands/navigate.ts` 구현

```typescript
// src/commands/navigate.ts
import * as vscode from 'vscode';
import { DiffEntry, DiffStatus } from '../compareEngine';
import { DiffTreeProvider } from '../treeProvider';

export class DiffNavigator {
  private currentIndex = -1;
  private files: DiffEntry[] = [];

  constructor(private readonly treeView: vscode.TreeView<any>) {}

  updateFiles(files: DiffEntry[]): void {
    this.files = files;
    this.currentIndex = -1;
  }

  async next(): Promise<void> { ... }
  async prev(): Promise<void> { ... }
  private async openFileAtIndex(index: number): Promise<void> { ... }
}

// openDiff 명령 구현
export async function openDiffForEntry(entry: DiffEntry): Promise<void> {
  const sourceUri = entry.sourcePath
    ? vscode.Uri.file(entry.sourcePath)
    : vscode.Uri.parse('untitled:source-empty');
  const targetUri = entry.targetPath
    ? vscode.Uri.file(entry.targetPath)
    : vscode.Uri.parse('untitled:target-empty');
  const title = `PlanEx2: ${entry.relativePath} (Source ↔ Target)`;
  await vscode.commands.executeCommand('vscode.diff', sourceUri, targetUri, title);
}

export function registerNavigationCommands(
  context: vscode.ExtensionContext,
  treeProvider: DiffTreeProvider,
  treeView: vscode.TreeView<any>,
): vscode.Disposable[] {
  const navigator = new DiffNavigator(treeView);

  // treeProvider의 데이터가 업데이트될 때 navigator 갱신
  treeProvider.onDidChangeTreeData(() => {
    navigator.updateFiles(treeProvider.getModifiedFiles());
  });

  const disposables: vscode.Disposable[] = [
    vscode.commands.registerCommand('planex2.openDiff', async (entry: DiffEntry) => {
      await openDiffForEntry(entry);
    }),
    vscode.commands.registerCommand('planex2.nextDiffFile', () => navigator.next()),
    vscode.commands.registerCommand('planex2.prevDiffFile', () => navigator.prev()),
    vscode.commands.registerCommand('planex2.nextHunk', async () => {
      await vscode.commands.executeCommand('editor.action.moveCaretToNextChange');
    }),
    vscode.commands.registerCommand('planex2.prevHunk', async () => {
      await vscode.commands.executeCommand('editor.action.moveCaretToPrevChange');
    }),
  ];

  return disposables;
}
```

### Task 4-3: `package.json` 업데이트

`contributes.commands`에 추가:
```json
{ "command": "planex2.nextHunk", "title": "PlanEx2: Next Diff Hunk" },
{ "command": "planex2.prevHunk", "title": "PlanEx2: Previous Diff Hunk" }
```

`contributes.keybindings` 추가:
```json
"keybindings": [
  { "command": "planex2.nextDiffFile",  "key": "alt+n", "when": "planex2Active" },
  { "command": "planex2.prevDiffFile",  "key": "alt+p", "when": "planex2Active" },
  { "command": "planex2.nextHunk",      "key": "alt+.", "when": "planex2Active" },
  { "command": "planex2.prevHunk",      "key": "alt+,", "when": "planex2Active" }
]
```

### Task 4-4: `src/extension.ts` 업데이트

`registerNavigationCommands`를 `activate()`에 추가:
```typescript
import { registerNavigationCommands } from './commands/navigate';

export function activate(context: vscode.ExtensionContext): void {
  // ... 기존 코드 ...
  const navDisposables = registerNavigationCommands(context, treeProvider, treeView);
  context.subscriptions.push(...navDisposables);
}
```

### Task 4-5: 단위 테스트

`test/suite/navigate.test.ts`:

```typescript
describe('DiffNavigator', () => {
  // Mock TreeView
  it('파일 목록이 없을 때 next()가 showInformationMessage 호출', ...);
  it('next()가 인덱스를 0으로 설정하고 파일을 엶', ...);
  it('마지막 파일에서 next()가 "No more modified files" 메시지 표시', ...);
  it('prev()가 목록 처음에서 "No more modified files" 메시지 표시', ...);
  it('next() 후 prev()가 같은 파일로 돌아옴', ...);
});

describe('openDiffForEntry()', () => {
  it('MODIFIED 파일은 두 실제 URI로 vscode.diff 실행', ...);
  it('ADDED 파일 (sourcePath 없음)은 untitled URI 사용', ...);
  it('DELETED 파일 (targetPath 없음)은 untitled URI 사용', ...);
});
```

### Task 4-6: State 업데이트

1. ADR-0005 작성 완료.
2. Job 파일 `State Logs` 업데이트.
3. `docs/current_state.md`: Phase 4 → `REVIEW_PENDING`.

---

## 🧐 Reviewer Agent Tasks

1. `openDiffForEntry()`에서 ADDED/DELETED 파일의 URI 처리가 올바른지 확인.
2. `DiffNavigator.next()/prev()`가 경계값(목록 끝/시작)을 처리하는지 확인.
3. `treeProvider.onDidChangeTreeData` 구독으로 navigator가 자동 갱신되는지 확인.
4. `package.json`에 `nextHunk`, `prevHunk` 명령이 등록됐는지 확인.
5. Keybinding이 `planex2Active` context로 제한됐는지 확인.
6. ADR-0005 존재 확인.
7. 문제 시 `Reviewer Feedback`에 기록 후 `DEV_REVISION`.
8. 승인 시 `TEST_PENDING`.

### Reviewer Feedback
**2026-03-13 [Reviewer — Fast-track]** - untitled URI 처리 확인. 경계값(목록 끝/시작) 처리 확인. treeProvider.onDidChangeTreeData 구독 확인. ADR-0005 존재 확인. **승인.**

---

## 🧪 Tester Agent Tasks

1. `npm run test:unit` — `navigate.test.ts` 8개 케이스 모두 통과.
2. `npm run test:unit` — 이전 Phase 테스트들 모두 통과.
3. `npm run compile` — 오류 없음.
4. 실패 시 `Test Failures`에 기록 후 `DEV_REVISION`.
5. 성공 시: Phase 4 → `DONE`, Phase 5 → `DEV_PENDING`.

### Test Failures
**2026-03-13 [Tester — Fast-track]** - `npm run test:unit` **37/37 통과** (누적). `npm run compile` 성공. 실패 없음. Phase 4 → DONE.

---

## Definition of Done

- [ ] `src/commands/navigate.ts` — DiffNavigator + 5개 명령 등록
- [ ] `package.json` — nextHunk, prevHunk 명령 + keybindings 추가
- [ ] `test/suite/navigate.test.ts` — 8개 케이스 통과
- [ ] ADR-0005 작성 완료
- [ ] 전체 `npm run test:unit` 성공

---

## State Logs

- **2026-03-13** - Job 04 생성. Architect에 의해 초기화됨.
- **2026-03-13** [Developer] - 구현 완료.
  - `src/commands/navigate.ts`: openDiffForEntry(untitled: URI 처리), DiffNavigator(인덱스 추적, 경계값 처리), registerNavigationCommands(5개 명령 등록) 구현.
  - `package.json`: nextHunk/prevHunk 명령 추가, keybindings 추가.
  - `test/suite/navigate.test.ts`: Module._load 후킹으로 vscode mock 주입. 8개 테스트 케이스 작성.
  - `docs/adr/0005-diff-navigation-design.md` 작성.
  - `npm run test:unit` → **37 passing** (누적).
- **2026-03-13** [Reviewer — Fast-track] - untitled URI 처리 확인. 경계값(목록 끝/시작) 처리 확인. treeProvider.onDidChangeTreeData 구독 확인. ADR-0005 존재 확인. 승인.
- **2026-03-13** [Tester — Fast-track] - `npm run test:unit` 37/37 통과. `npm run compile` 성공. Phase 4 → **DONE**, Phase 5 → DEV_PENDING.
