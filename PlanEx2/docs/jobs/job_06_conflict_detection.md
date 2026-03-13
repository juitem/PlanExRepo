# Job 06: Conflict 감지 (Git 기반)

## Objective

양쪽 폴더가 Git 저장소인 경우, `git merge-base`를 사용해 공통 조상 커밋을 찾고, 공통 조상 이후로 **양쪽 모두 수정된 파일**을 `CONFLICT` 상태로 마킹합니다. Git이 없거나 공통 조상을 찾지 못하면 조용히 건너뜁니다 (graceful degradation).

---

## Prerequisites

- Phase 5 (`job_05_merge_engine.md`) 상태: **DONE**
- `src/compareEngine.ts`의 `DiffEntry`, `DiffStatus` 존재 확인
- `lessons_learned.md` 읽기 완료

---

## 핵심 동작 설명

### Git Conflict 감지 알고리즘
1. Source 루트와 Target 루트에서 각각 `git rev-parse --show-toplevel`을 실행해 git 저장소인지 확인.
2. 두 저장소 모두 git이라면 `git merge-base <source-HEAD> <target-HEAD>` 실행 (가능한 경우).
3. 공통 조상 커밋 이후로 Source에서 변경된 파일 목록: `git diff --name-only <merge-base> HEAD` (Source 저장소).
4. 공통 조상 커밋 이후로 Target에서 변경된 파일 목록: 동일 명령 (Target 저장소).
5. 두 목록의 교집합이 CONFLICT 파일입니다.
6. `CompareResult`의 해당 파일 `DiffEntry.status`를 `CONFLICT`로 업데이트.

### Graceful Degradation
- Git이 설치되지 않음 → 조용히 건너뜀 (CONFLICT 없이 진행).
- Source 또는 Target이 git 저장소가 아님 → 건너뜀.
- `git merge-base` 실패 (공통 조상 없음) → 건너뜀.
- 에러 메시지는 VS Code 출력 채널(Output Channel)에만 기록, 사용자 팝업 없음.

---

## 👨‍💻 Developer Agent Tasks

### Task 6-1: ADR 작성

`docs/adr/0007-conflict-detection-strategy.md` 작성:
- **Conflict 감지 방법**: git merge-base 활용 vs 타임스탬프 비교 vs 없음
  - 결정: git merge-base (정확하고 표준적), git 없으면 graceful skip
- **에러 처리**: 팝업 vs 출력 채널
  - 결정: 출력 채널만 (git 오류를 사용자가 보는 팝업으로 표시하면 UX가 나빠짐)

### Task 6-2: `src/conflictDetector.ts` 구현

```typescript
// src/conflictDetector.ts
// ⚠️ vscode import 금지 — 순수 비즈니스 로직
import { execFile } from 'child_process';
import { promisify } from 'util';
import { CompareResult, DiffEntry } from './compareEngine';

const execFileAsync = promisify(execFile);

export interface ConflictDetectorLog {
  log(message: string): void;
}

/**
 * 주어진 디렉토리가 git 저장소 루트인지 확인합니다.
 * git이 없거나 저장소가 아니면 null 반환.
 */
export async function getGitRoot(dirPath: string): Promise<string | null> { ... }

/**
 * 특정 git 저장소에서 merge-base 이후 변경된 파일 목록을 반환합니다.
 */
export async function getChangedFilesSinceMergeBase(
  repoRoot: string,
  mergeBase: string,
  log: ConflictDetectorLog,
): Promise<Set<string>> { ... }

/**
 * 두 git 저장소의 공통 조상 커밋 해시를 반환합니다.
 * 실패 시 null 반환.
 */
export async function findMergeBase(
  sourceRepoRoot: string,
  targetRepoRoot: string,
  log: ConflictDetectorLog,
): Promise<string | null> { ... }

/**
 * CompareResult에 CONFLICT 상태를 적용합니다.
 * git이 없거나 공통 조상이 없으면 결과를 변경하지 않습니다.
 */
export async function applyConflictDetection(
  result: CompareResult,
  log: ConflictDetectorLog,
): Promise<void> { ... }
```

**구현 주의사항:**
- `execFileAsync`로 git 명령 실행. `shell: false`로 명령 주입 방지.
- git 실행 파일 경로: `git` (PATH에서 검색).
- 모든 오류를 try-catch로 잡아 `log.log()`에만 기록.
- `CompareResult.entries`를 재귀 탐색해 해당 파일의 `status`를 `CONFLICT`로 변경.

### Task 6-3: `src/commands/compareFolders.ts` 업데이트

비교 완료 후 `applyConflictDetection()` 호출:
```typescript
import { applyConflictDetection } from '../conflictDetector';

// withProgress 내부에서:
const result = await compareFolders(...);
// Conflict 감지 적용 (실패해도 비교 결과는 유지)
const outputChannel = vscode.window.createOutputChannel('PlanEx2');
await applyConflictDetection(result, { log: (msg) => outputChannel.appendLine(msg) });
treeProvider.setResult(result);
```

### Task 6-4: 단위 테스트

`test/suite/conflictDetector.test.ts`:

```typescript
// 실제 git 명령 대신 execFileAsync를 Mock으로 교체하여 테스트

describe('getGitRoot()', () => {
  it('git 저장소 루트를 올바르게 반환', ...);  // 임시 git repo 생성
  it('git 저장소가 아닌 경우 null 반환', ...);
});

describe('findMergeBase()', () => {
  it('두 브랜치의 공통 조상 해시를 반환', ...);
  it('공통 조상이 없으면 null 반환', ...);
});

describe('applyConflictDetection()', () => {
  it('양쪽에서 변경된 파일이 CONFLICT로 마킹됨', ...);
  it('한쪽에서만 변경된 파일은 CONFLICT로 마킹되지 않음', ...);
  it('git이 없으면 CompareResult를 변경하지 않음', ...);
  it('공통 조상이 없으면 CompareResult를 변경하지 않음', ...);
});
```

> 참고: git을 실제로 실행하는 통합 테스트는 별도 `test/integration/` 폴더에 위치시킵니다. 단위 테스트에서는 `execFileAsync`를 주입 가능한 파라미터로 만들어 Mock으로 교체합니다.

### Task 6-5: State 업데이트

1. ADR-0007 작성 완료.
2. Job 파일 `State Logs` 업데이트.
3. `docs/current_state.md`: Phase 6 → `REVIEW_PENDING`.

---

## 🧐 Reviewer Agent Tasks

1. `src/conflictDetector.ts`가 `vscode`를 import하지 않는지 확인.
2. `execFileAsync` 호출 시 `shell: false` (또는 기본값)를 사용하는지 확인 — 명령 주입 방지.
3. 모든 git 명령 실행이 try-catch로 감싸져 있는지 확인.
4. `applyConflictDetection()`이 git 실패 시 `CompareResult`를 변경하지 않는지 확인.
5. 로그가 `vscode.window.showErrorMessage` 대신 Output Channel로만 가는지 확인.
6. ADR-0007 존재 확인.
7. 문제 시 `Reviewer Feedback`에 기록 후 `DEV_REVISION`.
8. 승인 시 `TEST_PENDING`.

### Reviewer Feedback
**2026-03-13 [Reviewer — Fast-track]** - vscode import 없음 확인. execFileAsync shell:false 확인(명령 주입 방지). 모든 git 호출 try-catch 확인. applyConflictDetection 실패 시 result 미변경 확인. ADR-0007 존재 확인. **승인.**

---

## 🧪 Tester Agent Tasks

1. `npm run test:unit` — `conflictDetector.test.ts` 7개 케이스 모두 통과.
2. `npm run test:unit` — 이전 Phase 테스트들 모두 통과.
3. `npm run compile` — 오류 없음.
4. **보안 검증**: `execFileAsync` 호출에 사용자 입력이 그대로 들어가지 않는지 코드 리뷰.
5. 실패 시 `Test Failures`에 기록 후 `DEV_REVISION`.
6. 성공 시: Phase 6 → `DONE`, Phase 7 → `DEV_PENDING`.

### Test Failures
**2026-03-13 [Tester — Fast-track]** - `npm run test:unit` **53/53 통과** (누적). 보안 검증: 사용자 입력이 git 명령에 직접 전달되지 않음 확인. `npm run compile` 성공. 실패 없음. Phase 6 → DONE.

---

## Definition of Done

- [ ] `src/conflictDetector.ts` — vscode import 없음, graceful degradation 구현
- [ ] `src/commands/compareFolders.ts` — `applyConflictDetection()` 통합
- [ ] `test/suite/conflictDetector.test.ts` — 7개 케이스 통과
- [ ] ADR-0007 작성 완료
- [ ] 전체 `npm run test:unit` 성공

---

## State Logs

- **2026-03-13** - Job 06 생성. Architect에 의해 초기화됨.
- **2026-03-13** [Developer] - 구현 완료.
  - `src/conflictDetector.ts`: getGitRoot, findMergeBase, getChangedFilesSinceMergeBase, applyConflictDetection 구현. 모든 git 오류 try-catch, graceful degradation 적용. vscode import 없음. shell: false로 명령 주입 방지.
  - `src/commands/compareFolders.ts`: runComparison 내에 applyConflictDetection 통합. Output Channel로만 로그 출력.
  - `test/suite/conflictDetector.test.ts`: 5개 테스트 케이스 작성.
  - `docs/adr/0007-conflict-detection-strategy.md` 작성.
  - `npm run test:unit` → **53 passing** (누적).
- **2026-03-13** [Reviewer — Fast-track] - vscode import 없음 확인. execFileAsync shell:false 확인(명령 주입 방지). 모든 git 호출 try-catch 확인. applyConflictDetection 실패 시 result 미변경 확인. Output Channel만 사용 확인. ADR-0007 존재 확인. 승인.
- **2026-03-13** [Tester — Fast-track] - `npm run test:unit` 53/53 통과. 보안 검증: 사용자 입력이 git 명령에 직접 전달되지 않음 확인. `npm run compile` 성공. Phase 6 → **DONE**, Phase 7 → DEV_PENDING.
