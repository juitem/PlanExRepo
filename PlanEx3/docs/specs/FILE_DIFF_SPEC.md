# FILE_DIFF_SPEC — 파일 단위 비교 및 병합 명세

> **Knowledge 유형**: stable
> **관련 FR**: FR-301 ~ FR-404
> **관련 Job**: JOB-002 Phase 2-2, 2-4

---

## 파일 Diff 개요

두 파일의 내용을 줄 단위로 비교하고 시각화한다.

```
FileComparator.diff(fileA: string, fileB: string): Promise<DiffResult>
```

---

## Diff 알고리즘

### 기본: VS Code 내장 diff 뷰 활용

```
vscode.commands.executeCommand('vscode.diff', uriA, uriB, title)
```

- VS Code 네이티브 diff 에디터 사용
- 별도 diff 알고리즘 구현 불필요
- 장점: 검증된 UI, 익숙한 경험
- 단점: VS Code에 의존, 커스터마이징 제한

### 내부 diff 로직 (파일 동일 여부 판단용)

```typescript
// 파일 비교: 동일한가?
async function isContentEqual(pathA: string, pathB: string): Promise<boolean> {
  // 1. 크기 비교 (빠른 조기 종료)
  const [statA, statB] = await Promise.all([stat(pathA), stat(pathB)])
  if (statA.size !== statB.size) return false

  // 2. 해시 비교
  const [hashA, hashB] = await Promise.all([hash(pathA), hash(pathB)])
  return hashA === hashB
}
```

---

## 이진 파일 처리

```
이진 파일 감지 기준:
  - 파일의 처음 8KB 를 읽어 NULL 바이트 존재 시 이진 파일로 판단
  - 또는: 파일 확장자 기반 판단 (보조 수단)

이진 파일의 경우:
  - diff 뷰 열기 불가
  - TreeView 에서 "Binary file" 표시
  - 크기/수정 시간만 비교 정보로 제공
```

---

## DiffResult 데이터 모델

```typescript
interface DiffResult {
  fileA: string
  fileB: string
  isBinary: boolean
  isEqual: boolean
  hunks?: DiffHunk[]       // 텍스트 파일인 경우
}

interface DiffHunk {
  startLineA: number
  endLineA: number
  startLineB: number
  endLineB: number
  type: 'added' | 'deleted' | 'modified' | 'context'
  linesA: string[]
  linesB: string[]
}
```

---

## 파일 병합 명세 (P1)

### Hunk 단위 선택적 적용

```typescript
FileMerger.applyHunk(
  targetFile: string,
  hunk: DiffHunk,
  direction: 'accept_a' | 'accept_b'
): Promise<void>
```

- diff 뷰에서 개별 변경 블록을 선택적으로 적용
- VS Code 의 inline diff accept 버튼과 유사한 UX

### 충돌 마커 형식

표준 Git 충돌 마커 형식 사용:

```
<<<<<<< A (기준 파일)
[기준 파일 내용]
=======
[비교 파일 내용]
>>>>>>> B (비교 파일)
```

---

## 에러 처리

| 상황 | 처리 방법 |
|------|-----------|
| 파일 없음 | 오류 반환 (diff 불가) |
| 이진 파일 | "Binary file" 표시, diff 불가 메시지 |
| 인코딩 불일치 | UTF-8로 변환 시도, 실패 시 이진으로 처리 |
| 10MB 이상 파일 | 경고 표시 후 사용자 확인 후 진행 |

---

## 관련 문서

- `specs/CONFLICT_RESOLUTION_SPEC.md`
- `stable/FUNCTIONAL_REQUIREMENTS.md` (FR-3xx, FR-4xx)
- `jobs/JOB-002-CORE-ENGINE.md` (Phase 2-2, 2-4)
