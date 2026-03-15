# FOLDER_COMPARISON_SPEC — 폴더 비교 전략 명세

> **Knowledge 유형**: stable
> **관련 FR**: FR-101 ~ FR-108, FR-501 ~ FR-505
> **관련 Job**: JOB-002 Phase 2-1

---

## 비교 알고리즘 개요

두 폴더 `A` (기준)와 `B` (비교 대상)를 비교하여 각 파일/디렉토리의 상태를 결정한다.

```
FolderComparator.compare(folderA: string, folderB: string): Promise<CompareResult>
```

---

## 파일 상태 정의

| 상태 | 의미 | 조건 |
|------|------|------|
| `ADDED` | B에만 있음 | A에 없고 B에 있는 파일/디렉토리 |
| `DELETED` | A에만 있음 | A에 있고 B에 없는 파일/디렉토리 |
| `MODIFIED` | 양쪽에 있으나 다름 | 양쪽에 있고 내용/크기/해시가 다름 |
| `SAME` | 동일 | 양쪽에 있고 동일한 것으로 판단됨 |

---

## 비교 전략 (ComparisonStrategy)

### 기본 전략 (DefaultComparisonStrategy)

파일 동일 여부 판단 순서:
```
1. 파일 크기 비교 (빠름) → 다르면 MODIFIED
2. 수정 시간 비교 (선택적, 설정으로 제어)
3. 해시 비교 (느리지만 정확) → 크기가 같을 때 사용
```

### 해시 기반 전략 (HashComparisonStrategy)

```
- MD5 또는 SHA-256 해시 사용
- 대용량 파일: 스트리밍 해시 (메모리 효율)
- 정확하지만 느림 (설정으로 선택 가능)
```

---

## 재귀 순회 알고리즘

```typescript
// 의사 코드
async function compareRecursive(
  pathA: string,
  pathB: string,
  ignorePatterns: string[]
): Promise<FileEntry[]> {

  const entriesA = await listDirectory(pathA)
  const entriesB = await listDirectory(pathB)

  const allNames = union(names(entriesA), names(entriesB))

  for (const name of allNames) {
    if (shouldIgnore(name, ignorePatterns)) continue

    const a = find(entriesA, name)
    const b = find(entriesB, name)

    if (!a && b)  → ADDED
    if (a && !b)  → DELETED
    if (a && b) {
      if (isDirectory(a) && isDirectory(b))
        → recurse into subdirectory
      else
        → compare file content → MODIFIED or SAME
    }
  }
}
```

---

## 성능 요구사항

| 지표 | 기준 |
|------|------|
| 10,000 파일 비교 | 5초 이내 |
| 메모리 사용 | 200MB 이하 |
| 대용량 파일 (100MB+) | 스트리밍으로 처리 |

### 성능 최적화 전략

1. **비동기 I/O**: 모든 파일 시스템 접근은 `async/await`
2. **병렬 처리**: `Promise.all()` 로 디렉토리 내 파일 병렬 처리
3. **조기 종료**: 크기가 다르면 해시 계산 스킵
4. **스트리밍 해시**: 대용량 파일은 스트림으로 해시 계산
5. **진행 보고**: `onProgress` 콜백으로 UI 업데이트

---

## 무시 패턴 처리

```
- 기본 무시: ["node_modules", ".git", ".DS_Store"]
- 설정 가능: VS Code 설정 `planex3.ignorePatterns`
- 형식: glob 패턴 (minimatch 라이브러리 사용 검토)
```

---

## CompareResult 데이터 모델

```typescript
interface CompareResult {
  folderA: string          // 기준 폴더 경로
  folderB: string          // 비교 대상 폴더 경로
  entries: FileEntry[]     // 비교 결과 항목들
  summary: {
    total: number
    added: number
    deleted: number
    modified: number
    same: number
  }
  completedAt: Date
}

interface FileEntry {
  name: string
  relativePath: string     // 폴더 루트 기준 상대 경로
  status: 'ADDED' | 'DELETED' | 'MODIFIED' | 'SAME'
  type: 'file' | 'directory'
  children?: FileEntry[]   // 디렉토리인 경우
  sizeA?: number
  sizeB?: number
  modifiedA?: Date
  modifiedB?: Date
}
```

---

## 에러 처리

| 상황 | 처리 방법 |
|------|-----------|
| 권한 없는 파일 | 해당 파일을 `ERROR` 상태로 표시, 나머지 계속 |
| 심볼릭 링크 | 링크 자체를 비교 (링크 대상 내용 비교 금지) |
| 특수 파일 (소켓, 파이프) | SKIP, 사용자에게 알림 |
| 폴더 경로 없음 | 즉시 오류 반환 |

---

## 관련 문서

- `stable/FUNCTIONAL_REQUIREMENTS.md` (FR-101~108)
- `stable/NONFUNCTIONAL_REQUIREMENTS.md` (NFR-101~105)
- `jobs/JOB-002-CORE-ENGINE.md` (Phase 2-1)
- `interface/MODULE_CONTRACTS.md`
