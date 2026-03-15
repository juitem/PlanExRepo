# ARCHITECTURE_PRINCIPLES — 아키텍처 원칙

> **Knowledge 유형**: stable
> **갱신 조건**: 핵심 아키텍처 방향 변경 시 반드시 ADR 먼저 생성

---

## 핵심 원칙

### P1. 레이어 분리 (Separation of Concerns)

```
┌─────────────────────────────────────┐
│           VS Code Layer             │  Extension API, Commands, Views
├─────────────────────────────────────┤
│            UI Layer                 │  WebView, TreeView, Panels
├─────────────────────────────────────┤
│         Application Layer           │  Use Cases, Orchestration
├─────────────────────────────────────┤
│           Domain Layer              │  비교/병합 핵심 로직
├─────────────────────────────────────┤
│        Infrastructure Layer         │  파일 시스템, OS I/O
└─────────────────────────────────────┘
```

- 각 레이어는 바로 아래 레이어에만 의존한다
- 도메인 레이어는 VS Code API에 의존하지 않는다 (테스트 가능성)
- VS Code API 의존성은 최상위 레이어에만 국한한다

### P2. 도메인 순수성

- 비교/병합 엔진(Domain Layer)은 순수 TypeScript로 작성한다
- VS Code, Node.js fs 모듈 직접 의존 금지 → 인터페이스로 추상화
- 이를 통해 단위 테스트를 VS Code 없이 실행 가능하게 한다

### P3. 단방향 데이터 흐름

```
User Action → Command → Application Layer → Domain Layer → Result
                                                              ↓
                                                    UI Update (단방향)
```

- 상태 변경은 단방향으로 흐른다
- UI는 상태를 직접 변경하지 않는다 (명령을 통해서만)

### P4. 실패 안전성 (Fail-Safe)

- 파일 복사/병합 작업은 원본 파일을 수정하기 전에 대상 파일을 먼저 준비한다
- 오류 발생 시 파티셜 상태로 남기지 않는다 (atomic operation)
- 모든 파일 I/O에 에러 핸들링을 명시적으로 작성한다

### P5. 테스트 가능성

- 모든 핵심 비즈니스 로직은 의존성 주입으로 테스트 가능하게 설계한다
- VS Code API 의존성은 Mock/Stub 가능한 인터페이스로 추상화한다
- 테스트는 VS Code 환경 없이도 실행되어야 한다 (핵심 로직)

### P6. 확장 가능성

- 새로운 비교 전략(파일 크기, 해시, 날짜 등)을 Strategy 패턴으로 추가 가능
- 새로운 병합 전략을 Strategy 패턴으로 추가 가능
- 새로운 UI 뷰를 기존 코어 로직 수정 없이 추가 가능

---

## 금지 패턴

| 패턴 | 이유 |
|------|------|
| Domain Layer에서 직접 VS Code API 호출 | 테스트 불가, 결합도 증가 |
| 전역 변수로 상태 관리 | 예측 불가능, 테스트 어려움 |
| 레이어 건너뛰기 (UI → Domain 직접 호출) | 레이어 원칙 위반 |
| 동기식 대용량 파일 읽기 | VS Code 메인 스레드 차단 |
| 하드코딩된 경로 | 크로스 플랫폼 호환성 파괴 |

---

## 모듈 경계 정의

```
src/
├── extension.ts          ← VS Code 진입점 (activate/deactivate)
├── commands/             ← Command 등록 및 라우팅 (VS Code Layer)
├── views/                ← TreeView, WebView, Panel (UI Layer)
├── application/          ← Use Case 오케스트레이션 (Application Layer)
├── domain/               ← 비교/병합 핵심 로직 (Domain Layer)
│   ├── comparison/       ← 폴더/파일 비교 엔진
│   ├── merge/            ← 병합 엔진
│   └── models/           ← 도메인 모델 (CompareResult, MergeResult 등)
└── infrastructure/       ← 파일 시스템 구현체 (Infrastructure Layer)
```

---

## 아키텍처 결정 추적

주요 아키텍처 결정은 ADR로 관리한다:

| 결정 | ADR |
|------|-----|
| 문서 기반 개발 운영체계 | ADR-0001 |
| Extension 아키텍처 방향 | ADR-0002 |

> 새로운 아키텍처 결정은 반드시 `decisions/ADR_TEMPLATE.md` 를 복사해 ADR로 문서화한다.
