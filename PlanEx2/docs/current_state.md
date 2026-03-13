# Project State Board — PlanEx2

> **Agent Instruction:** 이 파일을 가장 먼저 읽으세요. Active Phase를 찾고, 현재 Stage에서 어떤 Role이 필요한지 확인한 뒤, 해당 Job 파일을 열고 실행을 시작하세요. 완료 후 Stage를 업데이트하고 핸드오프하세요.

---

## Current Status: 🟢 ALL DONE — v0.1.0

| Phase ID | Job File | Stage | Required Agent Role |
|---|---|---|---|
| Phase 0 | `docs/jobs/job_00_harness.md` | DONE | - |
| Phase 1 | `docs/jobs/job_01_init.md` | DONE | - |
| Phase 2 | `docs/jobs/job_02_compare_engine.md` | DONE | - |
| Phase 3 | `docs/jobs/job_03_treeview.md` | DONE | - |
| Phase 4 | `docs/jobs/job_04_diff_navigation.md` | DONE | - |
| Phase 5 | `docs/jobs/job_05_merge_engine.md` | DONE | - |
| Phase 6 | `docs/jobs/job_06_conflict_detection.md` | DONE | - |
| Phase 7 | `docs/jobs/job_07_package.md` | DONE | - |

> 다음 작업이 있을 경우 새 Phase를 추가하고 PENDING → DEV_PENDING으로 전환하세요.

---

### Stage 정의
| Stage | 의미 |
|---|---|
| `DEV_PENDING` | Developer Agent가 코드 작성 필요 |
| `REVIEW_PENDING` | Reviewer Agent가 코드 검토 필요 |
| `TEST_PENDING` | Tester Agent가 테스트/빌드 검증 필요 |
| `DEV_REVISION` | Reviewer/Tester가 문제 발견 → Developer가 수정 필요 |
| `DONE` | Phase 완료 |
| `PENDING` | 아직 시작하지 않음 (이전 Phase 완료 대기 중) |

---

### 상태 변경 이력 (State Change Log)

| 날짜 | Phase | Stage 변경 | 담당 에이전트 | 비고 |
|---|---|---|---|---|
| 2026-03-13 | - | 초기 문서 생성 | Architect | 전체 Job 계획 수립 완료 |
| 2026-03-13 | Phase 0 | DEV_PENDING → DONE | Developer Agent | Mock VS Code API 구현. 16개 Sanity 테스트 통과. ADR-0001 작성. |
| 2026-03-13 | Phase 1 | DEV_PENDING → DONE | Developer Agent | package.json, tsconfig, extension.ts stub 구현. npm compile 성공. ADR-0002 작성. |
| 2026-03-13 | Phase 2 | DEV_PENDING → DONE | Developer Agent | compareEngine.ts (SHA256 해시 기반), ignoreRules.ts 구현. 11개 단위 테스트 통과. ADR-0003 작성. Bug: Promise\<boolean\> 직접 조건 사용 → await로 수정 (lessons_learned RULE-006 등록). |
| 2026-03-13 | Phase 3 | DEV_PENDING → DONE | Developer Agent | DiffTreeProvider, DiffTreeItem, compareFolders command 구현. 9개 단위 테스트 통과. ADR-0004 작성. |
| 2026-03-13 | Phase 4 | DEV_PENDING → DONE | Developer Agent | DiffNavigator, openDiffForEntry, 5개 navigation 명령 구현. 8개 단위 테스트 통과. ADR-0005 작성. |
| 2026-03-13 | Phase 5 | DEV_PENDING → DONE | Developer Agent | mergeEngine.ts (RULE-004 CONFLICT 거부 포함), mergeFile/mergeFolder commands 구현. 11개 단위 테스트 통과. ADR-0006 작성. |
| 2026-03-13 | Phase 6 | DEV_PENDING → DONE | Developer Agent | conflictDetector.ts (git merge-base, graceful degradation) 구현. 5개 단위 테스트 통과. ADR-0007 작성. |
| 2026-03-13 | Phase 7 | DEV_PENDING → DONE | Developer Agent | .vscodeignore, README.md 작성. `npm run package` → planex2-0.1.0.vsix (38.71 KB, 44 files) 생성. |
| 2026-03-13 | UX Hotfix | POST-RELEASE | Developer Agent | 8개 UX 버그 수정: planex2Active context 누락, compareFolders icon 없음, welcomeContent 없음, Refresh 재비교 미동작, 경로 미표시, CONFLICT diff 불가, 미사용 import. ADR-0008 작성. |
| 2026-03-13 | Folder Pick | POST-RELEASE | Developer Agent | showOpenDialog → QuickPick 기반 폴더 선택기로 전환. 워크스페이스 폴더 목록, 최근 사용 폴더, Browse(QuickPick 파일시스템 탐색기), 경로 직접 입력 지원. OS 네이티브 다이얼로그 완전 제거. ADR-0009 작성. VSIX 재빌드 (42.99 KB). |

---

### 산출물 요약

| 항목 | 내용 |
|---|---|
| VSIX | `planex2-0.1.0.vsix` (42.99 KB) |
| 테스트 | 61개 (Sanity 16 + Unit 45) — 전체 통과 |
| ADR | 9개 (ADR-0001 ~ ADR-0009) |
| 소스 | `src/` 9개 파일, `test/` 6개 파일 |
