# ADR-0001: Mock VS Code API 전략

**날짜**: 2026-03-13
**상태**: Accepted
**작성자**: Developer Agent (Phase 0)

---

## Context (배경)

VS Code Extension의 비즈니스 로직을 단위 테스트하려면 `vscode` 모듈이 필요합니다. 그러나 `vscode` 모듈은 VS Code Extension Host 프로세스에서만 로드되므로, 일반 Node.js 환경(Mocha 테스트 런너 등)에서 `import * as vscode from 'vscode'`를 실행하면 런타임 오류가 발생합니다.

## Decision (결정)

`test/harness/mockVscode.ts`에 VS Code API의 Mock 구현체를 작성하고, **의존성 주입(Dependency Injection)** 방식으로 비즈니스 로직에 전달합니다.

- `compareEngine.ts`, `mergeEngine.ts` 등 핵심 모듈은 `vscode`를 직접 import하지 않고, `FsAdapter`/`MergeAdapter` 인터페이스를 파라미터로 받습니다.
- 테스트에서는 Mock 어댑터를 주입하고, 실제 Extension 코드에서는 `vscode.workspace.fs`를 래핑한 어댑터를 주입합니다.

## Rationale (근거)

- **테스트 가능성**: Mock을 사용하면 실제 파일 시스템 대신 임시 디렉토리를 사용해 빠르고 격리된 테스트가 가능합니다.
- **단순성**: Mock 파일 하나로 모든 단위 테스트를 지원합니다.
- **유지보수**: `vscode` API가 변경되면 Mock만 업데이트하면 됩니다.

## Alternatives Considered (고려한 대안들)

| 대안 | 장점 | 거부 이유 |
|---|---|---|
| `jest.mock('vscode')` | 설정 간편 | Jest 의존성 추가, 기존 Mocha 기반과 불일치 |
| `proxyquire` | require 시점 교체 가능 | 추가 라이브러리, 타입 지원 미흡 |
| `@vscode/test-electron` | 실제 VS Code 환경 | 느림, CI 환경 설정 복잡 |
| Module alias (`tsconfig-paths`) | 빌드 타임 치환 | 런타임 동작 불투명, 복잡도 증가 |

## Consequences (예상 결과)

**긍정적:**
- 모든 핵심 비즈니스 로직을 순수 단위 테스트로 커버 가능
- VS Code 없이 빠른 CI 실행

**부정적 / 트레이드오프:**
- Mock이 실제 VS Code API와 100% 동일하지 않을 수 있음 (e.g., 에러 처리 차이)
- Mock 유지 관리 부담

## Implementation Notes (구현 메모)

- Mock 파일 위치: `test/harness/mockVscode.ts`
- `workspace.fs`는 실제 Node.js `fs/promises`로 구현 (진짜 파일 I/O 수행)
- `window` 메서드는 Spy 패턴 (호출 내용을 `_log` 배열에 기록)
- `EventEmitter`는 실제 이벤트 발행 구현 (dispose 후 발행 차단)
