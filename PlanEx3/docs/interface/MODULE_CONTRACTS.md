# MODULE_CONTRACTS — 모듈 간 인터페이스 계약

> **Knowledge 유형**: interface
> **갱신 조건**: 모듈 인터페이스 변경 시 (ARCHITECT 승인 + ADR 필요)
> **목적**: 각 레이어 간 계약을 정의하여 독립적인 구현과 테스트를 보장한다

---

## 레이어 의존성 규칙

```
VS Code Layer
    ↓ (uses)
Application Layer
    ↓ (uses)
Domain Layer
    ↓ (uses interface)
Infrastructure Interface (IFileSystem)
    ↑ (implements)
Infrastructure Implementation (FileSystemService)
```

**규칙**: 화살표 방향으로만 의존한다. 역방향 의존 금지.

---

## Contract 1: IFileSystem

**위치**: `src/infrastructure/interfaces/IFileSystem.ts`
**소유자**: ARCHITECT
**소비자**: Domain Layer (FolderComparator, FolderMerger 등)

```typescript
interface IFileSystem {
  // 파일/디렉토리 목록 조회
  readDirectory(path: string): Promise<[string, FileType][]>

  // 파일 내용 읽기
  readFile(path: string): Promise<Uint8Array>

  // 파일 쓰기
  writeFile(path: string, content: Uint8Array): Promise<void>

  // 파일 복사
  copy(source: string, target: string, overwrite?: boolean): Promise<void>

  // 파일/디렉토리 존재 확인
  exists(path: string): Promise<boolean>

  // 파일 정보 조회
  stat(path: string): Promise<FileStat>

  // 디렉토리 생성
  createDirectory(path: string): Promise<void>
}

interface FileStat {
  type: FileType
  size: number
  mtime: number
  ctime: number
}

enum FileType {
  Unknown = 0,
  File = 1,
  Directory = 2,
  SymbolicLink = 64
}
```

**구현체**:
- `FileSystemService` (src/infrastructure/) — Node.js fs 기반, 프로덕션용
- `MockFileSystem` (test/mocks/) — 인메모리, 테스트용

---

## Contract 2: FolderComparator API

**위치**: `src/domain/comparison/FolderComparator.ts`
**소유자**: IMPLEMENTER (JOB-002)
**소비자**: Application Layer (CompareFolderUseCase)

```typescript
interface IFolderComparator {
  compare(
    folderA: string,
    folderB: string,
    options?: CompareOptions
  ): Promise<CompareResult>
}

interface CompareOptions {
  ignorePatterns?: string[]
  strategy?: ComparisonStrategy
  onProgress?: (progress: CompareProgress) => void
}

interface CompareProgress {
  processed: number
  total: number
  currentPath: string
}
```

---

## Contract 3: CompareFolderUseCase API

**위치**: `src/application/CompareFolderUseCase.ts`
**소유자**: IMPLEMENTER (JOB-003)
**소비자**: VS Code Layer (commands/)

```typescript
class CompareFolderUseCase {
  constructor(
    private comparator: IFolderComparator,
    private fileSystem: IFileSystem
  )

  async execute(
    folderA: string,
    folderB: string,
    options?: CompareOptions
  ): Promise<CompareResult>
}
```

---

## Contract 4: MergeFolderUseCase API

**위치**: `src/application/MergeFolderUseCase.ts`
**소유자**: IMPLEMENTER (JOB-003)
**소비자**: VS Code Layer (commands/)

```typescript
class MergeFolderUseCase {
  constructor(
    private merger: IFolderMerger,
    private fileSystem: IFileSystem
  )

  async execute(
    entries: FileEntry[],
    sourceFolder: string,
    targetFolder: string,
    direction: 'A_TO_B' | 'B_TO_A'
  ): Promise<MergeResult>
}
```

---

## Contract 5: CompareTreeProvider API

**위치**: `src/views/CompareTreeProvider.ts`
**소유자**: IMPLEMENTER (JOB-003)
**소비자**: VS Code (extension.ts)

```typescript
class CompareTreeProvider implements vscode.TreeDataProvider<FileEntry> {
  // CompareResult 로 트리 업데이트
  setResult(result: CompareResult): void

  // 선택된 항목 조회
  getSelectedEntries(): FileEntry[]

  // 트리 새로고침
  refresh(): void
}
```

---

## Contract 변경 절차

1. 변경 필요성 발견 → `working/ACTIVE_ISSUES.md` 에 이슈 등록
2. ARCHITECT 에게 검토 요청
3. 필요 시 ADR 생성
4. 계약 변경 → 이 문서 갱신
5. 소비자 코드 모두 업데이트 (find_referencing_symbols 로 탐색)
6. 단위 테스트 업데이트

---

## 갱신 이력

| 날짜 | 갱신자 | 내용 |
|------|--------|------|
| 2026-03-15 | ARCHITECT | 초안 작성 |
