# FOLDER_MERGE_SPEC — 폴더 병합 전략 명세

> **Knowledge 유형**: stable
> **관련 FR**: FR-201 ~ FR-207
> **관련 Job**: JOB-002 Phase 2-3

---

## 병합 유형

### Type 1: 단방향 파일 복사 (Primary)

한 폴더에서 다른 폴더로 파일을 복사한다. 기존 파일을 덮어쓴다.

```
FolderMerger.copyFiles(
  sourceFolder: string,
  targetFolder: string,
  selectedEntries: FileEntry[],
  direction: 'A_TO_B' | 'B_TO_A'
): Promise<MergeResult>
```

### Type 2: 선택적 병합 (Secondary)

사용자가 선택한 파일만 복사한다.

---

## 병합 알고리즘

```
FOR EACH selected entry:
  IF entry.type == 'directory':
    → 대상 디렉토리 생성 (없으면)
    → 하위 파일 재귀 복사
  IF entry.type == 'file':
    → Atomic 복사 수행

Atomic 복사:
  1. 대상 경로의 중간 디렉토리 생성 (없으면)
  2. 임시 파일에 먼저 복사 (target.tmp)
  3. 복사 완료 확인 (체크섬)
  4. 임시 파일 → 최종 파일로 이름 변경
  5. 실패 시: 임시 파일 삭제, 원본 보존
```

---

## Atomic 복사 보장

원본 무결성 보장이 핵심:

```
- 복사 중 실패 시 대상 파일만 오염, 원본 무변
- 임시 파일 패턴: <filename>.planex3tmp
- 복사 완료 후 체크섬 검증 (선택적, 설정으로 제어)
```

---

## 충돌 처리 정책

| 상황 | 기본 동작 |
|------|-----------|
| 대상 파일 없음 | 복사 진행 |
| 대상 파일 있음 (MODIFIED) | 확인 다이얼로그 → 사용자 선택 |
| 대상 파일 있음 (SAME) | SKIP (불필요한 쓰기 방지) |
| 대상 경로에 디렉토리 있음 | 오류 반환 |

---

## 확인 다이얼로그 명세

복사 실행 전 사용자에게 확인:

```
제목: "Confirm Copy"
내용:
  "다음 파일들을 복사합니다:"
  - [파일 목록 (최대 10개 표시, 초과 시 "...외 N개")]
  버튼: [복사] [취소]
```

---

## MergeResult 데이터 모델

```typescript
interface MergeResult {
  sourceFolder: string
  targetFolder: string
  direction: 'A_TO_B' | 'B_TO_A'
  results: FileCopyResult[]
  summary: {
    total: number
    succeeded: number
    failed: number
    skipped: number
  }
  completedAt: Date
}

interface FileCopyResult {
  entry: FileEntry
  status: 'SUCCEEDED' | 'FAILED' | 'SKIPPED'
  error?: string
}
```

---

## 에러 처리

| 상황 | 처리 방법 |
|------|-----------|
| 디스크 공간 부족 | 즉시 중단, 완료된 파일은 유지, 오류 보고 |
| 권한 오류 | 해당 파일 FAILED, 나머지 계속 |
| 원본 파일 사라짐 | 해당 파일 FAILED, 나머지 계속 |
| 대상 경로 충돌 (파일↔디렉토리) | 즉시 오류, 해당 항목 SKIPPED |

---

## 관련 문서

- `specs/CONFLICT_RESOLUTION_SPEC.md`
- `stable/FUNCTIONAL_REQUIREMENTS.md` (FR-2xx)
- `jobs/JOB-002-CORE-ENGINE.md` (Phase 2-3)
