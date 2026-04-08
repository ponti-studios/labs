# Tasks: API Smoke & Regression Guardrails

**Input**: Design documents from `/specs/002-api-smoke-regression/`  
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included because the feature specification and constitution require test-gated delivery for smoke/p95 automation.

**Organization**: Tasks are grouped by user story so each story is independently implementable and testable.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish QA script and CI scaffolding.

- [X] T001 Create QA script directories at `kuma/scripts/qa/` and `kuma/scripts/qa/tests/`
- [X] T002 Create smoke runner scaffold in `kuma/scripts/qa/smoke_api.sh`
- [X] T003 [P] Create p95 runner scaffold in `kuma/scripts/qa/p95_api.py`
- [X] T004 [P] Create CI workflow scaffold in `kuma/.github/workflows/api-smoke.yml`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared contracts/config/report infrastructure used by all stories.

**⚠️ CRITICAL**: No user story work begins before this phase completes.

- [X] T005 Implement shared endpoint matrices and constants in `kuma/scripts/qa/smoke_api.sh` and `kuma/scripts/qa/p95_api.py`
- [X] T006 [P] Implement config resolution precedence (CLI > env > defaults) in `kuma/scripts/qa/smoke_api.sh` and `kuma/scripts/qa/p95_api.py`
- [X] T007 [P] Implement deterministic smoke report schema (`schema_version`, timestamps, summary) in `kuma/scripts/qa/smoke_api.sh`
- [X] T008 [P] Implement deterministic p95 report schema (`schema_version`, timestamps, summary, exit_code) in `kuma/scripts/qa/p95_api.py`
- [X] T009 Implement failure taxonomy mapping (`config_error|auth_error|network_error|status_error|latency_error`) in `kuma/scripts/qa/smoke_api.sh` and `kuma/scripts/qa/p95_api.py`
- [X] T010 Add output path handling and safe `.tmp` creation in `kuma/scripts/qa/smoke_api.sh` and `kuma/scripts/qa/p95_api.py`

**Checkpoint**: Shared QA execution and reporting contracts are stable.

---

## Phase 3: User Story 1 - Local Authenticated Smoke Run (Priority: P1) 🎯 MVP

**Goal**: One-command local smoke validation for health, metrics, and authenticated `/api/v1` list endpoints.

**Independent Test**: With local server up, run smoke script with valid token and then with missing/invalid token; validate report contents and exit codes.

### Tests for User Story 1

- [X] T011 [P] [US1] Add smoke success fixture/assertions in `kuma/scripts/qa/tests/smoke/test_smoke_success.sh`
- [X] T012 [P] [US1] Add smoke auth-failure fixture/assertions in `kuma/scripts/qa/tests/smoke/test_smoke_auth_failure.sh`
- [X] T013 [P] [US1] Add smoke config precedence fixture/assertions in `kuma/scripts/qa/tests/smoke/test_smoke_config_precedence.sh`

### Implementation for User Story 1

- [X] T014 [US1] Implement `/health` and `/metrics` checks in `kuma/scripts/qa/smoke_api.sh`
- [X] T015 [US1] Implement authenticated `/api/v1/accounts|transactions|tasks|events` checks in `kuma/scripts/qa/smoke_api.sh`
- [X] T016 [US1] Implement non-fail-fast aggregation and summary exit logic in `kuma/scripts/qa/smoke_api.sh`
- [X] T017 [US1] Implement smoke runtime duration capture and include it in report summary in `kuma/scripts/qa/smoke_api.sh`
- [X] T018 [US1] Add local smoke usage and troubleshooting updates in `kuma/README.md` and `specs/002-api-smoke-regression/quickstart.md`

**Checkpoint**: Local smoke workflow is reproducible and independently testable.

---

## Phase 4: User Story 2 - CI Smoke Gate (Priority: P2)

**Goal**: Enforce smoke checks in PR CI and publish diagnostics artifacts.

**Independent Test**: Trigger workflow on a branch and verify smoke failure blocks job while artifacts upload consistently.

### Tests for User Story 2

- [X] T019 [P] [US2] Add CI workflow behavior verification checklist in `specs/002-api-smoke-regression/quickstart.md`

### Implementation for User Story 2

- [X] T020 [US2] Add PR and manual-dispatch triggers in `kuma/.github/workflows/api-smoke.yml`
- [X] T021 [US2] Add smoke execution step with non-zero gating in `kuma/.github/workflows/api-smoke.yml`
- [X] T022 [US2] Add smoke report and server-log artifact uploads in `kuma/.github/workflows/api-smoke.yml`
- [X] T023 [US2] Add CI token/bootstrap environment wiring for smoke checks in `kuma/.github/workflows/api-smoke.yml`

**Checkpoint**: CI prevents merges when smoke checks regress.

---

## Phase 5: User Story 3 - p95 Baseline Regression Check (Priority: P3)

**Goal**: Measure endpoint latency and enforce p95 threshold behavior with machine-readable output.

**Independent Test**: Run p95 script against live local API with valid token; confirm per-endpoint p95/avg metrics and deterministic threshold pass/fail.

### Tests for User Story 3

- [X] T024 [P] [US3] Add p95 aggregation fixture/assertions in `kuma/scripts/qa/tests/p95/test_p95_aggregation.py`
- [X] T025 [P] [US3] Add p95 threshold-failure fixture/assertions in `kuma/scripts/qa/tests/p95/test_p95_threshold_failure.py`
- [X] T026 [P] [US3] Add p95 config precedence fixture/assertions in `kuma/scripts/qa/tests/p95/test_p95_config_precedence.py`

### Implementation for User Story 3

- [X] T027 [US3] Implement warm-up and measured sampling loop for `/api/v1/accounts|transactions|tasks|events` in `kuma/scripts/qa/p95_api.py`
- [X] T028 [US3] Implement per-endpoint avg/p95 calculations and threshold evaluation in `kuma/scripts/qa/p95_api.py`
- [X] T029 [US3] Implement p95 error-kind mapping and summary exit behavior in `kuma/scripts/qa/p95_api.py`
- [X] T030 [US3] Add CI p95 step, artifact upload, and optional gating toggle in `kuma/.github/workflows/api-smoke.yml`
- [X] T031 [US3] Add p95 local/CI usage and interpretation guidance in `kuma/README.md` and `specs/002-api-smoke-regression/quickstart.md`

**Checkpoint**: p95 regression checks run locally and in CI with deterministic reporting.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, consistency, and handoff quality.

- [X] T032 [P] Align spec wording with implemented config precedence and CI p95 behavior in `specs/002-api-smoke-regression/spec.md`
- [X] T033 [P] Validate quickstart command accuracy and expected outputs in `specs/002-api-smoke-regression/quickstart.md`
- [X] T034 Run repository baseline tests and record output in `specs/002-api-smoke-regression/quickstart.md`
- [X] T035 Run local smoke+p95 end-to-end pass/fail evidence capture in `specs/002-api-smoke-regression/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Starts immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1 and blocks all user stories.
- **Phase 3 (US1)**: Depends on Phase 2 only (MVP path).
- **Phase 4 (US2)**: Depends on Phase 2 and US1 smoke script outputs.
- **Phase 5 (US3)**: Depends on Phase 2; can run in parallel with late US2 work.
- **Phase 6 (Polish)**: Depends on completion of selected user stories.

### User Story Dependencies

- **US1 (P1)**: Independent after foundational tasks complete.
- **US2 (P2)**: Uses US1 smoke implementation for CI gating.
- **US3 (P3)**: Independent after foundational tasks complete; integrates with CI workflow.

### Within Each User Story

- Tests first (where included), then script/workflow implementation, then docs/validation.
- Script/report schema consistency must remain aligned with `contracts/qa-contract.md`.

### Parallel Opportunities

- Setup: T003 and T004 can run in parallel after T001/T002 start.
- Foundational: T006, T007, T008 can run in parallel once T005 is defined.
- US1 tests: T011, T012, T013 can run in parallel.
- US3 tests: T024, T025, T026 can run in parallel.
- Polish: T032 and T033 can run in parallel.

---

## Parallel Example: User Story 1

```bash
# Execute US1 test tasks in parallel:
Task: "T011 [US1] in kuma/scripts/qa/tests/smoke/test_smoke_success.sh"
Task: "T012 [US1] in kuma/scripts/qa/tests/smoke/test_smoke_auth_failure.sh"
Task: "T013 [US1] in kuma/scripts/qa/tests/smoke/test_smoke_config_precedence.sh"
```

## Parallel Example: User Story 3

```bash
# Execute US3 test tasks in parallel:
Task: "T024 [US3] in kuma/scripts/qa/tests/p95/test_p95_aggregation.py"
Task: "T025 [US3] in kuma/scripts/qa/tests/p95/test_p95_threshold_failure.py"
Task: "T026 [US3] in kuma/scripts/qa/tests/p95/test_p95_config_precedence.py"
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phase 1 and Phase 2.
2. Deliver Phase 3 (US1) end-to-end.
3. Validate independent smoke behavior locally before expanding scope.

### Incremental Delivery

1. Ship US1 (local smoke baseline).
2. Add US2 (CI gate + artifacts).
3. Add US3 (p95 regression checks + optional CI gating).
4. Finish with Phase 6 polish and evidence capture.

### Team Parallelization

1. One engineer finalizes foundational report/config layers.
2. One engineer builds US2 workflow while another builds US3 p95 logic once Phase 2 is complete.
3. Rejoin for Phase 6 validation and documentation consistency.
