# QA Contracts: Smoke + p95 Scripts

## Script Interfaces

### `scripts/qa/smoke_api.sh`
- **Inputs**:
  - `--base-url` (optional, default `http://localhost:8080`)
  - `--token` (optional, falls back to `HOMINEM_TOKEN`)
  - `--output` (optional, default `.tmp/smoke_report.json`)
- **Config Precedence**:
  - CLI flags override environment variables.
  - Environment variables override defaults.
- **Behavior**:
  - Checks `/health` and `/metrics` for `200`.
  - Checks authenticated `/api/v1/accounts|transactions|tasks|events` for `200`.
  - Continues through all checks and returns non-zero if any required check fails.
- **Output Contract**:
  - Writes JSON with deterministic top-level keys: `schema_version`, `run_id`, `base_url`, `started_at`, `ended_at`, `summary`, `results`.

### `scripts/qa/p95_api.py`
- **Inputs**:
  - `--base-url` (optional, default `http://localhost:8080`)
  - `--token` (optional, falls back to `HOMINEM_TOKEN`)
  - `--samples` (optional, default `30`)
  - `--threshold-ms` (optional, default `300`)
  - `--output` (optional, default `.tmp/p95_report.json`)
- **Config Precedence**:
  - CLI flags override environment variables.
  - Environment variables override defaults.
- **Behavior**:
  - Samples `GET /api/v1/accounts|transactions|tasks|events`.
  - Computes average and p95 per endpoint.
  - Returns non-zero if any endpoint exceeds threshold or sampling fails.
- **Output Contract**:
  - Writes JSON with deterministic top-level keys: `schema_version`, `run_id`, `base_url`, `threshold_ms`, `started_at`, `ended_at`, `summary`, `results`, `exit_code`.

## Error Contract
- Token missing/invalid for authenticated checks -> `error_kind=auth_error` + non-zero exit.
- Network timeout/connection errors -> `error_kind=network_error` + non-zero exit.
- Unexpected HTTP status -> `error_kind=status_error` + non-zero exit.
- Threshold exceeded -> `error_kind=latency_error` + non-zero exit.
- Missing required configuration -> `error_kind=config_error` + non-zero exit.

## Compatibility
- Contract focuses on operational checks and does not alter API payload contracts.
- Scripts must remain compatible with HTTP-only runtime and existing JWT auth behavior.