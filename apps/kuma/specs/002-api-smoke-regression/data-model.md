# Data Model: API Smoke & Regression Guardrails

## Entities

### SmokeCheck
- **Fields**: `name`, `method`, `path`, `requires_auth`, `expected_status`, `timeout_ms`
- **Usage**: Defines each endpoint validation step for smoke runs.
- **Validation Rules**:
	- `method` MUST be `GET` for this feature scope.
	- `path` MUST start with `/` and target one of configured smoke endpoints.
	- `expected_status` MUST be an integer HTTP code (default 200).
	- `timeout_ms` MUST be positive.

### SmokeResult
- **Fields**: `name`, `path`, `status_code`, `latency_ms`, `passed`, `error`, `error_kind`
- **Usage**: Captures one check execution outcome.
- **Validation Rules**:
	- `latency_ms` MUST be >= 0 when request reaches server.
	- `error_kind` MUST be one of `config_error|auth_error|network_error|status_error|unknown` when `passed=false`.

### SmokeRunReport
- **Fields**: `schema_version`, `run_id`, `base_url`, `started_at`, `ended_at`, `summary`, `results[]`
- **Summary Fields**: `total`, `passed`, `failed`, `exit_code`
- **Usage**: Persistent JSON output for local troubleshooting and CI artifacts.
- **Validation Rules**:
	- `started_at` and `ended_at` MUST be RFC3339 UTC timestamps.
	- `summary.total` MUST equal `len(results)`.
	- `exit_code` MUST be `0` when `failed=0`, otherwise non-zero.

### P95CheckConfig
- **Fields**: `endpoints[]`, `samples_per_endpoint`, `threshold_ms`, `request_timeout_ms`
- **Usage**: Parameterizes performance sampling behavior.
- **Validation Rules**:
	- `samples_per_endpoint` MUST be >= 1 (recommended 20–30 in CI).
	- `threshold_ms` MUST be > 0.
	- `endpoints` MUST include `/api/v1/accounts|transactions|tasks|events` for baseline checks.

### P95EndpointResult
- **Fields**: `path`, `status_set`, `samples`, `avg_ms`, `p95_ms`, `passed`, `error`, `error_kind`
- **Usage**: Captures per-endpoint latency and pass/fail.
- **Validation Rules**:
	- `samples` MUST equal configured measured sample count unless aborted by hard failure.
	- `p95_ms` MUST be >= `avg_ms` only for degenerate/ordered distributions is not guaranteed; both MUST be >= 0.
	- `error_kind` MUST be `latency_error|auth_error|network_error|status_error|unknown` when `passed=false`.

### P95RunReport
- **Fields**: `schema_version`, `run_id`, `base_url`, `threshold_ms`, `started_at`, `ended_at`, `results[]`, `summary`, `exit_code`
- **Usage**: JSON report for latency regression decisions.
- **Validation Rules**:
	- `summary.total` MUST equal `len(results)`.
	- `summary.failed` MUST equal count of endpoint results where `passed=false`.
	- `exit_code` MUST be non-zero if any endpoint fails threshold or request expectations.

## Relationships
- `SmokeRunReport 1..* SmokeResult`
- `P95RunReport 1..* P95EndpointResult`
- `P95CheckConfig 1..* P95EndpointResult` by endpoint path mapping

## State Transitions

### SmokeRunReport lifecycle
- `initialized` -> `running` -> `passed|failed`
- Transition conditions:
	- `running -> passed` when all `SmokeResult.passed=true`
	- `running -> failed` when one or more checks fail

### P95RunReport lifecycle
- `initialized` -> `sampling` -> `evaluated` -> `passed|failed`
- Transition conditions:
	- `evaluated -> passed` when all endpoint `p95_ms <= threshold_ms` and expected statuses hold
	- `evaluated -> failed` when threshold/status/network/auth violations are present

## Report Expectations
- Reports MUST be valid JSON and deterministic in top-level keys.
- Failures MUST include endpoint-level reason strings when available.
- Exit code in report MUST match process exit behavior.