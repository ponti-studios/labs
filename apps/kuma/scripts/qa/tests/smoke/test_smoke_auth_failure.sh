#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../../../.." && pwd)"
TMP_DIR="$ROOT_DIR/.tmp/smoke_test_auth_failure"
mkdir -p "$TMP_DIR"

PORT=18081
BASE_URL="http://127.0.0.1:${PORT}"
REPORT_PATH="$TMP_DIR/report.json"
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
            self.send_response(401)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"error":"unauthorized"}')
            return

        self.send_response(404)
        self.end_headers()

    def log_message(self, fmt, *args):
        return

HTTPServer(('127.0.0.1', 18081), Handler).serve_forever()
PY

python3 "$TMP_DIR/mock_server.py" > "$SERVER_LOG" 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" >/dev/null 2>&1 || true' EXIT
sleep 0.3

set +e
"$ROOT_DIR/scripts/qa/smoke_api.sh" --base-url "$BASE_URL" --output "$REPORT_PATH"
EXIT_CODE=$?
set -e

if [[ "$EXIT_CODE" -eq 0 ]]; then
  echo "Expected non-zero exit code for missing token" >&2
  exit 1
fi

python3 - "$REPORT_PATH" <<'PY'
import json, sys
report_path = sys.argv[1]
with open(report_path, 'r', encoding='utf-8') as f:
    report = json.load(f)

assert report['summary']['total'] == 6
assert report['summary']['failed'] == 4
assert report['summary']['passed'] == 2
assert report['summary']['exit_code'] == 1

auth_paths = {
    '/api/v1/accounts',
    '/api/v1/transactions',
    '/api/v1/tasks',
    '/api/v1/events',
}

for result in report['results']:
    if result['path'] in auth_paths:
        assert result['passed'] is False
        assert result['error_kind'] == 'auth_error'
        assert 'token_missing' in (result['error'] or '')

print('smoke auth failure assertions passed')
PY
