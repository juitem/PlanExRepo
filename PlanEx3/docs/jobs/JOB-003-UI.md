# JOB-003 — UI LAYER

---

## Job 메타데이터

```yaml
job_id: JOB-003
job_name: UI Layer (VS Code UI 구성요소)
status: NOT_STARTED
priority: HIGH
assigned_role: IMPLEMENTER
started_at: ~
completed_at: ~
last_updated: 2026-03-15
```

---

## 목적

VS Code Extension의 UI 구성요소를 구현하고 Core Engine(JOB-002)과 연결한다.
사용자가 명령어를 실행하고, 비교 결과를 트리로 보고, 파일을 병합할 수 있는 인터페이스를 제공한다.

---

## 선행조건

- [ ] JOB-001 COMPLETED 상태
- [ ] JOB-002 COMPLETED 상태 (또는 최소 Phase 2-1, 2-3 완료)
- [ ] `interface/MODULE_CONTRACTS.md` 에 Application Layer 계약 정의됨

---

## 입력

| 입력 | 위치 | 필수 여부 |
|------|------|-----------|
| Core Engine 구현 | src/domain/ | 필수 |
| Application Layer 계약 | interface/MODULE_CONTRACTS.md | 필수 |
| VS Code Extension 구조 계획 | stable/VSCODE_EXTENSION_STRUCTURE.md | 필수 |
| 사용자 시나리오 | stable/USER_SCENARIOS.md | 필수 |
| 비기능 요구사항 | stable/NONFUNCTIONAL_REQUIREMENTS.md | 참고 |

---

## Phase 3-1: Application Layer

**목적**: Domain Layer와 VS Code Layer를 연결하는 Use Case 레이어 구현

**담당 에이전트**: IMPLEMENTER

| Step | 내용 | 상태 | 산출물 |
|------|------|------|--------|
| 3-1-1 | `CompareFolderUseCase` 구현 | `TODO` | src/application/CompareFolderUseCase.ts |
| 3-1-2 | `MergeFolderUseCase` 구현 | `TODO` | src/application/MergeFolderUseCase.ts |
| 3-1-3 | `DiffFileUseCase` 구현 | `TODO` | src/application/DiffFileUseCase.ts |
| 3-1-4 | `FileSystemService` (Node.js fs 구현체) 완성 | `TODO` | src/infrastructure/FileSystemService.ts |

**Phase 3-1 완료 조건**:
- [ ] Use Case 단위 테스트 (MockFileSystem 사용) 통과

---

## Phase 3-2: TreeView 제공자

**목적**: 비교 결과를 VS Code TreeView로 표시하는 구성요소 구현

**담당 에이전트**: IMPLEMENTER

| Step | 내용 | 상태 | 산출물 |
|------|------|------|--------|
| 3-2-1 | `CompareTreeProvider` 구현 (TreeDataProvider 구현) | `TODO` | src/views/CompareTreeProvider.ts |
| 3-2-2 | `FileEntry → TreeItem` 변환 로직 | `TODO` | CompareTreeProvider.ts |
| 3-2-3 | 파일 상태별 아이콘 설정 (ADDED/DELETED/MODIFIED/SAME) | `TODO` | resources/icons/ |
| 3-2-4 | 파일 클릭 시 diff 뷰 열기 이벤트 연결 | `TODO` | CompareTreeProvider.ts |
| 3-2-5 | 다중 선택 지원 (체크박스) | `TODO` | CompareTreeProvider.ts |

**Phase 3-2 완료 조건**:
- [ ] 비교 결과가 TreeView 에 정상 표시
- [ ] 파일 상태별 아이콘 표시 확인

---

## Phase 3-3: Command 등록

**목적**: VS Code Command Palette 및 컨텍스트 메뉴에 명령 등록

**담당 에이전트**: IMPLEMENTER

| Step | 내용 | 상태 | 산출물 |
|------|------|------|--------|
| 3-3-1 | `compareFolders` Command 구현 | `TODO` | src/commands/compareFolders.ts |
| 3-3-2 | 폴더 선택 다이얼로그 (showOpenDialog) | `TODO` | compareFolders.ts |
| 3-3-3 | 비교 진행 표시 (withProgress) | `TODO` | compareFolders.ts |
| 3-3-4 | `mergeFolders` Command 구현 | `TODO` | src/commands/mergeFolders.ts |
| 3-3-5 | 병합 확인 다이얼로그 | `TODO` | mergeFolders.ts |
| 3-3-6 | `package.json` 에 Command/Menu/View 등록 | `TODO` | package.json |
| 3-3-7 | `extension.ts` 에 Command 등록 코드 추가 | `TODO` | extension.ts |

**Phase 3-3 완료 조건**:
- [ ] Command Palette 에서 "PlanEx3: Compare Folders" 표시
- [ ] 폴더 선택 → 비교 → TreeView 표시 전체 흐름 동작
- [ ] Explorer 컨텍스트 메뉴에서 폴더 비교 실행 가능

---

## Phase 3-4: Diff 뷰 연동

**목적**: 파일 diff 뷰 연동

**담당 에이전트**: IMPLEMENTER

| Step | 내용 | 상태 | 산출물 |
|------|------|------|--------|
| 3-4-1 | `DiffViewer` 래퍼 구현 (vscode.diff 래핑) | `TODO` | src/views/DiffViewer.ts |
| 3-4-2 | TreeView 파일 클릭 → Diff 뷰 열기 연결 | `TODO` | CompareTreeProvider.ts |

**Phase 3-4 완료 조건**:
- [ ] MODIFIED 파일 클릭 시 VS Code diff 뷰 열림
- [ ] 텍스트 파일 줄 단위 diff 표시 확인

---

## 출력

| 산출물 | 위치 | 설명 |
|--------|------|------|
| Application Layer | src/application/ | Use Case 구현 |
| CompareTreeProvider | src/views/ | TreeView UI |
| Commands | src/commands/ | 사용자 명령 |
| DiffViewer | src/views/ | Diff 뷰 래퍼 |
| 갱신된 package.json | package.json | Command/View 등록 |

---

## Job 완료 조건 (Definition of Done)

- [ ] Phase 3-1 ~ 3-4 모두 DONE
- [ ] VS Code 에서 전체 워크플로 동작 (UC-001, UC-002, UC-004 시나리오)
- [ ] 수동 테스트 체크리스트 통과
- [ ] Light/Dark 테마 모두 UI 정상 표시

---

## 체크포인트

- Phase 3-2 완료 → `episodic/CHECKPOINT_LOG.md` 기록 (TreeView 스크린샷)
- Phase 3-3 완료 → `episodic/CHECKPOINT_LOG.md` 기록 (Command 동작 확인)
- JOB-003 완료 → `working/CURRENT_STATUS.md` + `episodic/JOB_HISTORY.md` 업데이트

---

## 관련 문서

- `stable/USER_SCENARIOS.md`
- `stable/VSCODE_EXTENSION_STRUCTURE.md`
- `interface/MODULE_CONTRACTS.md`
- `jobs/JOB-002-CORE-ENGINE.md` (선행)
- `jobs/JOB-004-TESTING.md` (후행)
