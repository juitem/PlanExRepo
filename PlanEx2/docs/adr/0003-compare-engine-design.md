# ADR-0003: Compare Engine Design

**날짜**: 2026-03-13
**상태**: Accepted
**작성자**: Developer Agent (Phase 2)

---

## Context

두 폴더의 파일 차이를 탐지하기 위해 파일 변경 감지 방법과 탐색 알고리즘을 결정해야 합니다.

## Decision

- **파일 변경 감지**: SHA256 해시 비교
- **탐색 방식**: DFS (재귀)
- **의존성 주입**: FsAdapter 인터페이스를 파라미터로 주입

## Rationale

- SHA256은 mtime보다 정확 (파일 복사 시 mtime 보존 문제 회피)
- DFS는 TreeView 계층 구조와 자연스럽게 일치
- FsAdapter 주입으로 vscode 없이 단위 테스트 가능 (RULE-002)

## Alternatives Considered

| 대안 | 거부 이유 |
|---|---|
| mtime 비교 | 파일 복사 시 mtime이 유지될 수 있음 → 오탐 |
| 전체 내용 비교 | 해시와 동일한 I/O 비용 + 메모리 비효율 |
| BFS 탐색 | TreeView와 불일치, 구현 복잡도 증가 |
