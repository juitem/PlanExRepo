# PROJECT_OVERVIEW — 프로젝트 개요

> **Knowledge 유형**: stable
> **갱신 조건**: 프로젝트 목표 또는 핵심 기술 방향 변경 시 (ADR 필수)

---

## 프로젝트 정의

**PlanEx3**는 Visual Studio Code에서 동작하는 **폴더 비교/병합 확장 플러그인**이다.

개발자가 두 개의 폴더 구조를 시각적으로 비교하고, 원하는 파일을 선택적으로 병합할 수 있도록 지원한다. 추가로 파일 단위 diff 및 병합 기능도 제공한다.

---

## 핵심 기능 요약

| 기능 | 설명 |
|------|------|
| 폴더 비교 | 두 폴더의 파일/디렉토리 구조를 트리 형식으로 비교 |
| 폴더 병합 | 한 폴더의 내용을 다른 폴더로 선택적 병합 |
| 파일 diff | 동일 경로의 두 파일을 줄 단위로 비교 |
| 파일 병합 | 두 파일의 변경 내용을 3-way 또는 수동 병합 |
| 충돌 해결 | 병합 충돌을 사용자가 직접 해결하는 인터페이스 |

---

## 기술 스택 (예정)

| 영역 | 기술 |
|------|------|
| 플랫폼 | Visual Studio Code Extension API |
| 언어 | TypeScript |
| 빌드 | esbuild / webpack (결정 예정) |
| 테스트 | Mocha + VS Code Extension Test Runner |
| UI | VS Code WebView / TreeView API |
| 패키지 관리 | npm |

> 기술 스택 확정은 ADR-0002 참고

---

## 개발 방식

이 프로젝트는 **AI 에이전트 오케스트레이션** 방식으로 개발된다:

- 여러 AI 에이전트가 역할을 나눠 순차/병렬로 작업한다
- 에이전트는 대화 기록 없이 문서만으로 작업을 이어받을 수 있어야 한다
- 모든 상태, 결정, 산출물은 `PlanEx3/docs/` 에 문서화한다
- 중단과 재개가 반복되어도 안정적으로 개발이 이어진다

---

## 개발 단계 개요

```
Phase 0: 문서 운영체계 설계  ← [현재 완료]
Phase 1: Foundation          환경 설정, 프로젝트 구조, 기본 문서
Phase 2: Core Engine         비교/병합 엔진 구현
Phase 3: UI Layer            VS Code UI 구성요소 구현
Phase 4: Integration         통합, 테스트, 패키지
```

---

## 타겟 사용자

- VS Code를 주 개발 도구로 사용하는 개발자
- 프로젝트 폴더 구조를 자주 비교/동기화하는 작업을 하는 사람
- Git 이외의 방법으로 파일/폴더를 비교하고 싶은 사람

---

## 성공 기준

1. VS Code Marketplace 에 게시 가능한 상태의 확장 프로그램
2. 두 폴더를 선택하고 차이를 트리로 시각화할 수 있음
3. 원하는 파일을 선택해 한쪽으로 복사/병합할 수 있음
4. 텍스트 파일의 내용을 diff 뷰로 비교할 수 있음
5. 충돌 발생 시 사용자가 해결할 수 있는 UI 제공

---

## 관련 문서

- `stable/GOALS_AND_SCOPE.md` — 상세 목표와 범위
- `stable/USER_SCENARIOS.md` — 사용자 시나리오
- `decisions/ADR-0001-doc-based-devops.md` — 개발 운영체계 결정
- `decisions/ADR-0002-vscode-architecture.md` — 아키텍처 결정
