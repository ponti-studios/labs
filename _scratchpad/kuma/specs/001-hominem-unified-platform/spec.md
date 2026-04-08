# Feature Specification: Hominem Unified Platform

**Feature Branch**: `001-hominem-unified-platform`  
**Created**: 2026-02-17  
**Status**: Draft  
**Input**: User description: "Merge the existing cli project into kuma, rename module to github.com/charlesponti/kuma, and unify domain logic across Gin API, MCP, and CLI."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Unified Shared Operations for API/MCP/CLI (Priority: P1)

As a developer, I can call one shared domain operations layer for accounts, transactions, tasks, and events so MCP tools, REST handlers, and CLI commands return consistent behavior and payloads.

**Why this priority**: This is the core architectural change that enables all other work and eliminates duplicated SQL/business logic.

**Independent Test**: Execute operation unit tests and verify MCP + REST + CLI all call `internal/operations` and produce the same response schema for list/create flows.

**Acceptance Scenarios**:

1. **Given** shared operation functions for accounts/transactions/tasks/events, **When** MCP tools invoke those functions, **Then** MCP responses match operation response types and shared `ToolError` mappings.
2. **Given** REST and CLI adapters wired to shared operations, **When** listing accounts for a JWT user, **Then** all surfaces return equivalent JSON structure and authorization behavior.

---

### User Story 2 - REST API Expansion Under /api/v1 (Priority: P2)

As an API consumer, I can use JWT-protected `/api/v1` endpoints for accounts, transactions, tasks, and events so I can access the same data model outside MCP.

**Why this priority**: REST broadens integration options and is required for HTTP-first CLI mode.

**Independent Test**: Run Gin handler tests for `/api/v1/accounts`, `/api/v1/transactions`, `/api/v1/tasks`, `/api/v1/events` verifying JWT enforcement, validation, and payload parity.

**Acceptance Scenarios**:

1. **Given** a valid JWT with `user_id`, **When** calling `GET /api/v1/accounts`, **Then** server returns 200 and shared response JSON.
2. **Given** missing/invalid JWT, **When** calling `/api/v1/*`, **Then** server returns auth error with shared error shape.
3. **Given** invalid input (missing required fields or invalid date), **When** calling create endpoints, **Then** server returns validation error mapped from shared error types.

---

### User Story 3 - CLI HTTP Integration (Priority: P3)

As a developer/operator, I can run the CLI in HTTP mode with shared configuration so I can target deployed API or local Docker Compose services with the same commands.

**Why this priority**: This enables practical dev workflows and preserves existing command UX while adopting shared infrastructure.

**Independent Test**: Run CLI command tests for `accounts list` and `transactions list` in HTTP mode with env/flag overrides.

**Acceptance Scenarios**:

1. **Given** `HOMINEM_API_URL` and `HOMINEM_TOKEN`, **When** running `accounts list`, **Then** CLI calls API endpoint and prints expected JSON.
2. **Given** valid API token and URL overrides, **When** running `transactions list`, **Then** CLI calls `/api/v1` endpoint and prints expected JSON.
3. **Given** flag overrides for API settings, **When** command executes, **Then** CLI uses overrides instead of defaults.

---

### Edge Cases

- JWT present but missing `user_id` claim.
- HTTP mode enabled without reachable `HOMINEM_API_URL`.
- Context cancellation mid-query must terminate operation cleanly.
- Create endpoints with malformed date strings.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST use module path `github.com/charlesponti/kuma` across API, MCP, and CLI imports.
- **FR-002**: System MUST expose shared operations in `internal/operations` (or equivalent) for accounts, transactions, tasks, and events list/create workflows.
- **FR-003**: MCP tools MUST delegate domain work to shared operations and keep MCP response contracts.
- **FR-004**: System MUST provide JWT-protected REST endpoints under `/api/v1` for accounts, transactions, tasks, and events using shared operations.
- **FR-005**: CLI MUST be re-homed under `cmd/cli` and support HTTP mode using shared configuration.
- **FR-006**: CLI MUST allow overrides for `HOMINEM_API_URL` and `HOMINEM_TOKEN` by flags/env vars.
- **FR-007**: Shared operations MUST return common response types and map failures to existing `ToolError` classes (validation/system/not found/unauthorized).
- **FR-008**: Existing middleware and operational endpoints (`/health`, `/metrics`, JWT auth middleware, request logging middleware, panic recovery middleware) MUST remain operational with equivalent behavior after migration.
- **FR-009**: System MUST include tests for operations, HTTP handlers, and CLI command flows as described in test cases.
- **FR-010**: System MUST document local Docker Compose workflow for HTTP CLI usage.

### Key Entities *(include if feature involves data)*

- **OperationContext**: Execution context containing request context, user identity, and DB handle prerequisites.
- **Account**: Finance account payload used by list/create operations.
- **Transaction**: Finance transaction payload with date and account linkage.
- **Task**: Tracking task payload used in list/create operations.
- **Event**: Calendar/event payload used in list/create operations.
- **ToolError**: Shared error abstraction with `validation`, `system`, `not_found`, `unauthorized` classes.
- **CLIConfig**: Runtime configuration containing API URL and JWT token.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `go test ./...` passes including new operation, API handler, and CLI tests.
- **SC-002**: API, MCP, and CLI list flows for accounts/transactions/tasks/events return consistent JSON schemas for the same user.
- **SC-003**: CLI supports HTTP mode with documented env/flag overrides and successful manual run against Docker Compose.
- **SC-004**: No regressions to existing `/health`, `/metrics`, JWT auth enforcement, request logging, panic recovery, and MCP functionality after migration.
