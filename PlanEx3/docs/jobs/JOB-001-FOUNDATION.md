# JOB-001 — FOUNDATION

---

## Job 메타데이터

```yaml
job_id: JOB-001
job_name: Foundation (개발 환경 및 기반 구조)
status: NOT_STARTED
priority: HIGH
assigned_role: IMPLEMENTER (설계는 ARCHITECT)
started_at: ~
completed_at: ~
last_updated: 2026-03-15
```

---

## 목적

VS Code Extension 개발을 시작하기 위한 모든 기반을 확립한다.
- TypeScript 빌드 환경
- Extension 기본 구조 (Hello World 수준)
- 테스트 환경
- 도메인 인터페이스 설계

이 Job 이 완료되면 JOB-002 에서 Core Engine 구현을 즉시 시작할 수 있다.

---

## 선행조건

- [x] `decisions/ADR-0002-vscode-architecture.md` 가 `accepted` 상태
- [x] `stable/VSCODE_EXTENSION_STRUCTURE.md` 작성 완료
- [x] `interface/MODULE_CONTRACTS.md` 초안 작성 완료

---

## 입력

| 입력 | 위치 | 필수 여부 |
|------|------|-----------|
| VS Code Extension 아키텍처 결정 | decisions/ADR-0002-vscode-architecture.md | 필수 |
| Extension 구조 계획 | stable/VSCODE_EXTENSION_STRUCTURE.md | 필수 |
| 아키텍처 원칙 | stable/ARCHITECTURE_PRINCIPLES.md | 필수 |
| 비기능 요구사항 | stable/NONFUNCTIONAL_REQUIREMENTS.md | 참고 |

---

## Phase 1-1: 환경 설정

**목적**: TypeScript + VS Code Extension 빌드/실행 환경 구성

**담당 에이전트**: IMPLEMENTER

| Step | 내용 | 상태 | 산출물 |
|------|------|------|--------|
| 1-1-1 | `npm init` 및 VS Code Extension 의존성 설치 | `TODO` | package.json |
| 1-1-2 | `tsconfig.json` 작성 (strict mode 활성화) | `TODO` | tsconfig.json |
| 1-1-3 | ESLint + Prettier 설정 | `TODO` | .eslintrc.json, .prettierrc |
| 1-1-4 | esbuild 번들러 설정 (또는 webpack — ADR-0003 으로 결정) | `TODO` | esbuild.js |
| 1-1-5 | `.vscodeignore`, `.gitignore` 작성 | `TODO` | .vscodeignore, .gitignore |

**에이전트 실행 지시 (Step 1-1-4 전)**:
> Step 1-1-4 시작 전, 번들러 선택이 필요하면 ARCHITECT 에게 ADR-0003 생성 요청

**Phase 1-1 완료 조건**:
- [ ] `npm run compile` 오류 없이 실행
- [ ] ESLint 검사 통과 (경고 없음)

**Phase 1-1 실패 조건**:
- 빌드 실패: 오류 메시지를 `working/ACTIVE_ISSUES.md` 에 기록 후 ORCHESTRATOR 에게 보고

---

## Phase 1-2: 프로젝트 구조 생성

**목적**: `src/` 디렉토리 구조 및 진입점 파일 생성

**담당 에이전트**: IMPLEMENTER

| Step | 내용 | 상태 | 산출물 |
|------|------|------|--------|
| 1-2-1 | `src/extension.ts` — activate/deactivate 기본 구조 | `TODO` | src/extension.ts |
| 1-2-2 | `src/commands/` — 빈 모듈 stub | `TODO` | src/commands/index.ts |
| 1-2-3 | `src/views/` — 빈 모듈 stub | `TODO` | src/views/ |
| 1-2-4 | `src/application/` — 빈 Use Case stub | `TODO` | src/application/ |
| 1-2-5 | `src/domain/` — 빈 도메인 모듈 stub | `TODO` | src/domain/ |
| 1-2-6 | `src/infrastructure/` — 빈 인프라 stub | `TODO` | src/infrastructure/ |
| 1-2-7 | `test/` 디렉토리 구조 + Mocha 설정 | `TODO` | test/, .mocharc.json |
| 1-2-8 | Hello World Command 등록 및 VS Code 에서 동작 확인 | `TODO` | package.json, extension.ts |

**Phase 1-2 완료 조건**:
- [ ] VS Code 에서 Extension 을 F5 로 실행 가능
- [ ] "Hello World" Command 가 Command Palette 에 표시됨
- [ ] 디렉토리 구조가 `stable/VSCODE_EXTENSION_STRUCTURE.md` 와 일치

---

## Phase 1-3: 인터페이스 설계

**목적**: Domain Layer 가 의존할 추상화 인터페이스를 정의한다

**담당 에이전트**: ARCHITECT (설계) → IMPLEMENTER (코드화)

| Step | 내용 | 상태 | 산출물 |
|------|------|------|--------|
| 1-3-1 | `IFileSystem` 인터페이스 설계 및 작성 | `TODO` | src/infrastructure/interfaces/IFileSystem.ts |
| 1-3-2 | `FileEntry` 도메인 모델 작성 | `TODO` | src/domain/models/FileEntry.ts |
| 1-3-3 | `CompareResult` 도메인 모델 작성 | `TODO` | src/domain/models/CompareResult.ts |
| 1-3-4 | `MergeResult` 도메인 모델 작성 | `TODO` | src/domain/models/MergeResult.ts |
| 1-3-5 | `interface/MODULE_CONTRACTS.md` 갱신 | `TODO` | interface/MODULE_CONTRACTS.md |
| 1-3-6 | Node.js fs 기반 `FileSystemService` 구현체 작성 | `TODO` | src/infrastructure/FileSystemService.ts |
| 1-3-7 | 테스트용 `MockFileSystem` 작성 | `TODO` | test/mocks/MockFileSystem.ts |

**Phase 1-3 완료 조건**:
- [ ] `IFileSystem` 인터페이스 TypeScript 컴파일 통과
- [ ] `MockFileSystem` 으로 빈 단위 테스트 실행 가능
- [ ] `MODULE_CONTRACTS.md` 에 IFileSystem 계약 기록됨

---

## 출력

| 산출물 | 위치 | 설명 |
|--------|------|------|
| 빌드 환경 | package.json, tsconfig.json | 실행 가능한 개발 환경 |
| Extension 기본 구조 | src/ | Hello World 수준의 Extension |
| 도메인 인터페이스 | src/domain/models/, src/infrastructure/interfaces/ | JOB-002 시작 기반 |
| 테스트 환경 | test/, .mocharc.json | 단위 테스트 실행 가능 |
| 모듈 계약 문서 | interface/MODULE_CONTRACTS.md | IMPLEMENTER 참조 기준 |

---

## Job 완료 조건 (Definition of Done)

- [ ] Phase 1-1, 1-2, 1-3 모두 DONE 상태
- [ ] VS Code에서 Extension F5 실행 성공
- [ ] 빈 단위 테스트 실행 성공 (`npm test`)
- [ ] `IFileSystem` 인터페이스 및 도메인 모델 정의 완료
- [ ] `working/CURRENT_STATUS.md` 에서 JOB-001 → COMPLETED 로 변경
- [ ] `episodic/JOB_HISTORY.md` 에 완료 기록

---

## 재시도 규칙

```yaml
max_retries: 3
common_failures:
  - "npm install 실패": package.json 의존성 버전 확인, npm cache clean
  - "TypeScript 컴파일 실패": tsconfig.json 재검토
  - "VS Code Extension 실행 실패": vscode engine 버전 확인
```

---

## 체크포인트

- Phase 1-1 완료 → `episodic/CHECKPOINT_LOG.md` 에 기록
- Phase 1-2 완료 → `episodic/CHECKPOINT_LOG.md` 에 기록 + Hello World 스크린샷
- Phase 1-3 완료 → `episodic/CHECKPOINT_LOG.md` 에 기록
- JOB-001 완료 → `working/CURRENT_STATUS.md` + `episodic/JOB_HISTORY.md` 업데이트

---

## 관련 문서

- `decisions/ADR-0002-vscode-architecture.md`
- `stable/VSCODE_EXTENSION_STRUCTURE.md`
- `stable/ARCHITECTURE_PRINCIPLES.md`
- `interface/MODULE_CONTRACTS.md`
- `jobs/JOB-002-CORE-ENGINE.md` (다음 Job)

---

## 갱신 이력

| 날짜 | 갱신자 | 내용 |
|------|--------|------|
| 2026-03-15 | ORCHESTRATOR | 초안 작성 |
