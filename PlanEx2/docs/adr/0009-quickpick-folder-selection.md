# ADR-0009: 폴더 선택 UI — showOpenDialog → QuickPick 전환

**날짜**: 2026-03-13
**상태**: Accepted
**작성자**: Developer Agent (Post-release Hotfix)

---

## Context (배경)

v0.1.0에서 `vscode.window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false })`를 사용해 폴더를 선택했습니다. 사용자 보고에 따르면 "폴더를 선택하는 기능이 안 보인다"는 문제가 발생했습니다.

**근본 원인 분석:**
- macOS 네이티브 Open 패널에서 `canSelectFiles: false`일 때, 파일은 회색으로 비활성화되지만 폴더를 "선택"하는 방법이 직관적이지 않음. 사용자가 폴더를 더블클릭하면 "진입(navigate)"이 되고, 선택하려면 단일클릭 후 "Open"을 클릭해야 함 — 일반 사용자에게 불명확함.
- Windows에서도 `canSelectFiles: false`인 경우 폴더 선택 모드가 OS별로 다르게 동작.

---

## Decision (결정)

`showOpenDialog` 두 번 순차 호출을 제거하고, **QuickPick 기반 폴더 선택기** (`pickFolder()`)로 교체합니다.

선택 옵션 순서:
1. **Workspace Folders** — 현재 VS Code에 열린 폴더 목록 (자동 제안)
2. **Recent** — 이전에 PlanEx2로 비교했던 폴더 목록 (`globalState`에 최대 10개 저장)
3. **Browse file system...** — OS 네이티브 폴더 선택 다이얼로그 (`showOpenDialog`, `openLabel: 'Select Folder'` 명시)
4. **Enter path manually...** — 경로 직접 입력 (`showInputBox`) + 실시간 유효성 검사 (폴더 존재 여부)

Source/Target 선택 시 제목에 `①` `②` 번호 표시하여 순서 안내.

---

## Rationale (근거)

- Workspace Folders를 먼저 제안하면 가장 흔한 사용 케이스(현재 열린 프로젝트 비교)를 1클릭으로 처리 가능.
- 최근 사용 폴더 목록으로 반복 작업 효율화.
- Browse 옵션은 여전히 존재하지만 사용자가 무엇을 눌러야 하는지 명확히 레이블됨.
- 직접 입력 옵션으로 경로 복붙 지원 (CI 환경, 터미널 경로 등).

---

## Alternatives Considered (고려한 대안들)

| 대안 | 장점 | 거부 이유 |
|---|---|---|
| showOpenDialog 유지 + 안내 메시지 추가 | 구현 최소화 | 근본 UX 문제 미해결 (폴더 선택 방법이 여전히 불명확) |
| WebView 패널 (HTML form) | 가장 풍부한 UI | 구현 복잡도 과도, 유지보수 부담 증가 |
| showInputBox만 사용 | 단순 | 경로 탐색 불가, 오타 위험 |
| workspace 폴더만 제안 (QuickPick) | 간단 | workspace 외부 폴더 선택 불가 |

---

## Consequences (예상 결과)

**긍정적:**
- 폴더 선택 방법이 명확하고 직관적
- 반복 작업 시 최근 목록으로 빠른 선택
- 모든 OS에서 동일한 UX

**부정적 / 트레이드오프:**
- QuickPick으로 폴더 트리를 직접 탐색할 수 없음 (Browse 옵션 경유 필요)
- `globalState` 최근 목록이 사용자가 삭제한 폴더를 포함할 수 있음 (현재 유효성 검사 없음)

## Implementation Notes

- `pickFolder()` 함수: `context: vscode.ExtensionContext` 파라미터로 `globalState` 접근.
- 최근 폴더 저장 키: `'planex2.recentFolders'`, 최대 10개.
- Source = Target 동일 경로 선택 시 경고 메시지 후 중단.
