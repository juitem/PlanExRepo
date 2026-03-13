# ADR-0002: Extension Activation Strategy

**날짜**: 2026-03-13
**상태**: Accepted
**작성자**: Developer Agent (Phase 1)

---

## Context

VS Code Extension은 사용자가 실제로 필요로 할 때만 활성화되어야 합니다 (성능 최적화). `activationEvents`는 어떤 이벤트에서 Extension을 로드할지 결정합니다.

## Decision

`onView:planex2Tree`와 `onCommand:planex2.compareFolders` 두 이벤트 모두에서 활성화합니다.

## Rationale

- `onView:planex2Tree`: 사용자가 사이드바 패널을 클릭할 때 자동 활성화 → TreeView가 즉시 사용 가능
- `onCommand:planex2.compareFolders`: Command Palette에서 직접 실행 시 활성화

## Alternatives Considered

| 대안 | 거부 이유 |
|---|---|
| `*` (항상 활성화) | 불필요한 메모리/CPU 사용 |
| `onCommand`만 | 사이드바 클릭 시 TreeView가 비어 보임 |
| `onStartupFinished` | VS Code 시작마다 로드 — 과도함 |
