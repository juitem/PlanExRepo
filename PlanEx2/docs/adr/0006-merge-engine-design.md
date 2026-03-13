# ADR-0006: Merge Engine Design

**날짜**: 2026-03-13
**상태**: Accepted
**작성자**: Developer Agent (Phase 5)

---

## Decision

- 양방향 머지 지원 (`direction: 'toTarget' | 'toSource'`)
- DELETED 파일 처리: 폴더 머지 시 사용자에게 선택지 제공 (기본 건너뜀)
- CONFLICT 파일: 즉시 `'conflict'` 반환, 절대 자동 머지 금지 (RULE-004)
- MergeAdapter 인터페이스 주입으로 vscode 없이 단위 테스트 가능

## Rationale

- 양방향 지원: Source → Target뿐 아니라 Target → Source 워크플로도 실용적
- DELETED 옵션 질의: 의도치 않은 삭제 방지
