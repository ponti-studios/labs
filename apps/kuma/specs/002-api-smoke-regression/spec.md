# Feature Specification: API Smoke & Regression Guardrails

**Feature Branch**: `002-api-smoke-regression`  
**Created**: 2026-02-18  
**Status**: Ready for Implementation  
**Input**: User description: "Automate authenticated API smoke checks and p95 regression validation for /api/v1 endpoints in local and CI workflows"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Local Authenticated Smoke Run (Priority: P1)

As a developer, I can run one command that validates authenticated `/api/v1` list endpoints and core health endpoints so I can quickly detect runtime regressions before committing.

**Why this priority**: This replaces manual, error-prone endpoint spot checks with a repeatable baseline and is immediately useful in daily development.

**Independent Test**: Start the local server and run the smoke command; it should fail on any non-2xx expected success endpoint and produce a machine-readable report file.

**Acceptance Scenarios**:

1. **Given** a running local server and valid JWT, **When** the smoke command runs, **Then** `/health`, `/metrics`, and authenticated `/api/v1/accounts|transactions|tasks|events` checks pass and results are written to a report file.
2. **Given** missing or invalid JWT, **When** the smoke command runs, **Then** authenticated endpoint checks fail with clear error output and non-zero exit.

---

### User Story 2 - CI Smoke Gate (Priority: P2)

As a maintainer, I can run the same smoke checks in CI so pull requests fail early when endpoint health, auth expectations, or response readiness regress.

**Why this priority**: PR-level automation catches regressions earlier and avoids merging broken API behavior.

**Independent Test**: Trigger workflow on a branch and verify a passing run publishes the smoke report artifact while failures block the job.

**Acceptance Scenarios**:

1. **Given** a pull request branch, **When** CI executes the smoke workflow, **Then** smoke checks run against the ephemeral/local test stack and the job fails on unmet expectations.
2. **Given** a successful smoke run, **When** workflow completes, **Then** the smoke report artifact is uploaded for review.

---

### User Story 3 - p95 Baseline Regression Check (Priority: P3)

As a developer, I can run an automated p95 measurement for key list endpoints and compare it to a target threshold so I can detect performance drift.

**Why this priority**: Functional correctness is not enough for this API; performance regressions have already required manual validation.

**Independent Test**: Run the p95 script with a valid JWT and confirm it emits per-endpoint p95, pass/fail threshold status, and non-zero exit when threshold is exceeded.

**Acceptance Scenarios**:

1. **Given** baseline threshold configuration, **When** p95 checks execute, **Then** each target endpoint emits p95 and pass/fail status in report output.
2. **Given** an endpoint exceeds threshold, **When** script completes, **Then** command exits non-zero with endpoint-specific failure details.

---

### Edge Cases

- API is reachable but returns intermittent 5xx responses during sampling.
- JWT is present but expired, causing partial check failures.
- `/metrics` is slow but still returns `200`; smoke must separate functional pass from performance pass.
- Local port is occupied and smoke targets wrong service.
- Endpoint returns structurally valid JSON but with unexpected empty or malformed top-level payload.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a local smoke command/script that checks `/health`, `/metrics`, and authenticated `/api/v1/accounts`, `/api/v1/transactions`, `/api/v1/tasks`, `/api/v1/events`.
- **FR-002**: System MUST support base URL and token configuration via both CLI flags and environment variables for smoke and p95 scripts; CLI flags MUST take precedence over environment variables.
- **FR-003**: Smoke run MUST emit a machine-readable JSON report including endpoint, expected status, actual status, latency, and pass/fail.
- **FR-004**: Smoke run MUST return non-zero exit code when any required check fails.
- **FR-005**: System MUST provide a p95 measurement command/script for `/api/v1/accounts|transactions|tasks|events`.
- **FR-006**: p95 run MUST emit per-endpoint p95 and average latency in report output.
- **FR-007**: p95 run MUST support configurable threshold (default 300ms) and fail non-zero when exceeded.
- **FR-008**: CI workflow MUST execute smoke checks on pull requests and fail the job on smoke failure.
- **FR-009**: CI workflow MUST publish smoke/p95 result artifacts for debugging; smoke is mandatory gate behavior on pull requests, and p95 gate behavior is optional/configurable for manual workflow runs.
- **FR-010**: Documentation MUST include local setup, token requirements, commands, and troubleshooting for smoke/p95 checks.

### Key Entities *(include if feature involves data)*

- **SmokeCheck**: One endpoint check definition with path, method, auth requirement, expected status, and timeout.
- **SmokeRunReport**: Aggregate smoke output containing run metadata, endpoint results, and final pass/fail.
- **P95CheckConfig**: Performance check configuration including sample count, endpoints, and latency threshold.
- **P95RunReport**: Aggregate p95 output with per-endpoint p95/avg and threshold comparison status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Local smoke command completes in under 30 seconds on baseline dev environment, validates all required endpoints, and records run duration in report output.
- **SC-002**: CI smoke workflow fails within one run when any required endpoint check fails.
- **SC-003**: p95 script reports values for all four `/api/v1` list endpoints and enforces threshold with deterministic pass/fail exit code.
- **SC-004**: Manual endpoint verification steps in feature quickstart shrink to a single smoke command plus optional p95 command.
