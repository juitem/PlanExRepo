# VSCODE_EXTENSION_STRUCTURE — VS Code Extension 구조 계획

> **Knowledge 유형**: stable
> **갱신 조건**: Extension 아키텍처 변경 시 (ADR-0002 관련)

---

## Extension 기본 구조

```
PlanEx3/
├── package.json                  ← Extension 매니페스트
├── tsconfig.json                 ← TypeScript 설정
├── .eslintrc.json               ← ESLint 설정
├── .vscodeignore                ← 패키지 제외 파일
├── src/
│   ├── extension.ts             ← 진입점 (activate/deactivate)
│   ├── commands/
│   │   ├── compareFolders.ts    ← 폴더 비교 커맨드
│   │   ├── mergeFolders.ts      ← 폴더 병합 커맨드
│   │   └── index.ts             ← 커맨드 등록
│   ├── views/
│   │   ├── CompareTreeProvider.ts  ← TreeView 데이터 제공자
│   │   ├── ComparePanel.ts         ← WebView 패널 (고급 UI)
│   │   └── DiffViewer.ts           ← Diff 뷰 래퍼
│   ├── application/
│   │   ├── CompareFolderUseCase.ts
│   │   ├── MergeFolderUseCase.ts
│   │   └── DiffFileUseCase.ts
│   ├── domain/
│   │   ├── comparison/
│   │   │   ├── FolderComparator.ts
│   │   │   ├── FileComparator.ts
│   │   │   └── ComparisonStrategy.ts
│   │   ├── merge/
│   │   │   ├── FileMerger.ts
│   │   │   ├── FolderMerger.ts
│   │   │   └── ConflictResolver.ts
│   │   └── models/
│   │       ├── CompareResult.ts
│   │       ├── FileEntry.ts
│   │       └── MergeResult.ts
│   └── infrastructure/
│       ├── FileSystemService.ts  ← Node.js fs 래퍼
│       └── interfaces/
│           └── IFileSystem.ts    ← 테스트용 추상화
├── test/
│   ├── unit/                    ← 순수 TypeScript 단위 테스트
│   ├── integration/             ← VS Code Extension 통합 테스트
│   └── fixtures/                ← 테스트용 폴더/파일 샘플
└── docs/                        ← 이 문서 패키지
```

---

## package.json 핵심 매니페스트 항목

```json
{
  "name": "planex3",
  "displayName": "PlanEx3: Folder Compare & Merge",
  "description": "Compare and merge folders and files in VS Code",
  "version": "0.0.1",
  "engines": { "vscode": "^1.80.0" },
  "categories": ["Other"],
  "activationEvents": [],
  "main": "./dist/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "planex3.compareFolders",
        "title": "Compare Folders",
        "category": "PlanEx3"
      },
      {
        "command": "planex3.mergeFolders",
        "title": "Merge Folders",
        "category": "PlanEx3"
      }
    ],
    "menus": {
      "explorer/context": [
        {
          "command": "planex3.compareFolders",
          "when": "explorerResourceIsFolder",
          "group": "planex3"
        }
      ]
    },
    "views": {
      "explorer": [
        {
          "id": "planex3.compareView",
          "name": "Folder Compare"
        }
      ]
    },
    "configuration": {
      "title": "PlanEx3",
      "properties": {
        "planex3.ignorePatterns": {
          "type": "array",
          "default": ["node_modules", ".git"],
          "description": "Patterns to ignore during comparison"
        }
      }
    }
  }
}
```

---

## 주요 VS Code API 사용 계획

| API | 용도 |
|-----|------|
| `vscode.window.createTreeView` | 비교 결과 트리 표시 |
| `vscode.commands.registerCommand` | 커맨드 등록 |
| `vscode.window.showOpenDialog` | 폴더 선택 UI |
| `vscode.workspace.fs` | 파일 시스템 접근 (크로스 플랫폼) |
| `vscode.diff` | 파일 diff 뷰 열기 |
| `vscode.window.withProgress` | 진행 상태 표시 |
| `vscode.window.showErrorMessage` | 오류 메시지 |

---

## Extension 활성화 전략

```typescript
// 활성화 이벤트: onCommand (필요할 때만 활성화)
// package.json의 activationEvents를 빈 배열로 두면
// VS Code 1.74+ 에서 자동으로 onCommand 감지
```

---

## 빌드 및 패키징

| 도구 | 용도 | 결정 상태 |
|------|------|-----------|
| esbuild | 빠른 번들링 | PROPOSED (ADR 필요) |
| vsce | VS Code Extension 패키지 | ACCEPTED |
| mocha | 테스트 러너 | ACCEPTED |

---

## 관련 문서

- `stable/ARCHITECTURE_PRINCIPLES.md` — 레이어 분리 원칙
- `decisions/ADR-0002-vscode-architecture.md` — 아키텍처 결정
- `specs/FOLDER_COMPARISON_SPEC.md` — 비교 엔진 상세
- `tests/TEST_STRATEGY.md` — 테스트 전략
