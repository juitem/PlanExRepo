# ADR-0005: Diff Navigation Design

**날짜**: 2026-03-13
**상태**: Accepted
**작성자**: Developer Agent (Phase 4)

---

## Decision

- ADDED 파일의 Source URI: `untitled:` 스킴 사용
- Navigator 상태: `DiffNavigator` 클래스로 캡슐화
- Hunk 네비게이션: `editor.action.moveCaretToNextChange` wrapping

## Rationale

- `untitled:` 스킴: 임시 파일 생성/정리 부담 없음
- `DiffNavigator` 클래스: 단일 책임 원칙, 테스트 용이성
