# ADR-0007: Conflict Detection Strategy

**날짜**: 2026-03-13
**상태**: Accepted
**작성자**: Developer Agent (Phase 6)

---

## Decision

- Git `merge-base` 활용: 공통 조상 이후 양쪽 모두 변경된 파일을 CONFLICT로 마킹
- Graceful degradation: git 없거나 저장소 아닌 경우 조용히 건너뜀
- 에러 로그: Output Channel에만 기록, 사용자 팝업 없음

## Rationale

- git merge-base가 가장 정확하고 표준적인 방법
- UX: git 관련 오류를 팝업으로 방해하지 않음

## Consequences

- git이 없는 환경에서도 기본 비교/머지 기능은 완전히 동작
