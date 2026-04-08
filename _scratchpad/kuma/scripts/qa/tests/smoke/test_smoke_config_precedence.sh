#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../../../.." && pwd)"
TMP_DIR="$ROOT_DIR/.tmp/smoke_test_config_precedence"
mkdir -p "$TMP_DIR"

PORT=18082
CLI_BASE_URL="http://127.0.0.1:${PORT}"
ENV_BASE_URL="http://127.0.0.1:9"
CLI_OUTPUT="$TMP_DIR/cli_output.json"
ENV_OUTPUT="$TMP_DIR/env_output.json"
SERVER_LOG="$TMP_DIR/mock_server.log"

cat > "$TMP_DIR/mock_server.py" <<'PY'
from http.server import BaseHTTPRequestHandler, HTTPServer

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path in ['/health', '/metrics']:
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"ok":true}')
            return

        if self.path in ['/api/v1/accounts', '/api/v1/transactions', '/api/v1/tasks', '/api/v1/events']:
            auth = self.headers.get('Authorization', '')
            if auth == 'Bearer cli-token':
                self.send_response(200)
            else:
                self.send_response(401)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'[]')
            return

        self.send_response(404)
        self.end_headers()

    def log_message(self, fmt, *args):
        return

HTTPServer(('127.0.0.1', 18082), Handler).serve_forever()
PY

python3 "$TMP_DIR/mock_server.py" > "$SERVER_LOG" 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" >/dev/null 2>&1 || true' EXIT
sleep 0.3

export HOMINEM_BASE_URL="$ENV_BASE_URL"
export HOMINEM_TOKEN="env-token"
export HOMINEM_SMOKE_OUTPUT="$ENV_OUTPUT"

set +e
"$ROOT_DIR/scripts/qa/smoke_api.sh" --base-url "$CLI_BASE_URL" --token "cli-token" --output "$CLI_OUTPUT"
EXIT_CODE=$?
set -e

if [[ "$EXIT_CODE" -ne 0 ]]; then
  echo "Expected CLI precedence run to succeed, got exit code $EXIT_CODE" >&2
  exit 1
fi

if [[ ! -f "$CLI_OUTPUT" ]]; then
  echo "Expected CLI output file not found: $CLI_OUTPUT" >&2
  exit 1
fi

if [[ -f "$ENV_OUTPUT" ]]; then
  echo "Unexpected env output file created: $ENV_OUTPUT" >&2
  exit 1
fi

python3 - "$CLI_OUTPUT" <<'PY'
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    report = json.load(f)

assert report['base_url'] == 'http://127.0.0.1:18082'
assert report['summary']['failed'] == 0
assert report['summary']['exit_code'] == 0
print('smoke config precedence assertions passed')
PY
