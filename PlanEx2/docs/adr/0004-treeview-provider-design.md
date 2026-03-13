# ADR-0004: TreeView Provider Design

**날짜**: 2026-03-13
**상태**: Accepted
**작성자**: Developer Agent (Phase 3)

---

## Context

VS Code TreeDataProvider를 어떤 구조로 구현할지 결정합니다.

## Decision

- `DiffTreeProvider` (TreeDataProvider 구현) + `DiffTreeItem` (TreeItem 확장) 분리
- 상태는 `DiffTreeProvider` 클래스 내부 속성으로 관리
- `showUnchanged: boolean` 토글로 UNCHANGED 파일 표시/숨김 제어

## Rationale

- 역할 분리: Provider는 데이터 공급, Item은 표현만 담당
- 클래스 내부 상태: extension.ts와 상태 공유 없이 캡슐화 유지

## Consequences

- `markAsUnchanged()`로 머지 완료 파일을 재비교 없이 UI 갱신 가능
