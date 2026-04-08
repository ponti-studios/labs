# Implementation Plan: API Smoke & Regression Guardrails

**Branch**: `002-api-smoke-regression` | **Date**: 2026-02-18 | **Spec**: `/specs/002-api-smoke-regression/spec.md`
**Input**: Feature specification from `/specs/002-api-smoke-regression/spec.md`

## Summary

Introduce repeatable local and CI quality guardrails for API readiness by adding authenticated smoke checks and p95 regression checks for `/api/v1` list endpoints. Delivery includes script contracts, JSON reporting, CI artifact publication, and operator quickstart flows aligned with JWT-based HTTP access.

## Technical Context

**Language/Version**: Bash (POSIX shell) + Python 3.11 for QA scripts; Go 1.24.x service runtime under test  
**Primary Dependencies**: `curl`, Python stdlib (`argparse`, `json`, `statistics`, `urllib`), GitHub Actions workflow runner  
**Storage**: JSON report artifacts in `.tmp/` (local) and GitHub Actions artifacts (CI); no schema/database changes  
**Testing**: Script fixture checks under `scripts/qa/tests`, smoke/p95 runtime execution, repository baseline `go test ./...`  
**Target Platform**: macOS/Linux developer shells and GitHub Actions Ubuntu runners  
**Project Type**: Single backend service repository with QA automation scripts  
**Performance Goals**: p95 for `/api/v1/accounts|transactions|tasks|events` compared to threshold (default 300ms); smoke runtime target under 30s on baseline dev environment  
**Constraints**: HTTP + JWT only (no native DB CLI mode), fail-closed auth behavior, preserve `/health` and `/metrics` operability  
**Scale/Scope**: 6 smoke checks + 4 p95 checks with JSON reports and CI gating on smoke failures

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Gate Review

- **I. Single Domain Source of Truth**: PASS — no domain logic duplication; checks consume existing HTTP API behavior only.
- **II. Security Context Integrity**: PASS — authenticated checks require JWT bearer token and fail closed when missing/invalid.
- **III. Contract Parity Across Interfaces**: PASS — feature validates existing REST contracts without redefining domain semantics.
- **IV. Test-Gated Delivery**: PASS — plan includes script fixtures, focused smoke/p95 runs, and repository test command validation.
- **V. Operability and Non-Regression**: PASS — `/health` and `/metrics` are first-class smoke targets and retained in CI guardrails.

### Post-Design Gate Re-Check

- **I. Single Domain Source of Truth**: PASS — data model and contracts describe QA/reporting entities only.
- **II. Security Context Integrity**: PASS — quickstart and contracts specify JWT-bearing authenticated requests and unauthorized failure behavior.
- **III. Contract Parity Across Interfaces**: PASS — contracts encode expected statuses/error taxonomy alignment for smoke/p95 evidence.
- **IV. Test-Gated Delivery**: PASS — artifacts include explicit validation paths for local and CI execution.
- **V. Operability and Non-Regression**: PASS — design keeps health/metrics checks mandatory and publishes diagnostics artifacts.

## Project Structure

### Documentation (this feature)

```text
specs/002-api-smoke-regression/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── qa-contract.md
│   └── qa-contract.openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
kuma/
├── .github/workflows/
│   ├── test.yml
│   └── api-smoke.yml
├── scripts/
│   └── qa/
│       ├── smoke_api.sh
│       ├── p95_api.py
│       └── tests/
├── cmd/
├── internal/
├── tests/
└── README.md
```

**Structure Decision**: Retain existing backend structure and add/maintain QA automation under `scripts/qa` plus CI orchestration in `.github/workflows/api-smoke.yml`; no application package reorganization.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
