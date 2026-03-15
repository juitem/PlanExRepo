# JOB-002 — CORE ENGINE

---

## Job 메타데이터

```yaml
job_id: JOB-002
job_name: Core Engine (비교/병합 핵심 로직)
status: NOT_STARTED
priority: HIGH
assigned_role: IMPLEMENTER
started_at: ~
completed_at: ~
last_updated: 2026-03-15
```

---

## 목적

VS Code에 독립적인 순수 TypeScript 비교/병합 엔진을 구현한다.
Domain Layer 이므로 VS Code API를 직접 사용하지 않는다.
이 Job 완료 후 단위 테스트만으로 핵심 로직 검증이 가능해야 한다.

---

## 선행조건

- [ ] JOB-001 COMPLETED 상태
- [ ] `IFileSystem` 인터페이스 정의 완료
- [ ] `FileEntry`, `CompareResult`, `MergeResult` 도메인 모델 정의 완료
- [ ] `MockFileSystem` 테스트 헬퍼 준비 완료

---

## 입력

| 입력 | 위치 | 필수 여부 |
|------|------|-----------|
| IFileSystem 인터페이스 | src/infrastructure/interfaces/IFileSystem.ts | 필수 |
| 도메인 모델 정의 | src/domain/models/ | 필수 |
| 폴더 비교 명세 | specs/FOLDER_COMPARISON_SPEC.md | 필수 |
| 폴더 병합 명세 | specs/FOLDER_MERGE_SPEC.md | 필수 |
| 충돌 해결 정책 | specs/CONFLICT_RESOLUTION_SPEC.md | 필수 |
| 아키텍처 원칙 | stable/ARCHITECTURE_PRINCIPLES.md | 필수 |

---

## Phase 2-1: 폴더 비교 엔진

**목적**: 두 폴더의 파일 구조를 비교하는 핵심 로직 구현

**담당 에이전트**: IMPLEMENTER

| Step | 내용 | 상태 | 산출물 |
|------|------|------|--------|
| 2-1-1 | `ComparisonStrategy` 인터페이스 정의 | `TODO` | src/domain/comparison/ComparisonStrategy.ts |
| 2-1-2 | `FolderComparator` 구현 (재귀 순회) | `TODO` | src/domain/comparison/FolderComparator.ts |
| 2-1-3 | 파일 상태 분류 로직 (ADDED/DELETED/MODIFIED/SAME) | `TODO` | FolderComparator.ts |
| 2-1-4 | 기본 비교 전략 (크기 + 수정 시간) 구현 | `TODO` | src/domain/comparison/DefaultComparisonStrategy.ts |
| 2-1-5 | FolderComparator 단위 테스트 | `TODO` | test/unit/FolderComparator.test.ts |
| 2-1-6 | 성능 테스트: 10,000 파일 5초 이내 | `TODO` | test/perf/ |

**Phase 2-1 완료 조건**:
- [ ] FolderComparator 단위 테스트 전체 통과
- [ ] 10,000 파일 폴더 비교 5초 이내 완료 확인
- [ ] VS Code 없이 테스트 실행 가능

---

## Phase 2-2: 파일 비교 엔진

**목적**: 두 파일의 내용을 비교하는 로직 구현

**담당 에이전트**: IMPLEMENTER

| Step | 내용 | 상태 | 산출물 |
|------|------|------|--------|
| 2-2-1 | `FileComparator` 구현 (해시 기반 동일 여부 판단) | `TODO` | src/domain/comparison/FileComparator.ts |
| 2-2-2 | 텍스트 파일 줄 단위 diff 로직 (Myers diff 알고리즘 또는 라이브러리) | `TODO` | FileComparator.ts |
| 2-2-3 | 이진 파일 감지 로직 | `TODO` | FileComparator.ts |
| 2-2-4 | FileComparator 단위 테스트 | `TODO` | test/unit/FileComparator.test.ts |

**에이전트 결정 포인트 (Step 2-2-2)**:
> diff 알고리즘 직접 구현 vs 라이브러리 사용 결정 필요
> → ARCHITECT 에게 ADR-0003 생성 요청 (diff 라이브러리 선택)

**Phase 2-2 완료 조건**:
- [ ] FileComparator 단위 테스트 전체 통과
- [ ] 텍스트 파일 줄 단위 diff 결과 정확성 확인

---

## Phase 2-3: 병합 엔진

**목적**: 폴더/파일 병합 로직 구현

**담당 에이전트**: IMPLEMENTER

| Step | 내용 | 상태 | 산출물 |
|------|------|------|--------|
| 2-3-1 | `FolderMerger` 구현 (단방향 파일 복사) | `TODO` | src/domain/merge/FolderMerger.ts |
| 2-3-2 | Atomic 복사 로직 (복사 실패 시 원본 보존) | `TODO` | FolderMerger.ts |
| 2-3-3 | `FileMerger` 구현 (hunk 단위 선택적 적용) | `TODO` | src/domain/merge/FileMerger.ts |
| 2-3-4 | MergeResult 모델 완성 | `TODO` | src/domain/models/MergeResult.ts |
| 2-3-5 | FolderMerger, FileMerger 단위 테스트 | `TODO` | test/unit/Merger.test.ts |

**Phase 2-3 완료 조건**:
- [ ] FolderMerger: 파일 복사 원본 무결성 보장 테스트 통과
- [ ] FileMerger: hunk 단위 적용 테스트 통과

---

## Phase 2-4: 충돌 해결

**목적**: 병합 충돌 감지 및 해결 로직 구현

**담당 에이전트**: IMPLEMENTER

| Step | 내용 | 상태 | 산출물 |
|------|------|------|--------|
| 2-4-1 | `ConflictResolver` 구현 | `TODO` | src/domain/merge/ConflictResolver.ts |
| 2-4-2 | 충돌 마커 생성 (`<<<<<<<`, `=======`, `>>>>>>>`) | `TODO` | ConflictResolver.ts |
| 2-4-3 | 충돌 해결 전략 (ours/theirs/manual) | `TODO` | ConflictResolver.ts |
| 2-4-4 | ConflictResolver 단위 테스트 | `TODO` | test/unit/ConflictResolver.test.ts |

**Phase 2-4 완료 조건**:
- [ ] 충돌 감지 정확성 테스트 통과
- [ ] 충돌 마커 형식 표준 준수 확인

---

## 출력

| 산출물 | 위치 | 설명 |
|--------|------|------|
| FolderComparator | src/domain/comparison/ | 폴더 비교 엔진 |
| FileComparator | src/domain/comparison/ | 파일 비교 엔진 |
| FolderMerger | src/domain/merge/ | 폴더 병합 엔진 |
| FileMerger | src/domain/merge/ | 파일 병합 엔진 |
| ConflictResolver | src/domain/merge/ | 충돌 해결기 |
| 단위 테스트 | test/unit/ | 80%+ 커버리지 |

---

## Job 완료 조건 (Definition of Done)

- [ ] Phase 2-1 ~ 2-4 모두 DONE
- [ ] `npm test` (단위 테스트) 전체 통과
- [ ] 커버리지 80% 이상
- [ ] VS Code 없이 테스트 실행 가능
- [ ] 성능 기준 (NFR-101) 충족

---

## 재시도 규칙

```yaml
max_retries: 3
common_failures:
  - "diff 알고리즘 성능 미달": 더 효율적인 알고리즘/라이브러리로 교체 → ADR
  - "병합 무결성 실패": Atomic 복사 로직 재검토
  - "테스트 커버리지 미달": 엣지 케이스 테스트 추가
```

---

## 체크포인트

- Phase 2-1 완료 → `episodic/CHECKPOINT_LOG.md` 기록
- Phase 2-2 완료 → `episodic/CHECKPOINT_LOG.md` 기록
- Phase 2-3 완료 → `episodic/CHECKPOINT_LOG.md` 기록
- Phase 2-4 완료 → `episodic/CHECKPOINT_LOG.md` 기록
- JOB-002 완료 → `working/CURRENT_STATUS.md` + `episodic/JOB_HISTORY.md` 업데이트

---

## 관련 문서

- `specs/FOLDER_COMPARISON_SPEC.md`
- `specs/FOLDER_MERGE_SPEC.md`
- `specs/CONFLICT_RESOLUTION_SPEC.md`
- `jobs/JOB-001-FOUNDATION.md` (선행)
- `jobs/JOB-003-UI.md` (후행)
