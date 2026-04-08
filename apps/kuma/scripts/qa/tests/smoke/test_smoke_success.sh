#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../../../.." && pwd)"
TMP_DIR="$ROOT_DIR/.tmp/smoke_test_success"
mkdir -p "$TMP_DIR"

PORT=18080
BASE_URL="http://127.0.0.1:${PORT}"
REPORT_PATH="$TMP_DIR/report.json"
SERVER_LOG="$TMP_DIR/mock_server.log"

cat > "$TMP_DIR/mock_server.py" <<'PY'
from http.server import BaseHTTPRequestHandler, HTTPServer

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        auth_required = self.path.startswith('/api/v1/')
        auth = self.headers.get('Authorization', '')

        if self.path in ['/health', '/metrics']:
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"ok":true}')
            return

        if self.path in ['/api/v1/accounts', '/api/v1/transactions', '/api/v1/tasks', '/api/v1/events']:
            if auth_required and not auth.startswith('Bearer '):
                self.send_response(401)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(b'{"error":"unauthorized"}')
                return
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'[]')
            return

        self.send_response(404)
        self.end_headers()

    def log_message(self, fmt, *args):
        return

HTTPServer(('127.0.0.1', 18080), Handler).serve_forever()
PY

python3 "$TMP_DIR/mock_server.py" > "$SERVER_LOG" 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" >/dev/null 2>&1 || true' EXIT
sleep 0.3

set +e
"$ROOT_DIR/scripts/qa/smoke_api.sh" --base-url "$BASE_URL" --token "test-token" --output "$REPORT_PATH"
EXIT_CODE=$?
set -e

if [[ "$EXIT_CODE" -ne 0 ]]; then
  echo "Expected success exit code 0, got $EXIT_CODE" >&2
  exit 1
fi

python3 - "$REPORT_PATH" <<'PY'
import json, sys
report_path = sys.argv[1]
with open(report_path, 'r', encoding='utf-8') as f:
    report = json.load(f)

assert report['schema_version'] == '1.0'
assert report['summary']['total'] == 6
assert report['summary']['failed'] == 0
assert report['summary']['passed'] == 6
assert report['summary']['exit_code'] == 0
assert report['base_url'] == 'http://127.0.0.1:18080'
assert isinstance(report['run_id'], str) and report['run_id']
assert 'duration_ms' in report['summary']

for result in report['results']:
    assert result['passed'] is True
    assert result['status_code'] == 200
    assert isinstance(result['latency_ms'], (int, float))

print('smoke success assertions passed')
PY
