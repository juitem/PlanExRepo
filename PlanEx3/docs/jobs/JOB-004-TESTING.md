# JOB-004 — TESTING & RELEASE

---

## Job 메타데이터

```yaml
job_id: JOB-004
job_name: Testing & Release (테스트, 통합, 배포)
status: NOT_STARTED
priority: HIGH
assigned_role: TESTER (테스트) + IMPLEMENTER (버그 수정) + DOCUMENTER (문서)
started_at: ~
completed_at: ~
last_updated: 2026-03-15
```

---

## 목적

모든 기능을 통합 테스트하고 배포 가능한 VS Code Extension 패키지를 생성한다.

---

## 선행조건

- [ ] JOB-001, JOB-002, JOB-003 모두 COMPLETED
- [ ] `tests/TEST_STRATEGY.md` 작성 완료
- [ ] 단위 테스트 커버리지 80% 이상 (JOB-002에서 달성)

---

## Phase 4-1: 통합 테스트

**담당 에이전트**: TESTER

| Step | 내용 | 상태 | 산출물 |
|------|------|------|--------|
| 4-1-1 | VS Code Extension 통합 테스트 환경 설정 | `TODO` | test/integration/ |
| 4-1-2 | UC-001 시나리오 자동화 테스트 | `TODO` | test/integration/uc001.test.ts |
| 4-1-3 | UC-002 시나리오 자동화 테스트 | `TODO` | test/integration/uc002.test.ts |
| 4-1-4 | UC-003 시나리오 자동화 테스트 | `TODO` | test/integration/uc003.test.ts |
| 4-1-5 | 엣지 케이스 통합 테스트 (빈 폴더, 권한 없는 파일 등) | `TODO` | test/integration/ |

**Phase 4-1 완료 조건**:
- [ ] 통합 테스트 전체 통과
- [ ] 버그 발견 시 `working/ACTIVE_ISSUES.md` 에 등록 + IMPLEMENTER 에게 수정 요청

---

## Phase 4-2: 성능 검증

**담당 에이전트**: TESTER

| Step | 내용 | 상태 | 산출물 |
|------|------|------|--------|
| 4-2-1 | NFR-101 검증: 10,000 파일 5초 이내 비교 | `TODO` | 성능 테스트 결과 |
| 4-2-2 | NFR-103 검증: 메모리 200MB 이하 | `TODO` | 메모리 프로파일 |
| 4-2-3 | 성능 기준 미달 시 병목 분석 + IMPLEMENTER 에게 최적화 요청 | `TODO` | 성능 분석 보고서 |

---

## Phase 4-3: 패키지 및 배포 준비

**담당 에이전트**: DOCUMENTER + IMPLEMENTER

| Step | 내용 | 상태 | 산출물 |
|------|------|------|--------|
| 4-3-1 | `README.md` 작성 (설치, 사용법, 스크린샷) | `TODO` | README.md |
| 4-3-2 | `CHANGELOG.md` 작성 (v0.1.0 변경 이력) | `TODO` | CHANGELOG.md |
| 4-3-3 | `package.json` 버전, 설명, 카테고리 최종화 | `TODO` | package.json |
| 4-3-4 | `.vscodeignore` 최종화 | `TODO` | .vscodeignore |
| 4-3-5 | `vsce package` 실행 | `TODO` | planex3-0.1.0.vsix |
| 4-3-6 | 생성된 .vsix 파일 로컬 설치 테스트 | `TODO` | 설치 확인 |
| 4-3-7 | 최종 수동 테스트 체크리스트 통과 | `TODO` | 체크리스트 |

**Phase 4-3 완료 조건**:
- [ ] .vsix 파일 생성 성공
- [ ] 로컬 VS Code 에 설치 성공
- [ ] 핵심 사용자 시나리오 (UC-001~004) 수동 테스트 통과

---

## 수동 테스트 체크리스트

```
□ Command Palette 에서 "PlanEx3: Compare Folders" 실행
□ 폴더 선택 다이얼로그 표시
□ 비교 결과 TreeView 표시
□ ADDED 파일 아이콘 표시
□ DELETED 파일 아이콘 표시
□ MODIFIED 파일 아이콘 표시
□ MODIFIED 파일 클릭 → diff 뷰 열림
□ 파일 우측 복사 버튼 동작
□ 복사 확인 다이얼로그 표시
□ 복사 후 상태 업데이트 (SAME 으로 변경)
□ Light 테마 UI 정상
□ Dark 테마 UI 정상
□ Explorer 컨텍스트 메뉴 표시
□ 빈 폴더 비교 시 오류 없음
□ 권한 없는 파일 접근 시 graceful 오류 처리
```

---

## Job 완료 조건 (Definition of Done)

- [ ] 통합 테스트 전체 통과
- [ ] 성능 기준 충족
- [ ] .vsix 파일 생성 성공
- [ ] 수동 테스트 체크리스트 100% 통과
- [ ] README.md, CHANGELOG.md 완성

---

## 관련 문서

- `tests/TEST_STRATEGY.md`
- `stable/NONFUNCTIONAL_REQUIREMENTS.md`
- `stable/USER_SCENARIOS.md`
