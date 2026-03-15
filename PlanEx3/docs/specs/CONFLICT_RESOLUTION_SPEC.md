# CONFLICT_RESOLUTION_SPEC — 충돌 해결 정책

> **Knowledge 유형**: stable
> **관련 FR**: FR-401 ~ FR-404
> **관련 Job**: JOB-002 Phase 2-4

---

## 충돌 정의

병합 시 두 파일의 동일한 영역이 각기 다르게 변경된 경우 "충돌"이 발생한다.

```
충돌 발생 조건:
  - 두 파일에서 동일한 줄이 서로 다르게 수정됨
  - 한쪽에서 삭제되고 다른 쪽에서 수정됨
```

---

## 충돌 해결 전략

### Strategy 1: Manual (기본)

사용자가 직접 충돌 마커를 편집하여 해결한다.

```
1. 충돌 파일에 마커 삽입
2. 사용자가 에디터에서 직접 편집
3. 마커 제거 후 저장
```

### Strategy 2: Accept Ours (A 선택)

기준 파일(A)의 내용으로 충돌 해결:

```typescript
resolver.resolveConflict(conflict, 'accept_ours')
```

### Strategy 3: Accept Theirs (B 선택)

비교 파일(B)의 내용으로 충돌 해결:

```typescript
resolver.resolveConflict(conflict, 'accept_theirs')
```

---

## 충돌 마커 형식

```
<<<<<<< [파일 A 경로]
[A 의 내용]
=======
[B 의 내용]
>>>>>>> [파일 B 경로]
```

---

## ConflictResolver 인터페이스

```typescript
interface ConflictResolver {
  detectConflicts(diffResult: DiffResult): Conflict[]
  generateConflictMarkers(fileA: string, fileB: string): string
  resolveConflict(
    conflict: Conflict,
    strategy: 'accept_ours' | 'accept_theirs' | 'manual'
  ): Promise<string>
  hasUnresolvedConflicts(content: string): boolean
}

interface Conflict {
  id: string
  startLine: number
  endLine: number
  oursContent: string[]
  theirsContent: string[]
  resolved: boolean
}
```

---

## 충돌 해결 UI 플로우

```
1. MODIFIED 파일 병합 시도
2. 충돌 감지 → 충돌 마커가 포함된 파일 생성
3. 에디터에서 충돌 마커 파일 열기
4. 사용자가 각 충돌 블록에서 선택:
   - "Accept Ours" 버튼
   - "Accept Theirs" 버튼
   - 직접 편집
5. 모든 충돌 해결 확인 (미해결 마커 있으면 경고)
6. 저장
```

---

## 안전 장치

| 상황 | 처리 |
|------|------|
| 미해결 충돌 마커가 있는 파일 저장 시도 | 경고 메시지 + 확인 요청 |
| 충돌 해결 중 파일 변경 감지 | 재계산 또는 경고 |
| 모든 충돌 해결 후 | 충돌 마커 완전 제거 확인 |

---

## 관련 문서

- `specs/FILE_DIFF_SPEC.md`
- `specs/FOLDER_MERGE_SPEC.md`
- `stable/FUNCTIONAL_REQUIREMENTS.md` (FR-4xx)
- `jobs/JOB-002-CORE-ENGINE.md` (Phase 2-4)
