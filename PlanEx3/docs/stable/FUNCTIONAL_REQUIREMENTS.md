# FUNCTIONAL_REQUIREMENTS — 기능 요구사항

> **Knowledge 유형**: stable
> **갱신 조건**: 기능 추가/변경/삭제 시 (범위 변경이면 GOALS_AND_SCOPE.md 도 함께 갱신)

---

## 요구사항 상태

```
PROPOSED  : 제안됨, 미확정
ACCEPTED  : 확정됨
DEFERRED  : 다음 버전으로 미룸
REJECTED  : 채택 안 함
```

---

## FR-1xx: 폴더 선택 및 비교

| ID | 요구사항 | 우선순위 | 상태 |
|----|----------|----------|------|
| FR-101 | 사용자는 두 개의 로컬 폴더를 선택할 수 있다 | P0 | ACCEPTED |
| FR-102 | 폴더 선택 UI는 VS Code 네이티브 파일 다이얼로그를 사용한다 | P0 | ACCEPTED |
| FR-103 | 최근 선택한 폴더 쌍을 최대 5개까지 기억한다 | P2 | PROPOSED |
| FR-104 | 비교 결과를 트리 구조로 표시한다 | P0 | ACCEPTED |
| FR-105 | 각 파일/디렉토리에 상태 아이콘을 표시한다 (ADDED/DELETED/MODIFIED/SAME) | P0 | ACCEPTED |
| FR-106 | 하위 디렉토리를 재귀적으로 비교한다 | P0 | ACCEPTED |
| FR-107 | 비교 진행 상황을 Progress Indicator로 표시한다 | P1 | ACCEPTED |
| FR-108 | 비교 완료 후 변경 파일 수 요약을 표시한다 | P1 | ACCEPTED |

---

## FR-2xx: 파일 복사 및 병합

| ID | 요구사항 | 우선순위 | 상태 |
|----|----------|----------|------|
| FR-201 | 개별 파일을 좌측 폴더에서 우측 폴더로 복사할 수 있다 | P0 | ACCEPTED |
| FR-202 | 개별 파일을 우측 폴더에서 좌측 폴더로 복사할 수 있다 | P0 | ACCEPTED |
| FR-203 | 여러 파일을 체크박스로 선택해 일괄 복사할 수 있다 | P1 | ACCEPTED |
| FR-204 | 복사 전 대상 파일 목록을 확인 다이얼로그로 표시한다 | P0 | ACCEPTED |
| FR-205 | 복사 성공/실패를 사용자에게 알린다 | P0 | ACCEPTED |
| FR-206 | 디렉토리 단위로 복사할 수 있다 | P1 | ACCEPTED |
| FR-207 | 복사 시 대상 경로의 중간 디렉토리가 없으면 자동 생성한다 | P0 | ACCEPTED |

---

## FR-3xx: 파일 Diff 뷰

| ID | 요구사항 | 우선순위 | 상태 |
|----|----------|----------|------|
| FR-301 | MODIFIED 파일을 클릭하면 diff 뷰를 열 수 있다 | P1 | ACCEPTED |
| FR-302 | diff 뷰는 줄 단위 추가/삭제/변경을 시각화한다 | P1 | ACCEPTED |
| FR-303 | diff 뷰는 VS Code 내장 diff editor를 활용한다 | P1 | ACCEPTED |
| FR-304 | 이진 파일은 diff 뷰 대신 "Binary file" 메시지를 표시한다 | P1 | ACCEPTED |

---

## FR-4xx: 파일 병합

| ID | 요구사항 | 우선순위 | 상태 |
|----|----------|----------|------|
| FR-401 | diff 뷰에서 변경 블록(hunk) 단위로 선택적 적용이 가능하다 | P1 | PROPOSED |
| FR-402 | 충돌 발생 시 충돌 마커를 표시한다 | P1 | PROPOSED |
| FR-403 | 충돌 해결 후 파일을 저장할 수 있다 | P1 | PROPOSED |
| FR-404 | 병합 결과 미리보기를 제공한다 | P2 | PROPOSED |

---

## FR-5xx: 필터링 및 무시 패턴

| ID | 요구사항 | 우선순위 | 상태 |
|----|----------|----------|------|
| FR-501 | 파일 확장자 기반 필터링을 지원한다 | P2 | PROPOSED |
| FR-502 | glob 패턴 기반 파일 무시를 지원한다 | P2 | PROPOSED |
| FR-503 | .gitignore 파일을 자동으로 인식하고 적용한다 | P2 | PROPOSED |
| FR-504 | 숨김 파일(. 으로 시작) 표시 여부를 토글할 수 있다 | P2 | PROPOSED |
| FR-505 | 파일 상태(ADDED/DELETED/MODIFIED/SAME)로 필터링할 수 있다 | P2 | PROPOSED |

---

## FR-6xx: VS Code 통합

| ID | 요구사항 | 우선순위 | 상태 |
|----|----------|----------|------|
| FR-601 | Command Palette에서 확장 기능을 실행할 수 있다 | P0 | ACCEPTED |
| FR-602 | Explorer 컨텍스트 메뉴에서 폴더 비교를 시작할 수 있다 | P1 | ACCEPTED |
| FR-603 | 키보드 단축키를 지원한다 | P2 | PROPOSED |
| FR-604 | 확장은 VS Code Light/Dark 테마를 자동으로 따른다 | P1 | ACCEPTED |
| FR-605 | 확장 설정을 VS Code Settings에서 구성할 수 있다 | P1 | PROPOSED |

---

## 요구사항 트레이서빌리티

| FR ID | 관련 User Scenario | 관련 Spec |
|-------|-------------------|-----------|
| FR-1xx | UC-001 | specs/FOLDER_COMPARISON_SPEC.md |
| FR-2xx | UC-002, UC-003 | specs/FOLDER_MERGE_SPEC.md |
| FR-3xx | UC-004 | specs/FILE_DIFF_SPEC.md |
| FR-4xx | UC-005 | specs/FILE_DIFF_SPEC.md, specs/CONFLICT_RESOLUTION_SPEC.md |
| FR-5xx | UC-006 | specs/FOLDER_COMPARISON_SPEC.md |
| FR-6xx | 전체 | stable/VSCODE_EXTENSION_STRUCTURE.md |
