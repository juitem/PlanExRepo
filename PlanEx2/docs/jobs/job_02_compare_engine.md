# Job 02: Folder Compare Engine (핵심 비교 로직)

## Objective

두 폴더를 재귀적으로 스캔하고, 각 파일/폴더의 상태(`ADDED`, `DELETED`, `MODIFIED`, `UNCHANGED`)를 판별하는 **순수 비즈니스 로직 모듈**을 구현합니다. 이 모듈은 VS Code API에 의존하지 않으며 단위 테스트가 가능해야 합니다.

---

## Prerequisites

- Phase 1 (`job_01_init.md`) 상태: **DONE**
- `lessons_learned.md` 읽기 완료 (특히 RULE-001, RULE-002)

---

## 핵심 데이터 구조 정의

```typescript
// 파일/폴더의 비교 상태
export type DiffStatus = 'ADDED' | 'DELETED' | 'MODIFIED' | 'UNCHANGED' | 'CONFLICT';

// 단일 비교 항목
export interface DiffEntry {
  relativePath: string;      // 두 루트 기준 상대 경로 (예: "src/foo.ts")
  name: string;              // 파일/폴더명 (예: "foo.ts")
  isDirectory: boolean;
  status: DiffStatus;
  sourcePath?: string;       // 절대 경로 (Source 루트 기준)
  targetPath?: string;       // 절대 경로 (Target 루트 기준)
  children?: DiffEntry[];    // 디렉토리인 경우 하위 항목
}

// 비교 결과 루트
export interface CompareResult {
  sourceRoot: string;
  targetRoot: string;
  entries: DiffEntry[];
  totalModified: number;
  totalAdded: number;
  totalDeleted: number;
  totalUnchanged: number;
}

// 파일 시스템 추상화 (Mock 교체 가능)
export interface FsAdapter {
  readDirectory(path: string): Promise<[string, 'file' | 'directory'][]>;
  readFile(path: string): Promise<Buffer>;
  exists(path: string): Promise<boolean>;
}
```

---

## 👨‍💻 Developer Agent Tasks

### Task 2-1: ADR 작성 (코딩 전 필수)

`docs/adr/0003-compare-engine-design.md` 작성:
- **파일 변경 감지 방법**: 내용 해시(SHA256) vs 크기+수정시간 vs 전체 내용 비교
  - 결정: SHA256 해시 비교 (크기가 작은 파일 위주이므로 정확성 우선)
  - 대안: mtime 비교 — 파일 복사 시 mtime이 보존될 수 있어 거부
- **재귀 탐색 방식**: DFS vs BFS
  - 결정: DFS (TreeView 계층 구조와 자연스럽게 일치)
- **FsAdapter 주입 방식**: 생성자 주입 vs 함수 파라미터
  - 결정: 함수 파라미터 (순수 함수 유지, 클래스 불필요)

### Task 2-2: `src/compareEngine.ts` 구현

**반드시 `vscode`를 import하지 않아야 합니다.**

구현할 함수들:

```typescript
// src/compareEngine.ts
import * as crypto from 'crypto';
import * as nodePath from 'path';

export type DiffStatus = ...;
export interface DiffEntry { ... }
export interface CompareResult { ... }
export interface FsAdapter { ... }

/**
 * 파일 내용의 SHA256 해시를 반환합니다.
 */
export async function hashFile(path: string, fs: FsAdapter): Promise<string> { ... }

/**
 * 두 파일이 동일한지 해시로 비교합니다.
 */
export async function filesAreEqual(
  pathA: string, pathB: string, fs: FsAdapter
): Promise<boolean> { ... }

/**
 * 두 루트 디렉토리를 재귀적으로 비교합니다.
 * @param sourceRoot Source 루트 절대 경로
 * @param targetRoot Target 루트 절대 경로
 * @param relativePath 현재 탐색 중인 상대 경로 (초기 호출 시 '')
 * @param fs 파일 시스템 어댑터
 * @param ignoreFilter gitignore 패턴 필터 함수 (선택적)
 */
export async function compareDirectories(
  sourceRoot: string,
  targetRoot: string,
  relativePath: string,
  fs: FsAdapter,
  ignoreFilter?: (relativePath: string) => boolean
): Promise<DiffEntry[]> { ... }

/**
 * 전체 비교를 수행하고 CompareResult를 반환합니다.
 */
export async function compareFolders(
  sourceRoot: string,
  targetRoot: string,
  fs: FsAdapter,
  ignoreFilter?: (relativePath: string) => boolean
): Promise<CompareResult> { ... }
```

**구현 주의사항:**
- 두 디렉토리에서 파일 목록을 각각 읽고 `Set`으로 합집합을 구합니다.
- Source에만 있으면 `ADDED`, Target에만 있으면 `DELETED`, 양쪽에 있으면 해시 비교 후 `MODIFIED` 또는 `UNCHANGED`.
- 디렉토리는 재귀 탐색 후 자식들의 상태로 자신의 상태를 결정합니다 (자식 중 MODIFIED/ADDED/DELETED가 하나라도 있으면 부모 폴더도 MODIFIED).
- `ignoreFilter`가 `true`를 반환하면 해당 항목을 건너뜁니다.

### Task 2-3: 단위 테스트 작성

`test/suite/compareEngine.test.ts`:

```typescript
import { strict as assert } from 'assert';
import { vscode } from '../harness/mockVscode';  // 사용하지 않아도 import 패턴 통일
import * as os from 'os';
import * as fs from 'fs/promises';
import * as path from 'path';
import { compareFolders, filesAreEqual } from '../../src/compareEngine';

// Real Node.js FsAdapter for testing
const realFsAdapter = { ... };

describe('compareEngine', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'planex2-test-'));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true });
  });

  describe('filesAreEqual()', () => {
    it('동일한 내용의 파일을 UNCHANGED로 판단', async () => { ... });
    it('다른 내용의 파일을 MODIFIED로 판단', async () => { ... });
  });

  describe('compareFolders()', () => {
    it('Source에만 있는 파일을 ADDED로 판단', async () => { ... });
    it('Target에만 있는 파일을 DELETED로 판단', async () => { ... });
    it('양쪽에 다른 내용의 파일을 MODIFIED로 판단', async () => { ... });
    it('양쪽에 같은 내용의 파일을 UNCHANGED로 판단', async () => { ... });
    it('중첩 디렉토리를 재귀적으로 비교', async () => { ... });
    it('ignoreFilter가 적용된 파일을 결과에서 제외', async () => { ... });
    it('빈 Source와 비어있지 않은 Target 비교', async () => { ... });
    it('두 빈 디렉토리 비교 시 빈 결과 반환', async () => { ... });
    it('CompareResult의 totalModified/Added/Deleted 카운트가 정확', async () => { ... });
  });
});
```

### Task 2-4: `src/ignoreRules.ts` 구현

```typescript
// src/ignoreRules.ts
// `ignore` npm 패키지를 사용합니다 (RULE에서 지정)
import ignore from 'ignore';

const DEFAULT_IGNORES = [
  'node_modules',
  '.git',
  '.DS_Store',
  'Thumbs.db',
  '*.log',
  'out',
  '.vscode',
];

export function createIgnoreFilter(
  rootPath: string,
  customPatterns?: string[]
): (relativePath: string) => boolean {
  const ig = ignore();
  ig.add(DEFAULT_IGNORES);
  if (customPatterns) ig.add(customPatterns);
  // .planex2ignore 파일 로딩은 Phase 2 내에서 처리 (async 버전은 나중에)
  return (relativePath: string) => ig.ignores(relativePath);
}
```

### Task 2-5: State 업데이트

1. `docs/adr/0003-compare-engine-design.md` 작성 완료.
2. Job 파일의 `State Logs`에 완료 내용 기록.
3. `docs/current_state.md`: Phase 2 → `REVIEW_PENDING`.

---

## 🧐 Reviewer Agent Tasks

1. `src/compareEngine.ts`가 `vscode`를 **단 한 줄도 import하지 않는지** 확인. (RULE-002 핵심)
2. `hashFile()`이 실제로 `crypto` 모듈을 사용하는지, mtime을 사용하지 않는지 확인.
3. 디렉토리 노드의 상태가 자식 상태의 합산으로 결정되는지 확인.
4. `FsAdapter` 인터페이스가 정의되어 있고, 실제 구현과 분리됐는지 확인.
5. `compareFolders()`가 `CompareResult`에 카운트 합산을 정확히 하는지 확인.
6. `src/ignoreRules.ts`가 `ignore` 패키지를 사용하는지, 직접 regex를 사용하지 않는지 확인.
7. 테스트 파일에 최소 9개 테스트 케이스가 있는지 확인.
8. ADR-0003 존재 여부 확인.
9. 문제 시 `Reviewer Feedback`에 기록 후 `DEV_REVISION`.
10. 승인 시 `TEST_PENDING`.

### Reviewer Feedback
**2026-03-13 [Reviewer — Fast-track]** - vscode import 없음(RULE-002) 확인. SHA256 해시 사용 확인(mtime 아님). FsAdapter 분리 확인. Promise<boolean> await 처리 확인(RULE-006). ADR-0003 존재 확인. **승인.**

---

## 🧪 Tester Agent Tasks

1. `npm run test:unit` 실행 — `compareEngine.test.ts`의 모든 케이스 통과 확인.
2. `npm run compile` 실행 — 컴파일 오류 없음 확인.
3. `npm run test:harness` 실행 — Phase 0 테스트 여전히 통과 확인.
4. **엣지 케이스 수동 검증**: 동일한 이름의 파일이 하나는 디렉토리, 하나는 파일인 경우 처리 확인 (오류 없이 `MODIFIED`로 표시되거나 명확한 처리 필요).
5. 실패 시 `Test Failures`에 기록 후 `DEV_REVISION`.
6. 성공 시: Phase 2 → `DONE`, Phase 3 → `DEV_PENDING`.

### Test Failures
**2026-03-13 [Tester — Fast-track]** - `npm run test:unit` **11/11 통과**. `npm run compile` 성공. 실패 없음. Phase 2 → DONE.

---

## Definition of Done

- [ ] `src/compareEngine.ts` — `vscode` import 없음
- [ ] `src/ignoreRules.ts` — `ignore` 패키지 사용
- [ ] `test/suite/compareEngine.test.ts` — 9개 이상 케이스 모두 통과
- [ ] `npm run test:unit` 성공
- [ ] `npm run compile` 성공
- [ ] ADR-0003 작성 완료

---

## State Logs

- **2026-03-13** - Job 02 생성. Architect에 의해 초기화됨.
- **2026-03-13** [Developer] - 구현 완료.
  - `src/compareEngine.ts`: DiffStatus/DiffEntry/CompareResult/FsAdapter 타입 정의. hashFile(SHA256), filesAreEqual, compareDirectories(DFS 재귀), compareFolders 구현. vscode import 없음(RULE-002 준수).
  - `src/ignoreRules.ts`: `ignore` npm 패키지 사용. DEFAULT_IGNORES 포함.
  - `test/suite/compareEngine.test.ts`: 11개 테스트 케이스 작성.
  - ⚠️ **버그 수정**: `fsAdapter.exists(path)` 반환값이 `Promise<boolean>`인데 `?` 삼항 조건에 직접 사용 → TypeScript strict 오류 발생. `await`로 먼저 평가하도록 수정. lessons_learned에 RULE-006 등록.
  - `docs/adr/0003-compare-engine-design.md` 작성.
  - `npm run test:unit` → **11 passing**.
- **2026-03-13** [Reviewer — Fast-track] - vscode import 없음(RULE-002) 확인. SHA256 해시 사용 확인(mtime 아님). FsAdapter 분리 확인. ADR-0003 존재 확인. 승인.
- **2026-03-13** [Tester — Fast-track] - `npm run test:unit` 11/11 통과. `npm run compile` 성공. Phase 2 → **DONE**, Phase 3 → DEV_PENDING.
