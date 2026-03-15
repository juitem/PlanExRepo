# WBS — 작업 분해 구조 (Work Breakdown Structure)

> **목적**: 전체 작업을 Job → Phase → Step 계층으로 분해하고 상태를 추적한다

---

## 상태 코드

```
TODO        : 아직 시작 전
IN_PROGRESS : 현재 진행 중
DONE        : 완료
BLOCKED     : 블로커로 중단
SKIPPED     : 건너뜀 (사유 기록 필수)
```

---

## JOB-001: FOUNDATION

**목표**: VS Code Extension 개발 환경 및 기반 구조를 확립한다

| Phase | Step | 내용 | 상태 | 산출물 |
|-------|------|------|------|--------|
| 1-1 환경 설정 | 1-1-1 | package.json 작성 (Extension 매니페스트) | `TODO` | package.json |
| | 1-1-2 | tsconfig.json 설정 | `TODO` | tsconfig.json |
| | 1-1-3 | ESLint + Prettier 설정 | `TODO` | .eslintrc.json, .prettierrc |
| | 1-1-4 | esbuild 빌드 설정 | `TODO` | esbuild.js |
| | 1-1-5 | 개발 환경 동작 확인 (Hello World Extension) | `TODO` | src/extension.ts |
| 1-2 프로젝트 구조 | 1-2-1 | src/ 디렉토리 구조 생성 | `TODO` | 디렉토리 트리 |
| | 1-2-2 | 빈 모듈 파일 + 인터페이스 stub 생성 | `TODO` | src/ 전체 stub |
| | 1-2-3 | test/ 디렉토리 구조 + Mocha 설정 | `TODO` | test/, .mocharc |
| 1-3 인터페이스 설계 | 1-3-1 | IFileSystem 인터페이스 설계 | `TODO` | IFileSystem.ts |
| | 1-3-2 | 도메인 모델 (FileEntry, CompareResult) 설계 | `TODO` | models/*.ts |
| | 1-3-3 | 인터페이스 계약 문서 갱신 | `TODO` | interface/MODULE_CONTRACTS.md |

**JOB-001 완료 조건**:
- [ ] `Hello World` Extension 이 VS Code 에서 정상 실행
- [ ] 단위 테스트 환경 동작 확인
- [ ] IFileSystem 인터페이스 정의 완료
- [ ] MODULE_CONTRACTS.md 초안 완료

---

## JOB-002: CORE ENGINE

**목표**: 폴더/파일 비교 및 병합 핵심 로직을 구현한다 (VS Code 독립적)

| Phase | Step | 내용 | 상태 | 산출물 |
|-------|------|------|------|--------|
| 2-1 폴더 비교 | 2-1-1 | FolderComparator 구현 | `TODO` | FolderComparator.ts |
| | 2-1-2 | 재귀 디렉토리 순회 로직 | `TODO` | FolderComparator.ts |
| | 2-1-3 | 파일 상태 분류 (ADDED/DELETED/MODIFIED/SAME) | `TODO` | CompareResult.ts |
| | 2-1-4 | FolderComparator 단위 테스트 | `TODO` | test/unit/FolderComparator.test.ts |
| 2-2 파일 비교 | 2-2-1 | FileComparator 구현 (체크섬 기반) | `TODO` | FileComparator.ts |
| | 2-2-2 | 텍스트 파일 diff 로직 | `TODO` | FileComparator.ts |
| | 2-2-3 | FileComparator 단위 테스트 | `TODO` | test/unit/FileComparator.test.ts |
| 2-3 병합 엔진 | 2-3-1 | FolderMerger 구현 (단방향 복사) | `TODO` | FolderMerger.ts |
| | 2-3-2 | FileMerger 구현 (hunk 기반 병합) | `TODO` | FileMerger.ts |
| | 2-3-3 | Merger 단위 테스트 | `TODO` | test/unit/Merger.test.ts |
| 2-4 충돌 해결 | 2-4-1 | ConflictResolver 구현 | `TODO` | ConflictResolver.ts |
| | 2-4-2 | 충돌 마커 생성 로직 | `TODO` | ConflictResolver.ts |
| | 2-4-3 | ConflictResolver 단위 테스트 | `TODO` | test/unit/ConflictResolver.test.ts |

**JOB-002 완료 조건**:
- [ ] Domain Layer 단위 테스트 커버리지 80% 이상
- [ ] 10,000 파일 폴더 비교 5초 이내 완료 (벤치마크)
- [ ] VS Code 없이 단위 테스트 전체 통과

---

## JOB-003: UI LAYER

**목표**: VS Code UI 구성요소를 구현하고 Core Engine 과 연결한다

| Phase | Step | 내용 | 상태 | 산출물 |
|-------|------|------|------|--------|
| 3-1 TreeView | 3-1-1 | CompareTreeProvider 구현 | `TODO` | CompareTreeProvider.ts |
| | 3-1-2 | FileEntry → TreeItem 변환 | `TODO` | CompareTreeProvider.ts |
| | 3-1-3 | 상태 아이콘 (ADDED/DELETED/MODIFIED/SAME) | `TODO` | icons/ + TreeProvider |
| 3-2 Commands | 3-2-1 | compareFolders Command 구현 | `TODO` | commands/compareFolders.ts |
| | 3-2-2 | mergeFolders Command 구현 | `TODO` | commands/mergeFolders.ts |
| | 3-2-3 | 폴더 선택 다이얼로그 | `TODO` | commands/ |
| | 3-2-4 | Command 등록 (package.json + extension.ts) | `TODO` | extension.ts |
| | 3-2-5 | Application Layer Use Case 연결 | `TODO` | application/ |
| 3-3 Diff 뷰 | 3-3-1 | VS Code 내장 diff 뷰 연동 | `TODO` | views/DiffViewer.ts |
| | 3-3-2 | MODIFIED 파일 클릭 → diff 뷰 열기 | `TODO` | TreeProvider + command |

**JOB-003 완료 조건**:
- [ ] VS Code 에서 폴더 선택 → 비교 결과 TreeView 표시
- [ ] MODIFIED 파일 클릭 → diff 뷰 열림
- [ ] 파일 복사 기능 동작

---

## JOB-004: TESTING & RELEASE

**목표**: 통합 테스트를 완료하고 배포 가능한 패키지를 생성한다

| Phase | Step | 내용 | 상태 | 산출물 |
|-------|------|------|------|--------|
| 4-1 단위 테스트 | 4-1-1 | 커버리지 80% 달성 확인 | `TODO` | 커버리지 리포트 |
| | 4-1-2 | 엣지 케이스 테스트 추가 | `TODO` | test/unit/ |
| 4-2 통합 테스트 | 4-2-1 | VS Code Extension 환경 테스트 설정 | `TODO` | test/integration/ |
| | 4-2-2 | E2E 시나리오 테스트 (UC-001~003) | `TODO` | test/integration/ |
| | 4-2-3 | 성능 테스트 (NFR-101 기준) | `TODO` | 성능 테스트 결과 |
| 4-3 패키지 & 배포 | 4-3-1 | README.md 작성 | `TODO` | README.md |
| | 4-3-2 | CHANGELOG.md 작성 | `TODO` | CHANGELOG.md |
| | 4-3-3 | vsce package 실행 | `TODO` | planex3-x.x.x.vsix |
| | 4-3-4 | 로컬 설치 테스트 | `TODO` | — |

**JOB-004 완료 조건**:
- [ ] 통합 테스트 전체 통과
- [ ] .vsix 파일 생성 성공
- [ ] 로컬 VS Code 에 설치 및 동작 확인
