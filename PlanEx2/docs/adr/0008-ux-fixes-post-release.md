# ADR-0008: Post-Release UX 버그 수정 8건

**날짜**: 2026-03-13
**상태**: Accepted
**작성자**: Developer Agent (Post-release Hotfix)

---

## Context (배경)

v0.1.0 VSIX 배포 후 사용자 관점 점검에서 기능이 동작하지 않는 치명적 버그 3건과 UX 문제 5건이 발견됐습니다.

---

## 발견된 문제 및 결정

### [BUG-001] 키보드 단축키 전혀 동작 안 함 — 치명적
- **원인**: `package.json`의 keybinding `when` 조건이 `planex2Active`를 참조하는데, 코드 어디에서도 `setContext('planex2Active', true)`를 호출하지 않음.
- **결정**: `runComparison()` 완료 시 `vscode.commands.executeCommand('setContext', 'planex2Active', true)` 호출. `deactivate()`에서 false로 해제.
- **추가**: `focusedView == planex2Tree` 조건도 OR로 추가하여 TreeView가 포커스된 상태에서도 파일 네비게이션 단축키 동작.

### [BUG-002] Compare Folders 툴바 버튼 표시 안 됨 — 치명적
- **원인**: `view/title` 메뉴에 등록된 `planex2.compareFolders` 명령에 `icon` 필드 없음. VS Code는 icon 없는 명령을 툴바가 아닌 `...` 오버플로 메뉴로 이동시킴.
- **결정**: `"icon": "$(folder-opened)"` 추가.

### [BUG-003] 빈 TreeView에 아무 안내 없음 — 치명적
- **원인**: `viewsWelcome` contribution point 미등록.
- **결정**: `package.json`에 `viewsWelcome` 추가. "No folders selected" 메시지 + `Compare Folders` 버튼 링크 표시.

### [UX-004] Refresh가 재비교를 수행하지 않음
- **원인**: Refresh 명령이 `treeProvider.getCurrentResult()`를 그대로 `setResult()`에 전달 — 파일 시스템을 다시 읽지 않음.
- **결정**: 비교 시 source/target 경로를 `context.workspaceState`에 저장. Refresh는 저장된 경로로 `runComparison()`을 재실행.

### [UX-005] 비교 중인 폴더 경로가 UI에 표시되지 않음
- **원인**: TreeView 제목이 항상 "Folder Diff"로 고정.
- **결정**: 비교 완료 후 `treeView.title`을 `srcFolder ↔ tgtFolder` 형식으로 변경. 이전 세션 경로 복원 시 "Click Refresh to re-compare" description 표시.

### [UX-006] CONFLICT 파일 diff를 열 수 없음
- **원인**: `DiffTreeItem.command`가 `MODIFIED` 상태만 처리. `package.json` context menu도 `modified`만 표시.
- **결정**: `MODIFIED || CONFLICT` 모두 클릭 시 diff 오픈. context menu `when`에 `conflict` 추가.

### [UX-007] 내부 전용 명령이 Command Palette에 노출됨
- **원인**: `commandPalette` 필터 미설정.
- **결정**: `mergeFileToTarget`, `mergeFileToSource`, `mergeFolderToTarget`, `openDiff`에 `"when": "false"` 추가.

### [UX-008] 미사용 import
- **원인**: `compareFolders.ts`에서 `nodePath` import 후 미사용.
- **결정**: 제거.

---

## Consequences

- 키보드 단축키, 툴바 버튼, 빈 상태 안내 모두 정상 동작
- Refresh가 실제 재비교를 수행
- CONFLICT 파일도 diff 에디터로 열 수 있어 수동 해결 가능
