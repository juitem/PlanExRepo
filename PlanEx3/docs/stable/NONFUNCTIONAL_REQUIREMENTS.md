# NONFUNCTIONAL_REQUIREMENTS — 비기능 요구사항

> **Knowledge 유형**: stable
> **갱신 조건**: 성능 기준 또는 품질 기준 변경 시

---

## NFR-1xx: 성능

| ID | 요구사항 | 기준값 | 상태 |
|----|----------|--------|------|
| NFR-101 | 폴더 비교 완료 시간 | 10,000 파일 기준 5초 이내 | ACCEPTED |
| NFR-102 | UI 렌더링 프레임레이트 | 60fps 이상 | ACCEPTED |
| NFR-103 | 메모리 사용량 | 200MB 이하 | ACCEPTED |
| NFR-104 | 확장 활성화 시간 | 1초 이내 | ACCEPTED |
| NFR-105 | 파일 복사 속도 | OS 파일 시스템 속도 대비 10% 이내 오버헤드 | ACCEPTED |
| NFR-106 | diff 뷰 표시 시간 | 1MB 이하 파일 기준 1초 이내 | ACCEPTED |

---

## NFR-2xx: 신뢰성

| ID | 요구사항 | 기준값 | 상태 |
|----|----------|--------|------|
| NFR-201 | 파일 복사 무결성 | 복사 전후 체크섬 일치 | ACCEPTED |
| NFR-202 | 비교 정확도 | 파일 상태 오분류 0% | ACCEPTED |
| NFR-203 | 예외 처리 | 권한 없는 파일 접근 시 graceful 처리 | ACCEPTED |
| NFR-204 | 충돌 없는 병합 | 데이터 손실 없는 병합 보장 | ACCEPTED |
| NFR-205 | 원본 보존 | 복사 작업이 원본을 수정하지 않음 | ACCEPTED |

---

## NFR-3xx: 사용성

| ID | 요구사항 | 기준 | 상태 |
|----|----------|------|------|
| NFR-301 | VS Code 네이티브 UX 패턴 준수 | VS Code UX Guidelines 준수 | ACCEPTED |
| NFR-302 | 상태 표시 직관성 | 아이콘만으로 상태 파악 가능 | ACCEPTED |
| NFR-303 | 오류 메시지 명확성 | 사용자가 원인과 해결책 이해 가능 | ACCEPTED |
| NFR-304 | 키보드 접근성 | 마우스 없이 주요 기능 사용 가능 | P2 |

---

## NFR-4xx: 유지보수성

| ID | 요구사항 | 기준 | 상태 |
|----|----------|------|------|
| NFR-401 | 코드 테스트 커버리지 | 핵심 비즈니스 로직 80% 이상 | ACCEPTED |
| NFR-402 | 모듈 분리 | 비교 엔진 / UI / VS Code API 레이어 분리 | ACCEPTED |
| NFR-403 | TypeScript strict mode | tsconfig strict: true | ACCEPTED |
| NFR-404 | 코드 스타일 일관성 | ESLint + Prettier 적용 | ACCEPTED |
| NFR-405 | 문서화 | 모든 public API JSDoc 작성 | P1 |

---

## NFR-5xx: 호환성

| ID | 요구사항 | 기준 | 상태 |
|----|----------|------|------|
| NFR-501 | VS Code 버전 | 1.80 이상 지원 (확정은 JOB-001) | PROPOSED |
| NFR-502 | 운영체제 | macOS, Windows, Linux | ACCEPTED |
| NFR-503 | Node.js | VS Code 내장 Node.js 버전 사용 | ACCEPTED |
| NFR-504 | 파일 시스템 인코딩 | UTF-8 기본, 기타 인코딩 graceful 처리 | P1 |

---

## NFR-6xx: 보안

| ID | 요구사항 | 기준 | 상태 |
|----|----------|------|------|
| NFR-601 | 워크스페이스 신뢰 모델 준수 | VS Code Workspace Trust API 사용 | ACCEPTED |
| NFR-602 | 경로 순회 공격 방지 | 선택된 폴더 외부 경로 접근 금지 | ACCEPTED |
| NFR-603 | 민감 정보 처리 | 파일 내용을 외부로 전송하지 않음 | ACCEPTED |

---

## 비기능 요구사항 검증 방법

| NFR 범주 | 검증 방법 |
|----------|-----------|
| 성능 | 자동화 벤치마크 테스트 (tests/TEST_STRATEGY.md) |
| 신뢰성 | 단위 테스트 + 통합 테스트 |
| 사용성 | 수동 UX 검토 + VS Code UX Guidelines 체크리스트 |
| 유지보수성 | CI 커버리지 리포트, ESLint 검사 |
| 호환성 | 다중 플랫폼 CI 환경 테스트 |
| 보안 | 코드 리뷰 + OWASP 체크리스트 |
