#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

BASE_URL="${BASE_URL:-http://localhost:8080}"
DATABASE_URL_VALUE="${DATABASE_URL:-postgresql://mcp_server:devpassword@localhost:5433/hominem?sslmode=disable}"
JWT_SECRET_VALUE="${JWT_SECRET:-test-secret}"
SMOKE_OUTPUT="${SMOKE_OUTPUT:-.tmp/smoke_report_runtime_fixed.json}"
P95_OUTPUT="${P95_OUTPUT:-.tmp/p95_report_runtime_fixed.json}"
P95_SAMPLES="${P95_SAMPLES:-10}"
P95_THRESHOLD_MS="${P95_THRESHOLD_MS:-300}"
P95_WARMUP_SAMPLES="${P95_WARMUP_SAMPLES:-2}"

mkdir -p .tmp

HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health" || true)
if [[ "$HEALTH_CODE" != "200" ]]; then
  echo "API not healthy at $BASE_URL (status=$HEALTH_CODE). Start server first." >&2
  exit 2
fi

go run github.com/pressly/goose/v3/cmd/goose@v3.24.1 -dir ./migrations postgres "$DATABASE_URL_VALUE" up >/dev/null

go run .tmp/gen_token_runtime.go > .tmp/hominem_token_runtime_fixed.txt
TOKEN="$(cat .tmp/hominem_token_runtime_fixed.txt)"

set +e
./scripts/qa/smoke_api.sh --base-url "$BASE_URL" --token "$TOKEN" --output "$SMOKE_OUTPUT"
SMOKE_EXIT=$?
python3 ./scripts/qa/p95_api.py \
  --base-url "$BASE_URL" \
  --token "$TOKEN" \
  --warmup-samples "$P95_WARMUP_SAMPLES" \
  --samples "$P95_SAMPLES" \
  --threshold-ms "$P95_THRESHOLD_MS" \
  --output "$P95_OUTPUT"
P95_EXIT=$?
set -e

echo "SMOKE_EXIT=$SMOKE_EXIT"
echo "P95_EXIT=$P95_EXIT"

if [[ "$SMOKE_EXIT" -ne 0 || "$P95_EXIT" -ne 0 ]]; then
  exit 1
fi
