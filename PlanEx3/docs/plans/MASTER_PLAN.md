# MASTER_PLAN — 마스터 개발 계획

> **Knowledge 유형**: stable (계획 변경 시 ADR 필요)
> **목적**: 전체 개발 여정의 로드맵. 에이전트가 현재 위치와 전체 맥락을 파악하는 기준

---

## 개발 전략 개요

이 프로젝트는 **Harness Engineering** 원칙을 기반으로, 각 작업 단위를 독립적인 입력/출력 계약으로 분해한다. 에이전트는 어느 지점에서 재진입해도 문서만으로 작업을 이어받을 수 있다.

```
개발 방식: AI 에이전트 오케스트레이션 (순차 + 필요 시 병렬)
문서 기반: 코드보다 문서가 먼저
재진입 보장: 대화 기록 없이 문서만으로 이어달리기
```

---

## 전체 Job 구조

```
JOB-001: FOUNDATION         환경, 구조, 기반 문서 확립
    Phase 1-1: 환경 설정     TypeScript, ESLint, 빌드 설정
    Phase 1-2: 프로젝트 구조  디렉토리 생성, extension.ts 기본 구조
    Phase 1-3: 인터페이스 설계 IFileSystem, 도메인 모델 인터페이스

JOB-002: CORE ENGINE        비교/병합 핵심 로직 구현
    Phase 2-1: 폴더 비교 엔진 FolderComparator
    Phase 2-2: 파일 비교 엔진 FileComparator, diff 로직
    Phase 2-3: 병합 엔진      FolderMerger, FileMerger
    Phase 2-4: 충돌 해결      ConflictResolver

JOB-003: UI LAYER           VS Code UI 구성요소
    Phase 3-1: TreeView 제공자 CompareTreeProvider
    Phase 3-2: Command 등록   compareFolders, mergeFolders
    Phase 3-3: 고급 UI       WebView 패널 (선택)

JOB-004: TESTING & RELEASE  테스트, 통합, 배포
    Phase 4-1: 단위 테스트    Domain Layer 커버리지 80%
    Phase 4-2: 통합 테스트    VS Code Extension 환경
    Phase 4-3: 패키지 & 배포  vsce 패키지, Marketplace 등록
```

---

## Job 의존성 그래프

```
JOB-001 (Foundation)
    ↓
JOB-002 (Core Engine)
    ↓         ↓
JOB-003   JOB-004 (테스트는 JOB-002 와 병렬 가능)
(UI)           ↓
    ↓      통합 테스트
JOB-004
(배포)
```

---

## 현재 진행 상태

| Job | 상태 | 시작일 | 완료일 |
|-----|------|--------|--------|
| JOB-001 | `NOT_STARTED` | — | — |
| JOB-002 | `NOT_STARTED` | — | — |
| JOB-003 | `NOT_STARTED` | — | — |
| JOB-004 | `NOT_STARTED` | — | — |

---

## 마일스톤 정의

| 마일스톤 | 조건 | 예상 도달 |
|----------|------|-----------|
| M0: 문서 운영체계 완성 | docs/ 패키지 생성 완료 | ✅ 완료 |
| M1: 개발 환경 준비 | JOB-001 완료 | — |
| M2: 비교 기능 동작 | JOB-002 Phase 2-1, 2-2 완료 + 테스트 통과 | — |
| M3: 병합 기능 동작 | JOB-002 Phase 2-3, 2-4 완료 + 테스트 통과 | — |
| M4: VS Code UI 동작 | JOB-003 완료 + 수동 테스트 통과 | — |
| M5: 배포 준비 완료 | JOB-004 완료, 패키지 생성 성공 | — |

---

## 개발 원칙 요약

```
1. 문서 먼저, 코드는 그 다음
2. ADR 없이 아키텍처 결정 금지
3. 각 Phase 완료 시 체크포인트 기록
4. 레이어 원칙 (ADR-0002) 준수
5. 테스트는 구현과 함께 (구현 완료 후 테스트 추가)
6. 중단 후 재개는 CURRENT_STATUS.md 기반
```

---

## 위험 요소

| 리스크 | 영향 | 대응 |
|--------|------|------|
| VS Code API 변경 | 중간 | API 레이어 격리 (ADR-0002) |
| 대용량 폴더 성능 | 높음 | 비동기 처리, 조기 성능 테스트 |
| 병합 충돌 해결 복잡도 | 높음 | 단계적 구현, P2로 시작 |
| 에이전트 문서 갱신 누락 | 높음 | 체크포인트 필수화 |

---

## 관련 문서

- `plans/WBS.md` — 상세 작업 분해 구조
- `jobs/JOB-001-FOUNDATION.md` — 첫 번째 Job 상세
- `working/CURRENT_STATUS.md` — 현재 상태
