# Tasks: Hominem Unified Platform

**Input**: Design documents from `/specs/001-hominem-unified-platform/`  
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Test tasks are included because the specification explicitly requires operation, HTTP handler, and CLI tests.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish merged repository/module layout and baseline project wiring.

- [X] T001 Create consolidated repository workspace layout notes in specs/001-hominem-unified-platform/quickstart.md
- [X] T002 Update module path to github.com/charlesponti/kuma in go.mod
- [X] T003 [P] Update root-level build/test commands for merged module in Makefile
- [X] T004 Move CLI entrypoint scaffold into merged module under cmd/cli/main.go
- [X] T005 [P] Create consolidated CLI command root scaffold in cmd/cli/root.go
- [X] T006 Update import path references to github.com/charlesponti/kuma in internal/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared contracts, error mapping, config, and adapter plumbing required by all stories.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [X] T007 Create shared operation response and input types in internal/operations/types.go
- [X] T008 [P] Add shared operation error conversion helpers reusing ToolError in internal/operations/errors.go
- [X] T009 [P] Implement operation service wiring and dependencies in internal/operations/service.go
- [X] T010 [P] Add common user context extraction helpers for JWT and CLI user_id in internal/auth/user_context.go
- [X] T011 Implement REST-to-operation adapter helpers for validation and JSON rendering in internal/api/adapter.go
- [X] T012 [P] Implement MCP-to-operation adapter helpers preserving tool response envelope in internal/mcp/adapter.go
- [X] T013 Implement CLI HTTP config resolution in internal/config/cli_config.go
- [X] T014 [P] Remove legacy direct-DB context helper from runtime paths

**Checkpoint**: Shared contracts and adapters are ready; story implementation can proceed.

---

## Phase 3: User Story 1 - Unified Shared Operations for API/MCP/CLI (Priority: P1) 🎯 MVP

**Goal**: Implement shared operations for accounts/transactions/tasks/events and rewire MCP tools to delegate to those operations.

**Independent Test**: Run operation unit tests and MCP tool tests showing payload/error parity via shared operations.

### Tests for User Story 1

- [X] T015 [P] [US1] Add accounts operation unit tests for result parsing and ToolError mapping in internal/operations/accounts_test.go
- [X] T016 [P] [US1] Add transactions operation unit tests for date validation and context cancellation in internal/operations/transactions_test.go
- [X] T017 [P] [US1] Add tasks/events operation unit tests for list/create behavior in internal/operations/tasks_events_test.go
- [X] T018 [P] [US1] Add MCP delegation tests ensuring tools call operations and preserve payload shape in internal/mcp/tools_operations_test.go
- [X] T048 [US1] Add cross-surface contract parity test for accounts list response shape across API, MCP, and CLI in tests/contract/accounts_parity_test.go

### Implementation for User Story 1

- [X] T019 [US1] Implement account operations (list/create) in internal/operations/accounts.go
- [X] T020 [US1] Implement transaction operations (list/create with date validation) in internal/operations/transactions.go
- [X] T021 [US1] Implement task operations (list/create) in internal/operations/tasks.go
- [X] T022 [US1] Implement event operations (list/create) in internal/operations/events.go
- [X] T023 [US1] Refactor MCP finance tools to call operations in internal/mcp/finance_tools.go
- [X] T024 [US1] Refactor MCP tracking/task tools to call operations in internal/mcp/task_tools.go
- [X] T025 [US1] Refactor MCP calendar/event tools to call operations in internal/mcp/event_tools.go

**Checkpoint**: MCP surface is backed by shared operations; US1 is independently functional.

---

## Phase 4: User Story 2 - REST API Expansion Under /api/v1 (Priority: P2)

**Goal**: Add JWT-protected `/api/v1` endpoints for accounts/transactions/tasks/events using shared operations.

**Independent Test**: Run handler tests for all `/api/v1` resources including missing JWT and invalid input cases.

### Tests for User Story 2

- [X] T026 [P] [US2] Add Gin handler tests for accounts endpoints and JWT enforcement in internal/api/accounts_handler_test.go
- [X] T027 [P] [US2] Add Gin handler tests for transactions endpoints including invalid date payloads in internal/api/transactions_handler_test.go
- [X] T028 [P] [US2] Add Gin handler tests for tasks/events endpoints and shared error payload shape in internal/api/tasks_events_handler_test.go

### Implementation for User Story 2

- [X] T029 [US2] Implement accounts REST handlers using operations in internal/api/accounts_handler.go
- [X] T030 [US2] Implement transactions REST handlers with input validation in internal/api/transactions_handler.go
- [X] T031 [US2] Implement tasks/events REST handlers using operations in internal/api/tasks_events_handler.go
- [X] T032 [US2] Register `/api/v1` routes while preserving existing middleware in internal/api/routes.go
- [X] T033 [US2] Wire `/api/v1` route group into server startup in cmd/server/main.go

**Checkpoint**: `/api/v1` is operational with JWT enforcement and payload parity.

---

## Phase 5: User Story 3 - CLI HTTP Integration (Priority: P3)

**Goal**: Re-home CLI under `cmd/cli` and support HTTP CLI flows backed by shared operations.

**Independent Test**: Run CLI tests proving HTTP execution paths and flag/env overrides for API URL and token.

### Tests for User Story 3

- [X] T034 [P] [US3] Add CLI command tests for HTTP mode accounts list behavior in cmd/cli/accounts_list_test.go
- [X] T035 [P] [US3] Add CLI command tests for HTTP transactions list behavior in cmd/cli/transactions_list_test.go
- [X] T036 [P] [US3] Add CLI config precedence tests for flags over env vars in cmd/cli/config_test.go

### Implementation for User Story 3

- [X] T037 [US3] Extend CLI root command with HTTP configuration wiring and command registration in cmd/cli/root.go
- [X] T038 [US3] Implement accounts CLI command with HTTP execution path in cmd/cli/accounts.go
- [X] T039 [US3] Implement transactions CLI command with HTTP execution path in cmd/cli/transactions.go
- [X] T040 [US3] Add CLI HTTP client for `/mcp` and `/api/v1` calls in internal/cli/http_client.go
- [X] T041 [US3] Remove legacy direct operation runner from CLI runtime paths
- [X] T042 [US3] Wire env/flag overrides for HOMINEM_API_URL and HOMINEM_TOKEN in cmd/cli/flags.go

**Checkpoint**: CLI uses HTTP-only runtime paths and reuses shared operations/config.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, documentation, and regression safety checks.

- [X] T043 [P] Update local development workflow and docker-compose usage in README.md
- [X] T044 [P] Add migration notes for CLI-to-merged-repo paths and env-variable compatibility in docs/migration/hominem-unification.md
- [X] T049 Define and run local p95 latency check for `/api/v1` list endpoints and document results in specs/001-hominem-unified-platform/quickstart.md
- [X] T045 Run full test suite `go test ./...` and record results in specs/001-hominem-unified-platform/quickstart.md
- [X] T046 Run focused CLI tests `go test ./cmd/cli` and record results in specs/001-hominem-unified-platform/quickstart.md
- [X] T047 Execute manual QA checklist for Docker Compose + CLI HTTP flows in specs/001-hominem-unified-platform/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **User Story Phases (3-5)**: Depend on Foundational completion.
- **Polish (Phase 6)**: Depends on completion of desired user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2; no dependency on other user stories.
- **US2 (P2)**: Starts after Phase 2; depends functionally on shared operations from US1 tasks T019-T022.
- **US3 (P3)**: Starts after Phase 2; depends on operations from US1 and uses REST endpoints from US2 for HTTP CLI mode.

### Within Each User Story

- Tests first (must fail before implementation).
- Shared operation/resource implementation before adapter wiring.
- Route/command wiring after handlers/runners exist.
- Story validation before proceeding to next priority.

## Parallel Opportunities

- **Setup**: T003 and T005 can run in parallel after T002.
- **Foundational**: T008, T009, T010, T012, T014 can run in parallel once T007 starts.
- **US1**: T015-T018 run in parallel; T019-T022 can be split by resource area.
- **US2**: T026-T028 run in parallel; T029-T031 can run in parallel by resource domain.
- **US3**: T034-T036 run in parallel; T038-T042 can be split across command/config/client workstreams.
- **Polish**: T043 and T044 can run in parallel.

---

## Parallel Example: User Story 1

```bash
# Parallel tests:
Task: T015 [US1] accounts operation tests in internal/operations/accounts_test.go
Task: T016 [US1] transactions operation tests in internal/operations/transactions_test.go
Task: T017 [US1] tasks/events operation tests in internal/operations/tasks_events_test.go
Task: T018 [US1] MCP delegation tests in internal/mcp/tools_operations_test.go

# Parallel implementation by domain:
Task: T019 [US1] accounts operations in internal/operations/accounts.go
Task: T020 [US1] transactions operations in internal/operations/transactions.go
Task: T021 [US1] tasks operations in internal/operations/tasks.go
Task: T022 [US1] events operations in internal/operations/events.go
```

## Parallel Example: User Story 2

```bash
Task: T026 [US2] accounts handler tests in internal/api/accounts_handler_test.go
Task: T027 [US2] transactions handler tests in internal/api/transactions_handler_test.go
Task: T028 [US2] tasks/events handler tests in internal/api/tasks_events_handler_test.go

Task: T029 [US2] accounts handlers in internal/api/accounts_handler.go
Task: T030 [US2] transactions handlers in internal/api/transactions_handler.go
Task: T031 [US2] tasks/events handlers in internal/api/tasks_events_handler.go
```

## Parallel Example: User Story 3

```bash
Task: T034 [US3] HTTP mode CLI tests in cmd/cli/accounts_list_test.go
Task: T035 [US3] HTTP transactions CLI tests in cmd/cli/transactions_list_test.go
Task: T036 [US3] config precedence tests in cmd/cli/config_test.go

Task: T038 [US3] HTTP accounts command in cmd/cli/accounts.go
Task: T039 [US3] HTTP transactions command in cmd/cli/transactions.go
Task: T040 [US3] HTTP client in internal/cli/http_client.go
Task: T041 [US3] remove legacy direct runner from CLI runtime paths
Task: T042 [US3] flags/env wiring in cmd/cli/flags.go
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup).
2. Complete Phase 2 (Foundational).
3. Complete Phase 3 (US1).
4. Validate with US1 tests and MCP parity.
5. Demo shared operations backing MCP.

### Incremental Delivery

1. Setup + Foundational creates reusable platform base.
2. Deliver US1 (shared operations + MCP refactor) as architecture milestone.
3. Deliver US2 (`/api/v1` handlers and JWT behavior).
4. Deliver US3 (HTTP CLI and config overrides).
5. Finish with Phase 6 polish, full test runs, and manual QA.

### Parallel Team Strategy

1. Pair on setup/foundational tasks to stabilize contracts.
2. Split US1 by domain resources (accounts, transactions, tasks/events).
3. Split US2 by endpoint groups and tests.
4. Split US3 by commands vs runtime mode infrastructure.
