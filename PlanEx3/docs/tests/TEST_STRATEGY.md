# TEST_STRATEGY — 테스트 전략

> **Knowledge 유형**: stable
> **갱신 조건**: 테스트 접근법 변경 시

---

## 테스트 계층 구조

```
┌─────────────────────────────┐
│      E2E / 수동 테스트       │  VS Code 에서 실제 동작 확인
├─────────────────────────────┤
│      통합 테스트              │  VS Code Extension 환경 (Mocha + VS Code Test Runner)
├─────────────────────────────┤
│      단위 테스트              │  순수 TypeScript, VS Code 불필요 (Mocha)
└─────────────────────────────┘
```

---

## 단위 테스트 전략

**대상**: Domain Layer (비교/병합 엔진)
**도구**: Mocha + Chai (또는 assert)
**실행 환경**: Node.js (VS Code 없이)
**커버리지 목표**: 80% 이상

### 테스트 원칙

```
1. MockFileSystem 사용 → 실제 파일 시스템 불필요
2. 각 테스트는 독립적 (테스트 간 상태 공유 금지)
3. 테스트 픽스처는 test/fixtures/ 에 보관
4. 실패 케이스도 테스트 (Happy Path + Edge Cases)
```

### 단위 테스트 목록

| 모듈 | 테스트 파일 | 주요 테스트 케이스 |
|------|------------|-------------------|
| FolderComparator | FolderComparator.test.ts | 빈 폴더, 동일 폴더, 파일 추가/삭제/변경, 중첩 디렉토리 |
| FileComparator | FileComparator.test.ts | 동일 파일, 다른 파일, 이진 파일, 빈 파일 |
| FolderMerger | FolderMerger.test.ts | 단방향 복사, 중간 디렉토리 생성, 복사 실패 시 원본 보존 |
| FileMerger | FileMerger.test.ts | Hunk 적용, 충돌 없는 병합 |
| ConflictResolver | ConflictResolver.test.ts | 충돌 감지, 마커 생성, accept_ours/theirs |

---

## 통합 테스트 전략

**대상**: VS Code Extension 전체 기능
**도구**: @vscode/test-electron (VS Code Extension Test Runner)
**실행 환경**: VS Code Extension Host

### 통합 테스트 목록

| 시나리오 | 테스트 파일 | 기준 |
|----------|------------|------|
| UC-001: 폴더 비교 | uc001.test.ts | TreeView 에 결과 표시 |
| UC-002: 파일 복사 | uc002.test.ts | 복사 후 파일 존재 확인 |
| UC-003: 파일 복원 | uc003.test.ts | 복원 후 파일 내용 확인 |
| 빈 폴더 비교 | edge.test.ts | 오류 없이 빈 결과 |
| 권한 없는 파일 | edge.test.ts | 오류 처리 확인 |

---

## 성능 테스트

**목적**: NFR-101 (10,000 파일 5초 이내) 검증

```typescript
// 성능 테스트 픽스처 생성
// test/fixtures/large-folder/ 에 10,000개 파일 생성 스크립트
// 벤치마크 실행: npm run test:perf
```

---

## 수동 테스트 체크리스트

JOB-004 에서 수행. `jobs/JOB-004-TESTING.md` 참조.

---

## 테스트 환경 설정

### 단위 테스트 실행

```bash
npm test              # 전체 단위 테스트
npm run test:unit     # 단위 테스트만
npm run test:coverage # 커버리지 리포트
```

### 통합 테스트 실행

```bash
npm run test:integration  # VS Code 통합 테스트
```

### 커버리지 목표

| 레이어 | 목표 커버리지 |
|--------|--------------|
| Domain Layer | 80% 이상 |
| Application Layer | 60% 이상 |
| Infrastructure Layer | 40% 이상 (Mock 존재) |
| VS Code Layer | 수동 테스트 |

---

## 테스트 픽스처 구조

```
test/
├── fixtures/
│   ├── folder-a/           ← 기준 폴더 샘플
│   │   ├── file1.txt
│   │   ├── file2.ts
│   │   └── subdir/
│   ├── folder-b/           ← 비교 폴더 샘플
│   │   ├── file1.txt       ← SAME
│   │   ├── file2.ts        ← MODIFIED
│   │   ├── file3.ts        ← ADDED
│   │   └── subdir/
│   └── large-folder/       ← 성능 테스트용 (생성 스크립트로 생성)
├── mocks/
│   └── MockFileSystem.ts
└── helpers/
    └── testUtils.ts
```

---

## 관련 문서

- `stable/NONFUNCTIONAL_REQUIREMENTS.md` — 품질 기준
- `jobs/JOB-004-TESTING.md` — 테스트 Job 상세
- `stable/ARCHITECTURE_PRINCIPLES.md` — 테스트 가능성 원칙 (P5)
