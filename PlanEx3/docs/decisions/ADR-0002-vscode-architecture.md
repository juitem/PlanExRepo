# ADR-0002 — VS Code Extension 레이어드 아키텍처 채택

## 메타데이터

| 항목 | 내용 |
|------|------|
| **ID** | ADR-0002 |
| **제목** | VS Code Extension 레이어드 아키텍처 채택 |
| **날짜** | 2026-03-15 |
| **상태** | `accepted` |
| **결정자** | ARCHITECT |
| **관련 Job** | JOB-001, JOB-002 |
| **관련 Phase** | Phase 1 (Foundation) |

---

## Context (맥락)

VS Code Extension을 개발할 때 VS Code API 의존성을 어떻게 처리할지 결정해야 한다. VS Code API는 테스트 환경에서 사용하기 어렵고, Extension Host 환경에서만 실행된다. 비즈니스 로직(비교/병합)을 VS Code API와 얼마나 분리할지가 핵심 문제다.

**해결해야 할 문제**:
- 비즈니스 로직을 VS Code 없이 단위 테스트하기 어려움
- VS Code API 변경 시 비즈니스 로직에 영향
- 코드가 VS Code API 호출과 비즈니스 로직이 뒤섞여 유지보수 어려움

---

## Decision (결정)

**4-레이어 아키텍처를 채택한다:**

```
VS Code Layer (commands, views)
      ↓
Application Layer (use cases)
      ↓
Domain Layer (comparison, merge engine)
      ↓
Infrastructure Layer (file system abstraction)
```

핵심 원칙:
- Domain Layer는 VS Code API를 직접 사용하지 않는다
- Infrastructure Layer는 `IFileSystem` 인터페이스로 추상화한다
- VS Code의 `workspace.fs` 는 Infrastructure Layer에서만 사용한다

---

## Rationale (근거)

1. **테스트 가능성**: Domain Layer 단위 테스트 시 VS Code 환경 불필요
2. **의존성 방향 제어**: 상위 레이어만 하위 레이어에 의존
3. **VS Code API 격리**: API 변경 시 VS Code Layer만 수정
4. **재사용성**: Domain Layer는 이론적으로 다른 에디터에서도 재사용 가능

---

## Alternatives Considered (검토한 대안)

### 대안 1: 플랫 구조 (모든 코드를 하나의 레이어)
- **설명**: Extension 코드를 레이어 구분 없이 작성
- **장점**: 단순함, 빠른 시작
- **단점**: 테스트 어려움, VS Code API와 비즈니스 로직 혼재
- **채택하지 않은 이유**: 유지보수성과 테스트 가능성이 크게 저하됨

### 대안 2: Clean Architecture (의존성 역전)
- **설명**: 도메인이 중심, 외부 의존성은 모두 인터페이스로
- **장점**: 완전한 도메인 독립성
- **단점**: VS Code Extension치고 과도한 복잡도
- **채택하지 않은 이유**: Extension 규모에 비해 오버엔지니어링

### 대안 3: VS Code API 직접 사용 (레이어 없음)
- **설명**: `vscode.workspace.fs` 를 도메인 코드에서 직접 사용
- **장점**: 코드 단순
- **단점**: 테스트 불가, 결합도 최고
- **채택하지 않은 이유**: 테스트 전략과 완전히 상충

---

## Consequences (결과 및 영향)

### 긍정적 영향
- Domain Layer 순수 단위 테스트 가능
- 레이어별 독립적인 개발 및 테스트
- VS Code API 변경에 대한 격리

### 부정적 영향 / 트레이드오프
- 초기 구조 설계에 시간 소요
- `IFileSystem` 인터페이스 유지 필요
- 레이어 간 데이터 변환 코드 필요

### 수용해야 할 제약
- Domain Layer에서 VS Code API 직접 import 금지
- Infrastructure Layer 구현체는 테스트용 Mock 제공 의무
- 레이어 경계를 넘는 직접 호출 금지

---

## Follow-up (후속 행동)

| 항목 | 담당 에이전트 | 기한/조건 |
|------|---------------|-----------|
| IFileSystem 인터페이스 설계 | ARCHITECT | JOB-001 Phase 1 |
| 레이어 디렉토리 구조 생성 | IMPLEMENTER | JOB-001 Phase 2 |
| Domain Layer 테스트 환경 설정 | IMPLEMENTER | JOB-001 Phase 2 |

---

## Related Documents

- `stable/ARCHITECTURE_PRINCIPLES.md` — 전체 아키텍처 원칙
- `stable/VSCODE_EXTENSION_STRUCTURE.md` — Extension 디렉토리 구조
- `interface/MODULE_CONTRACTS.md` — 모듈 간 인터페이스 계약
- `jobs/JOB-001-FOUNDATION.md` — Foundation Job

---

## 갱신 이력

| 날짜 | 갱신자 | 상태 변경 | 내용 |
|------|--------|-----------|------|
| 2026-03-15 | ARCHITECT | proposed → accepted | 초안 작성 및 채택 |
