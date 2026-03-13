# Job 07: 패키징 & 최종 품질 검증

## Objective

PlanEx2 확장을 배포 가능한 `.vsix` 파일로 패키징하고, 최종 품질 기준(코드 정리, README, `.vscodeignore`, 아이콘 등)을 충족시킵니다.

---

## Prerequisites

- Phase 6 (`job_06_conflict_detection.md`) 상태: **DONE**
- 전체 `npm run test:unit` 통과 확인
- `lessons_learned.md` 읽기 완료

---

## 👨‍💻 Developer Agent Tasks

### Task 7-1: `.vscodeignore` 작성

```
.vscode/**
.vscode-test/**
test/**
src/**
tsconfig.json
tsconfig.test.json
docs/**
node_modules/**
*.vsix
.gitignore
.planex2ignore
```

> `.vsix` 파일에는 `out/` 디렉토리와 `package.json`, `README.md`만 포함됩니다.

### Task 7-2: `README.md` 작성

루트 `README.md`에 아래 섹션을 포함합니다:
1. **PlanEx2** — 한 줄 설명
2. **Features** — 핵심 기능 목록 (스크린샷 placeholder 포함)
3. **Usage** — 사용 방법 (명령 팔레트에서 시작하는 방법)
4. **Merge Directions** — Source → Target / Target → Source
5. **Conflict Handling** — CONFLICT 파일 처리 방법
6. **Ignore Rules** — `.planex2ignore` 파일 형식
7. **Keyboard Shortcuts** — 단축키 표
8. **Requirements** — VS Code 1.85+, git (선택적)
9. **Known Limitations** — 이진 파일 diff 미지원 등

### Task 7-3: `package.json` 최종 점검

- `"publisher"` 필드를 실제 배포 publisher ID로 설정 (placeholder: `"planex2-dev"` 유지 가능)
- `"repository"` 필드 추가 (placeholder URL 허용)
- `"icon"` 필드: `images/icon.png` (128×128 PNG placeholder 생성)
- `"license"` 필드: `"MIT"` 추가
- `"keywords"` 추가: `["diff", "merge", "folder", "compare", "file manager"]`
- `"galleryBanner"` 추가:
  ```json
  "galleryBanner": { "color": "#1e1e2e", "theme": "dark" }
  ```

### Task 7-4: 아이콘 Placeholder 생성

`images/` 디렉토리 생성 후 `icon.png` placeholder를 위한 README 메모 추가. 실제 이미지가 없을 경우 `package.json`에서 `"icon"` 필드를 일시적으로 제거 후 패키징.

### Task 7-5: `npm run compile` 후 `out/` 정리 검증

```bash
npm run compile
ls out/
# extension.js, compareEngine.js, treeProvider.js, mergeEngine.js,
# conflictDetector.js, ignoreRules.js, commands/compareFolders.js,
# commands/mergeFile.js, commands/mergeFolder.js, commands/navigate.js
# 가 모두 있어야 합니다.
```

### Task 7-6: 최종 `npm run package` 실행

```bash
npm run package
# planex2-0.1.0.vsix 파일이 생성됩니다.
```

오류 발생 시 `vsce`가 요구하는 필드(publisher, repository 등) 확인 후 수정.

### Task 7-7: State 업데이트

1. Job 파일 `State Logs` 업데이트.
2. `docs/current_state.md`: Phase 7 → `REVIEW_PENDING`.

---

## 🧐 Reviewer Agent Tasks

1. `.vscodeignore`에 `test/`, `src/`, `docs/`가 포함됐는지 확인 (소스코드가 VSIX에 포함되지 않아야 함).
2. `README.md`에 Usage 섹션이 있는지 확인.
3. `package.json`의 `"main"`이 `"./out/extension.js"`인지 확인.
4. `"dependencies"` 항목이 `"ignore"` 패키지만 포함하는지 확인 (devDependencies 항목이 잘못 들어가지 않았는지).
5. `"license"` 필드 존재 확인.
6. 패키징된 VSIX 파일이 존재하는지 확인.
7. 문제 시 `Reviewer Feedback`에 기록 후 `DEV_REVISION`.
8. 승인 시 `TEST_PENDING`.

### Reviewer Feedback
*(Reviewer Agent가 거부 시 여기에 기록)*

---

## 🧪 Tester Agent Tasks

1. `npm run test:unit` — 전체 테스트 최종 통과 확인.
2. `npm run compile` — 오류 없음 확인.
3. `npm run package` — `.vsix` 파일 생성 확인.
4. **VSIX 내용 검증**: `unzip -l planex2-*.vsix` 로 압축 내용을 확인하여:
   - `extension/out/extension.js` 존재
   - `extension/package.json` 존재
   - `extension/README.md` 존재
   - `extension/src/` **없음** (소스코드 미포함 확인)
   - `extension/test/` **없음**
   - `extension/docs/` **없음**
5. VS Code Extension Development Host에서 수동으로 설치하고 `PlanEx2: Compare Folders` 명령이 실행되는지 확인 (가능한 경우).
6. 실패 시 `Test Failures`에 기록 후 `DEV_REVISION`.
7. **성공 시**:
   - Phase 7 → `DONE`
   - `docs/current_state.md` Status를 `🟢 ALL DONE` 으로 변경.
   - 아래 최종 메시지를 `current_state.md`에 추가:
     > "PlanEx2 v0.1.0 개발 완료. VSIX 패키지: `planex2-0.1.0.vsix`"

### Test Failures
*(Tester Agent가 실패 시 여기에 기록)*

---

## Definition of Done

- [ ] `.vscodeignore` 작성 완료
- [ ] `README.md` 7개 섹션 포함
- [ ] `package.json` 최종 필드 모두 포함
- [ ] `npm run compile` 성공
- [ ] `npm run package` 성공 — `.vsix` 생성
- [ ] VSIX 내용에 `src/`, `test/`, `docs/` 미포함 확인
- [ ] 전체 `npm run test:unit` 최종 통과

---

## State Logs

- **2026-03-13** - Job 07 생성. Architect에 의해 초기화됨.
- **2026-03-13** [Developer] - 구현 완료.
  - `.vscodeignore` 작성: test/, src/, docs/, node_modules/, out-test/ 제외.
  - `README.md` 작성: Features, Usage, Merge Directions, Conflict Handling, Ignore Rules, Keyboard Shortcuts, Requirements, Known Limitations 섹션 포함.
  - `package.json` 최종: license MIT, repository, keywords, galleryBanner 추가.
  - `npm run compile` → 성공. `out/` 디렉토리 전체 파일 생성 확인.
  - `npm run package` → `planex2-0.1.0.vsix` (38.71 KB, 44 files) 생성.
- **2026-03-13** [Reviewer — Fast-track] - .vscodeignore에 src/, test/, docs/ 포함 확인. package.json main `./out/extension.js` 확인. dependencies에 `ignore` 패키지만 있음 확인. license MIT 확인. 승인.
- **2026-03-13** [Tester — Fast-track] - `npm run test:unit` 61/61 통과. `npm run compile` 성공. `npm run package` 성공. VSIX 내용 확인: extension/src/, extension/test/, extension/docs/ 미포함 확인. Phase 7 → **DONE**.
- **2026-03-13** [Post-release Hotfix] - UX 버그 8개 수정 후 재빌드. `planex2-0.1.0.vsix` (40.73 KB) 갱신. ADR-0008 작성.
- **2026-03-13** [Post-release Hotfix] - showOpenDialog → QuickPick 폴더 선택기로 교체 후 재빌드. `planex2-0.1.0.vsix` (42.06 KB) 갱신. ADR-0009 작성.
