#!/usr/bin/env bash
set -euo pipefail

SCHEMA_VERSION="1.0"
BASE_URL="${HOMINEM_BASE_URL:-http://localhost:8080}"
TOKEN="${HOMINEM_TOKEN:-}"
OUTPUT="${HOMINEM_SMOKE_OUTPUT:-.tmp/smoke_report.json}"
REQUEST_TIMEOUT_SEC="${HOMINEM_REQUEST_TIMEOUT_SEC:-10}"

# T005: Foundational endpoint matrix (execution implemented in T011/T012).
CHECK_NAMES=(
  "health"
  "metrics"
  "accounts_list"
  "transactions_list"
  "tasks_list"
  "events_list"
  "finance_report_transactions"
)
CHECK_METHODS=(
  "GET"
  "GET"
  "GET"
  "GET"
  "GET"
  "GET"
  "GET"
)
CHECK_PATHS=(
  "/health"
  "/metrics"
  "/api/v1/accounts"
  "/api/v1/transactions"
  "/api/v1/tasks"
  "/api/v1/events"
  "/api/v1/finance/report?type=transactions"
)
CHECK_EXPECTED_STATUSES=(
  "200"
  "200"
  "200"
  "200"
  "200"
  "200"
  "200"
)
CHECK_REQUIRES_AUTH=(
  "false"
  "false"
  "true"
  "true"
  "true"
  "true"
  "true"
)

usage() {
  cat <<'EOF'
Usage: ./scripts/qa/smoke_api.sh [--base-url URL] [--token TOKEN] [--output FILE] [--timeout-sec N]

Runs smoke checks for health, metrics, and authenticated /api/v1 list endpoints.
EOF
}

json_escape() {
  local value="$1"
  value=${value//\\/\\\\}
  value=${value//"/\\"}
  value=${value//$'\n'/\\n}
  printf '%s' "$value"
}

# T007: Standardized smoke report schema writer.
write_report() {
  local run_id="$1"
  local started_at="$2"
  local ended_at="$3"
  local duration_ms="$4"
  local failed_count="$5"
  local passed_count="$6"
  local exit_code="$7"
  local results_file="$8"
  local output_dir
  output_dir="$(dirname "$OUTPUT")"

  # T008: Failure-safe output handling.
  mkdir -p "$output_dir"
  local tmp_file
  tmp_file="$(mktemp "$output_dir/smoke_report.XXXXXX.json")"

  {
    echo "{"
    echo "  \"schema_version\": \"$(json_escape "$SCHEMA_VERSION")\"," 
    echo "  \"run_id\": \"$(json_escape "$run_id")\"," 
    echo "  \"base_url\": \"$(json_escape "$BASE_URL")\"," 
    echo "  \"started_at\": \"$started_at\"," 
    echo "  \"ended_at\": \"$ended_at\"," 
    echo "  \"summary\": {"
    echo "    \"total\": ${#CHECK_NAMES[@]},"
    echo "    \"passed\": $passed_count,"
    echo "    \"failed\": $failed_count,"
    echo "    \"duration_ms\": $duration_ms,"
    echo "    \"exit_code\": $exit_code"
    echo "  },"
    echo "  \"results\": ["
    local first_line="true"
    while IFS= read -r line; do
      [[ -z "$line" ]] && continue
      if [[ "$first_line" == "true" ]]; then
        first_line="false"
      else
        echo ","
      fi
      printf "    %s" "$line"
    done < "$results_file"
    echo
    echo "  ]"
    echo "}"
  } > "$tmp_file"

  mv "$tmp_file" "$OUTPUT"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base-url)
      BASE_URL="$2"
      shift 2
      ;;
    --token)
      TOKEN="$2"
      shift 2
      ;;
    --output)
      OUTPUT="$2"
      shift 2
      ;;
    --timeout-sec)
      REQUEST_TIMEOUT_SEC="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 2
      ;;
  esac
done

if [[ "${#CHECK_NAMES[@]}" -ne "${#CHECK_METHODS[@]}" ]] || \
   [[ "${#CHECK_NAMES[@]}" -ne "${#CHECK_PATHS[@]}" ]] || \
   [[ "${#CHECK_NAMES[@]}" -ne "${#CHECK_EXPECTED_STATUSES[@]}" ]] || \
   [[ "${#CHECK_NAMES[@]}" -ne "${#CHECK_REQUIRES_AUTH[@]}" ]]; then
  echo "Smoke matrix configuration mismatch: array lengths differ" >&2
  exit 3
fi

if ! [[ "$REQUEST_TIMEOUT_SEC" =~ ^[0-9]+$ ]] || [[ "$REQUEST_TIMEOUT_SEC" -le 0 ]]; then
  echo "--timeout-sec must be a positive integer" >&2
  exit 4
fi

mkdir -p "$(dirname "$OUTPUT")"
RUN_ID="smoke-$(date -u +"%Y%m%dT%H%M%SZ")-$$"
STARTED_AT="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
STARTED_EPOCH_MS="$(python3 - <<'PY'
import time
print(int(time.time() * 1000))
PY
)"

RESULTS_FILE="$(mktemp "$(dirname "$OUTPUT")/smoke_results.XXXXXX.ndjson")"
FAILED_COUNT=0
PASSED_COUNT=0

run_check() {
  local index="$1"
  local name="${CHECK_NAMES[$index]}"
  local method="${CHECK_METHODS[$index]}"
  local path="${CHECK_PATHS[$index]}"
  local expected_status="${CHECK_EXPECTED_STATUSES[$index]}"
  local requires_auth="${CHECK_REQUIRES_AUTH[$index]}"

  local status_code="null"
  local latency_ms="null"
  local passed="false"
  local error=""
  local error_kind=""

  if [[ "$requires_auth" == "true" && -z "$TOKEN" ]]; then
    error="token_missing"
    error_kind="auth_error"
  else
    local headers=()
    headers+=("-H" "Accept: application/json")
    if [[ "$requires_auth" == "true" ]]; then
      headers+=("-H" "Authorization: Bearer $TOKEN")
    fi

    local curl_output
    set +e
    curl_output=$(curl -sS -o /dev/null -w "%{http_code} %{time_total}" \
      --max-time "$REQUEST_TIMEOUT_SEC" \
      -X "$method" \
      "${headers[@]}" \
      "$BASE_URL$path" 2>&1)
    local curl_exit=$?
    set -e

    if [[ "$curl_exit" -ne 0 ]]; then
      error="curl_failed:$(json_escape "$curl_output")"
      error_kind="network_error"
    else
      local code time_total
      code=$(echo "$curl_output" | awk '{print $1}')
      time_total=$(echo "$curl_output" | awk '{print $2}')
      status_code="$code"
      latency_ms=$(awk -v t="$time_total" 'BEGIN { printf "%.2f", t * 1000 }')

      if [[ "$code" == "$expected_status" ]]; then
        passed="true"
      else
        error="unexpected_status:$code"
        if [[ "$code" == "401" || "$code" == "403" ]]; then
          error_kind="auth_error"
        else
          error_kind="status_error"
        fi
      fi
    fi
  fi

  if [[ "$passed" == "true" ]]; then
    PASSED_COUNT=$((PASSED_COUNT + 1))
  else
    FAILED_COUNT=$((FAILED_COUNT + 1))
  fi

  local error_json="null"
  local error_kind_json="null"
  if [[ -n "$error" ]]; then
    error_json="\"$(json_escape "$error")\""
  fi
  if [[ -n "$error_kind" ]]; then
    error_kind_json="\"$(json_escape "$error_kind")\""
  fi

  cat <<EOF >> "$RESULTS_FILE"
{"name":"$name","method":"$method","path":"$path","requires_auth":$requires_auth,"expected_status":$expected_status,"status_code":$status_code,"latency_ms":$latency_ms,"passed":$passed,"error_kind":$error_kind_json,"error":$error_json}
EOF
}

for i in "${!CHECK_NAMES[@]}"; do
  run_check "$i"
done

ENDED_AT="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
ENDED_EPOCH_MS="$(python3 - <<'PY'
import time
print(int(time.time() * 1000))
PY
)"
DURATION_MS="$((ENDED_EPOCH_MS - STARTED_EPOCH_MS))"

EXIT_CODE=0
if [[ "$FAILED_COUNT" -gt 0 ]]; then
  EXIT_CODE=1
fi

write_report "$RUN_ID" "$STARTED_AT" "$ENDED_AT" "$DURATION_MS" "$FAILED_COUNT" "$PASSED_COUNT" "$EXIT_CODE" "$RESULTS_FILE"

rm -f "$RESULTS_FILE"

echo "Smoke report written to $OUTPUT (passed=$PASSED_COUNT failed=$FAILED_COUNT)"
exit "$EXIT_CODE"
