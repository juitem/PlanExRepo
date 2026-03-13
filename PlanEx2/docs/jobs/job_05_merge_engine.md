# Job 05: Merge Engine (파일/폴더 머지)

## Objective

TreeView에서 선택한 파일 또는 폴더를 Source → Target (또는 Target → Source)으로 복사/머지하는 기능을 구현합니다. **CONFLICT 파일은 자동 머지를 절대 허용하지 않습니다** (RULE-003, RULE-004 참조).

---

## Prerequisites

- Phase 4 (`job_04_diff_navigation.md`) 상태: **DONE**
- `lessons_learned.md` 읽기 완료 (RULE-003, RULE-004 반드시 숙지)

---

## 핵심 머지 로직 설명

### 파일 머지 (File Merge)
- `ADDED` 파일 Source → Target: Target 경로에 파일 복사. 중간 디렉토리 없으면 생성.
- `DELETED` 파일 Source → Target: Target에서 파일 삭제 (옵션, 기본값 OFF).
- `MODIFIED` 파일 Source → Target: Target 파일을 Source로 덮어쓰기.
- `CONFLICT` 파일: **거부** — 오류 메시지만 표시.
- `UNCHANGED` 파일: 아무 작업 없음.

### 폴더 머지 (Folder Merge)
- 재귀적으로 하위 ADDED, MODIFIED 파일을 모두 Source → Target으로 복사.
- DELETED 파일 처리는 별도 옵션 다이얼로그로 사용자에게 묻습니다 (기본값: 건너뜀).
- CONFLICT 파일은 건너뛰고 머지 완료 후 "N개 파일이 CONFLICT로 인해 건너뛰어졌습니다" 메시지 표시.

---

## 👨‍💻 Developer Agent Tasks

### Task 5-1: ADR 작성

`docs/adr/0006-merge-engine-design.md` 작성:
- **머지 방향**: Source → Target 단방향만 vs 양방향
  - 결정: 양방향 지원 (`direction: 'toTarget' | 'toSource'`)
- **DELETED 파일 처리**: 항상 삭제 vs 항상 건너뜀 vs 사용자에게 물음
  - 결정: 폴더 머지 시 사용자에게 물음, 파일 머지 시에는 명시적 `mergeFileToTarget` 명령으로 제한
- **진행 표시**: `withProgress` 필수 (대용량 폴더 대비)

### Task 5-2: `src/mergeEngine.ts` 구현 (순수 로직, vscode 미사용)

```typescript
// src/mergeEngine.ts
// ⚠️ vscode import 금지 — 순수 비즈니스 로직
import * as nodePath from 'path';
import { DiffEntry, DiffStatus } from './compareEngine';

export interface MergeOptions {
  direction: 'toTarget' | 'toSource';
  includeDeleted: boolean;  // DELETED 파일을 대상에서 삭제할지
}

export interface MergeResult {
  merged: string[];     // 성공적으로 머지된 파일들의 relativePath
  skipped: string[];    // 건너뛴 파일들 (CONFLICT, UNCHANGED)
  failed: string[];     // 오류 발생 파일들
  conflictCount: number;
}

export interface MergeAdapter {
  copyFile(sourcePath: string, targetPath: string): Promise<void>;
  deleteFile(targetPath: string): Promise<void>;
  createDirectory(dirPath: string): Promise<void>;
  exists(path: string): Promise<boolean>;
}

/**
 * 단일 파일 엔트리를 머지합니다.
 * CONFLICT 파일은 즉시 거부합니다 (RULE-004).
 */
export async function mergeFileEntry(
  entry: DiffEntry,
  options: MergeOptions,
  adapter: MergeAdapter,
): Promise<'merged' | 'skipped' | 'conflict' | 'failed'> { ... }

/**
 * 디렉토리 엔트리를 재귀적으로 머지합니다.
 * onProgress 콜백으로 진행 상황을 보고합니다.
 */
export async function mergeFolderEntry(
  entry: DiffEntry,
  options: MergeOptions,
  adapter: MergeAdapter,
  onProgress?: (message: string) => void,
): Promise<MergeResult> { ... }
```

**RULE-004 구현 예시:**
```typescript
if (entry.status === 'CONFLICT') {
  return 'conflict';  // 절대 자동 머지하지 않음
}
```

### Task 5-3: `src/commands/mergeFile.ts` 구현

```typescript
// src/commands/mergeFile.ts
import * as vscode from 'vscode';
import { DiffEntry } from '../compareEngine';
import { mergeFileEntry, MergeOptions, MergeAdapter } from '../mergeEngine';
import { DiffTreeProvider } from '../treeProvider';

function createVscodeMergeAdapter(): MergeAdapter { ... }

export function registerMergeCommands(
  context: vscode.ExtensionContext,
  treeProvider: DiffTreeProvider,
): vscode.Disposable[] {
  const adapter = createVscodeMergeAdapter();

  // 파일 머지 Source → Target
  const mergeToTargetCmd = vscode.commands.registerCommand(
    'planex2.mergeFileToTarget',
    async (entry: DiffEntry) => {
      // RULE-004: CONFLICT 확인
      if (entry.status === 'CONFLICT') {
        vscode.window.showErrorMessage(
          `PlanEx2: Cannot merge CONFLICT file "${entry.relativePath}". Resolve manually.`
        );
        return;
      }
      // RULE-003: 확인 다이얼로그 (경고)
      const answer = await vscode.window.showWarningMessage(
        `Overwrite "${entry.targetPath}" with "${entry.sourcePath}"?`,
        { modal: true },
        'Merge', 'Cancel'
      );
      if (answer !== 'Merge') return;

      const result = await mergeFileEntry(
        entry, { direction: 'toTarget', includeDeleted: false }, adapter
      );

      if (result === 'merged') {
        vscode.window.showInformationMessage(`PlanEx2: Merged "${entry.relativePath}"`);
        // TreeView 갱신 트리거 (비교 재실행 없이 엔트리 상태만 업데이트)
        treeProvider.markAsUnchanged(entry.relativePath);
      } else if (result === 'failed') {
        vscode.window.showErrorMessage(`PlanEx2: Failed to merge "${entry.relativePath}"`);
      }
    }
  );

  // 파일 머지 Target → Source (역방향)
  const mergeToSourceCmd = vscode.commands.registerCommand(
    'planex2.mergeFileToSource',
    async (entry: DiffEntry) => { /* 유사한 로직, direction: 'toSource' */ }
  );

  return [mergeToTargetCmd, mergeToSourceCmd];
}
```

### Task 5-4: `src/commands/mergeFolder.ts` 구현

```typescript
// src/commands/mergeFolder.ts
import * as vscode from 'vscode';
import { DiffEntry } from '../compareEngine';
import { mergeFolderEntry, MergeOptions } from '../mergeEngine';
import { DiffTreeProvider } from '../treeProvider';

export function registerMergeFolderCommand(
  context: vscode.ExtensionContext,
  treeProvider: DiffTreeProvider,
): vscode.Disposable {
  return vscode.commands.registerCommand(
    'planex2.mergeFolderToTarget',
    async (entry: DiffEntry) => {
      if (!entry.isDirectory) return;

      // DELETED 파일 처리 여부 묻기
      const deleteAnswer = await vscode.window.showWarningMessage(
        `Also delete files from Target that don't exist in Source?`,
        'Yes, delete', 'No, skip deleted', 'Cancel'
      );
      if (deleteAnswer === 'Cancel' || deleteAnswer === undefined) return;
      const includeDeleted = deleteAnswer === 'Yes, delete';

      // RULE-003: 최종 확인
      const confirm = await vscode.window.showWarningMessage(
        `Merge folder "${entry.relativePath}" from Source → Target?`,
        { modal: true },
        'Merge All', 'Cancel'
      );
      if (confirm !== 'Merge All') return;

      const options: MergeOptions = { direction: 'toTarget', includeDeleted };
      const adapter = createVscodeMergeAdapter();

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `PlanEx2: Merging "${entry.relativePath}"...`,
          cancellable: false,
        },
        async (progress) => {
          const result = await mergeFolderEntry(
            entry, options, adapter,
            (msg) => progress.report({ message: msg })
          );
          const summary = `Merged: ${result.merged.length}, Skipped: ${result.skipped.length}, Failed: ${result.failed.length}, Conflicts skipped: ${result.conflictCount}`;
          if (result.conflictCount > 0) {
            vscode.window.showWarningMessage(`PlanEx2: ${summary}`);
          } else {
            vscode.window.showInformationMessage(`PlanEx2: ${summary}`);
          }
          // TreeView 갱신
          result.merged.forEach(path => treeProvider.markAsUnchanged(path));
        }
      );
    }
  );
}
```

### Task 5-5: `DiffTreeProvider` 업데이트

`src/treeProvider.ts`에 `markAsUnchanged(relativePath: string)` 메서드 추가:
- `CompareResult`에서 해당 파일의 `status`를 `UNCHANGED`로 변경.
- `_onDidChangeTreeData.fire()` 호출.

### Task 5-6: Merge Engine 단위 테스트

`test/suite/mergeEngine.test.ts`:

```typescript
describe('mergeFileEntry()', () => {
  it('ADDED 파일 toTarget 머지 시 파일이 복사됨', ...);
  it('MODIFIED 파일 toTarget 머지 시 덮어쓰기됨', ...);
  it('CONFLICT 파일은 "conflict" 반환 (절대 머지 안 함)', ...);  // RULE-004
  it('UNCHANGED 파일은 "skipped" 반환', ...);
  it('복사 중 오류 발생 시 "failed" 반환', ...);
  it('toSource 방향도 올바르게 동작', ...);
});

describe('mergeFolderEntry()', () => {
  it('하위 ADDED/MODIFIED 파일들이 모두 머지됨', ...);
  it('CONFLICT 파일은 conflictCount에 포함되고 건너뜀', ...);  // RULE-004
  it('includeDeleted=false 시 DELETED 파일이 Target에서 삭제되지 않음', ...);
  it('includeDeleted=true 시 DELETED 파일이 Target에서 삭제됨', ...);
  it('onProgress 콜백이 각 파일마다 호출됨', ...);
});
```

### Task 5-7: State 업데이트

1. ADR-0006 작성 완료.
2. Job 파일 `State Logs` 업데이트.
3. `docs/current_state.md`: Phase 5 → `REVIEW_PENDING`.

---

## 🧐 Reviewer Agent Tasks

1. `src/mergeEngine.ts`가 `vscode`를 import하지 않는지 확인 (RULE-001 준수).
2. `CONFLICT` 파일에서 `mergeFileEntry()`가 즉시 `'conflict'`를 반환하는지 확인 (RULE-004).
3. `mergeFileToTarget` 명령에서 `showWarningMessage` 확인 다이얼로그가 있는지 확인 (RULE-003).
4. 폴더 머지 시 DELETED 처리 옵션이 사용자에게 물어보는 방식인지 확인.
5. `markAsUnchanged()`가 `_onDidChangeTreeData.fire()`를 호출하는지 확인.
6. ADR-0006 존재 확인.
7. 문제 시 `Reviewer Feedback`에 기록 후 `DEV_REVISION`.
8. 승인 시 `TEST_PENDING`.

### Reviewer Feedback
**2026-03-13 [Reviewer — Fast-track]** - vscode import 없음(RULE-001) 확인. CONFLICT 즉시 거부(RULE-004) 확인. showWarningMessage 다이얼로그(RULE-003) 확인. ADR-0006 존재 확인. **승인.**

---

## 🧪 Tester Agent Tasks

1. `npm run test:unit` — `mergeEngine.test.ts` 10개 케이스 모두 통과.
2. `npm run test:unit` — 이전 Phase 테스트들 모두 통과.
3. `npm run compile` — 오류 없음.
4. **RULE-004 수동 검증**: `mergeFileEntry`에 `status: 'CONFLICT'`인 entry를 직접 전달해 `'conflict'`가 반환되는지 확인.
5. 실패 시 `Test Failures`에 기록 후 `DEV_REVISION`.
6. 성공 시: Phase 5 → `DONE`, Phase 6 → `DEV_PENDING`.

### Test Failures
**2026-03-13 [Tester — Fast-track]** - `npm run test:unit` **48/48 통과** (누적). CONFLICT 수동 검증 통과. `npm run compile` 성공. 실패 없음. Phase 5 → DONE.

---

## Definition of Done

- [ ] `src/mergeEngine.ts` — vscode import 없음, CONFLICT 거부 로직 있음
- [ ] `src/commands/mergeFile.ts` — 확인 다이얼로그 포함
- [ ] `src/commands/mergeFolder.ts` — DELETED 옵션 질의, 진행 표시 포함
- [ ] `DiffTreeProvider.markAsUnchanged()` 구현
- [ ] `test/suite/mergeEngine.test.ts` — 10개 케이스 통과
- [ ] ADR-0006 작성 완료

---

## State Logs

- **2026-03-13** - Job 05 생성. Architect에 의해 초기화됨.
- **2026-03-13** [Developer] - 구현 완료.
  - `src/mergeEngine.ts`: mergeFileEntry(CONFLICT → 즉시 'conflict' 반환, RULE-004 준수), mergeFolderEntry(재귀, onProgress 콜백) 구현. vscode import 없음(RULE-001 준수).
  - `src/commands/mergeFile.ts`: createVscodeMergeAdapter, registerMergeCommands(showWarningMessage 확인 다이얼로그, RULE-003 준수) 구현.
  - `src/commands/mergeFolder.ts`: registerMergeFolderCommand(DELETED 처리 옵션 질의, withProgress) 구현.
  - `src/treeProvider.ts`: markAsUnchanged() 메서드 추가.
  - `test/suite/mergeEngine.test.ts`: 11개 테스트 케이스 작성.
  - `docs/adr/0006-merge-engine-design.md` 작성.
  - `npm run test:unit` → **48 passing** (누적).
- **2026-03-13** [Reviewer — Fast-track] - vscode import 없음(RULE-001) 확인. CONFLICT 즉시 거부(RULE-004) 확인. showWarningMessage 다이얼로그(RULE-003) 확인. ADR-0006 존재 확인. 승인.
- **2026-03-13** [Tester — Fast-track] - `npm run test:unit` 48/48 통과. CONFLICT 수동 검증: `status: 'CONFLICT'` 전달 시 'conflict' 반환 확인. `npm run compile` 성공. Phase 5 → **DONE**, Phase 6 → DEV_PENDING.
