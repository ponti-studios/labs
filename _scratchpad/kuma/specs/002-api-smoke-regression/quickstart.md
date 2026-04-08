# Quickstart: API Smoke & Regression Guardrails

## Prerequisites
- Docker + Docker Compose
- Go toolchain matching repo baseline
- Python 3.11+
- Valid JWT token exported as `HOMINEM_TOKEN`

## Local Run
1. Start dependencies and server:
   - `cd kuma`
   - `docker compose up -d`
   - `go run ./cmd/server`
2. Verify server reachability:
   - `curl http://localhost:8080/health`

## Smoke Validation
- Run smoke checks:
  - `./scripts/qa/smoke_api.sh --base-url http://localhost:8080 --output .tmp/smoke_report.json`
- Expected:
  - Exit code `0`
  - Report file exists at `.tmp/smoke_report.json`
  - `summary.duration_ms` is present and non-negative

### Smoke Configuration Precedence (US1)
- CLI flags override environment variables; environment variables override defaults.
- Example:
  - `HOMINEM_BASE_URL=http://127.0.0.1:9 HOMINEM_TOKEN=bad ./scripts/qa/smoke_api.sh --base-url http://localhost:8080 --token <valid-jwt> --output .tmp/smoke_report_precedence.json`
  - Expected outcome: script uses CLI-provided URL/token and writes report to CLI output path.

### Smoke Manual Validation Results (US1)
- Success case:
  - `HOMINEM_TOKEN=<valid-jwt> ./scripts/qa/smoke_api.sh --base-url http://localhost:8080 --output .tmp/smoke_report_success.json`
  - Expected outcome: exit `0`, `summary.failed=0`, all results contain `passed=true`.
- Failure case (missing token):
  - `HOMINEM_TOKEN= ./scripts/qa/smoke_api.sh --base-url http://localhost:8080 --output .tmp/smoke_report_missing_token.json`
  - Expected outcome: exit `1`, authenticated endpoint checks fail with `error=token_missing`.
- Report inspection:
  - `python3 -m json.tool .tmp/smoke_report_success.json | head -n 40`
  - `python3 -m json.tool .tmp/smoke_report_missing_token.json | head -n 40`

## p95 Validation
- Run p95 checks:
  - `python3 ./scripts/qa/p95_api.py --base-url http://localhost:8080 --warmup-samples 2 --samples 30 --threshold-ms 300 --output .tmp/p95_report.json`
- Expected:
  - Exit code `0` when all endpoints are within threshold
  - Report file exists at `.tmp/p95_report.json`

## CI Verification
- Open a PR from `002-api-smoke-regression`.
- Confirm `api-smoke` workflow runs and uploads smoke/p95 artifacts.

### CI Workflow Validation Notes (US2)
- Trigger paths:
  - Pull request targeting `main`.
  - Manual `workflow_dispatch` run from Actions tab.
- Expected behavior:
  - Workflow starts Postgres service, boots API server, generates a JWT token, and runs `smoke_api.sh`.
  - Workflow fails when smoke checks fail (non-zero script exit).
  - Workflow always runs p95 and uploads `p95-report`; threshold failure is optional-gate controlled for manual dispatch.
- Expected artifacts (always uploaded):
  - `smoke-report` containing `.tmp/smoke_report.json`.
  - `api-server-log` containing `.tmp/server.log`.

#### CI Verification Checklist
- [ ] Workflow trigger observed on PR or manual dispatch.
- [ ] API health check reaches `200` before smoke step.
- [ ] Smoke step exits `0` on healthy baseline and non-zero on regression.
- [ ] `smoke-report` artifact is uploaded even on failure.
- [ ] `api-server-log` artifact is uploaded even on failure.

## Validation Record

### Repository Test Run (T025)
- Command basis: `go test` suite via repository test runner across `kuma` test files.
- Result: `37 passed, 0 failed`.

### Local Smoke + p95 Runtime Run (T026)
- Smoke command:
  - `./scripts/qa/smoke_api.sh --base-url http://localhost:8080 --token test-token --output .tmp/smoke_report_runtime.json`
  - Result: exit `1`, summary `total=6 passed=0 failed=6`.
- p95 command:
  - `python3 ./scripts/qa/p95_api.py --base-url http://localhost:8080 --token test-token --samples 5 --threshold-ms 300 --output .tmp/p95_report_runtime.json`
  - Result: exit `1`, summary `total=4 passed=0 failed=4`.
- Observed failure reason examples:
  - Smoke `/health`: `curl_failed` with `Connection refused` on `localhost:8080`.
  - p95 `/api/v1/accounts`: `no_successful_samples; request_failed:URLError(...Connection refused)`.

### Local Smoke + p95 Runtime Run (Live Server Up)
- Environment:
  - API reachable at `http://localhost:8080/health` (`200`).
  - Database reachable via `DATABASE_URL=postgresql://mcp_server:devpassword@localhost:5433/hominem?sslmode=disable`.
- Smoke command:
  - `./scripts/qa/smoke_api.sh --base-url http://localhost:8080 --token <generated-jwt> --output .tmp/smoke_report_runtime_passcheck.json`
  - Result: exit `1`, summary `total=6 passed=2 failed=4`.
- p95 command:
  - `python3 ./scripts/qa/p95_api.py --base-url http://localhost:8080 --token <generated-jwt> --samples 10 --threshold-ms 300 --output .tmp/p95_report_runtime_passcheck.json`
  - Result: exit `1`, summary `total=4 passed=0 failed=4`.
- Observed failure reason examples:
  - Smoke `/api/v1/accounts`: `unexpected_status:500`.
  - p95 endpoints report `status_set=[500]` with `error=unexpected_status:500`.
  - Direct sample response: `HTTP/1.1 500 Internal Server Error` with body `{"error":"system","message":"error fetching accounts"}`.

### Goose Migration + Passing Runtime Run
- Migration command (Goose-only):
  - `go run github.com/pressly/goose/v3/cmd/goose@v3.24.1 -dir /Users/charlesponti/Documents/kuma/migrations postgres 'postgresql://mcp_server:devpassword@localhost:5433/hominem?sslmode=disable' up`
- Migration status command:
  - `go run github.com/pressly/goose/v3/cmd/goose@v3.24.1 -dir /Users/charlesponti/Documents/kuma/migrations postgres 'postgresql://mcp_server:devpassword@localhost:5433/hominem?sslmode=disable' status`
  - Result: all migrations applied through `20260217000001_add_extended_schema.sql`.
- Smoke command (fresh JWT with UUID `user_id` claim):
  - `./scripts/qa/smoke_api.sh --base-url http://localhost:8080 --token <fresh-generated-jwt> --output .tmp/smoke_report_runtime_passcheck.json`
  - Result: exit `0`, summary `total=6 passed=6 failed=0`.
- p95 command:
  - `python3 ./scripts/qa/p95_api.py --base-url http://localhost:8080 --token <fresh-generated-jwt> --samples 10 --threshold-ms 300 --output .tmp/p95_report_runtime_passcheck.json`
  - Result: exit `0`, summary `total=4 passed=4 failed=0`.

### Phase 6 Validation Run (2026-02-18)
- Repository baseline test run (T034):
  - Command: `go test ./...`
  - Result: `37 passed, 0 failed`.
- Runtime evidence helper (fixed path):
  - Command: `./scripts/qa/run_runtime_evidence.sh`
  - Behavior: validates health, applies pending migrations idempotently, generates fresh JWT, runs smoke + p95.
- Local smoke run (T035) result:
  - Output: `.tmp/smoke_report_runtime_fixed.json`
  - Result: exit `0`, summary `total=6 passed=6 failed=0`.
- Local p95 run (T035) result:
  - Output: `.tmp/p95_report_runtime_fixed.json`
  - Result: exit `0`, summary `total=4 passed=4 failed=0`.

## Troubleshooting
- `401` responses: verify `HOMINEM_TOKEN` is present and valid.
- Connection failures: ensure server is running on target base URL.
- Slow endpoints: inspect p95 report and server logs to isolate regressions.