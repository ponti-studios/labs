#!/usr/bin/env python3
import json
import os
import socket
import subprocess
import sys
import tempfile
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from threading import Thread


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path in ["/api/v1/accounts", "/api/v1/transactions", "/api/v1/tasks", "/api/v1/events"]:
            auth = self.headers.get("Authorization", "")
            if auth == "Bearer cli-token":
                self.send_response(200)
            else:
                self.send_response(401)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b"[]")
            return
        self.send_response(404)
        self.end_headers()

    def log_message(self, format, *args):
        return


def free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return int(s.getsockname()[1])


def main() -> int:
    repo_root = Path(__file__).resolve().parents[4]
    script_path = repo_root / "scripts/qa/p95_api.py"

    port = free_port()
    server = HTTPServer(("127.0.0.1", port), Handler)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    time.sleep(0.2)

    with tempfile.TemporaryDirectory(prefix="p95_precedence_") as tmp:
        env_output = Path(tmp) / "env_report.json"
        cli_output = Path(tmp) / "cli_report.json"

        env = os.environ.copy()
        env["HOMINEM_BASE_URL"] = "http://127.0.0.1:9"
        env["HOMINEM_TOKEN"] = "env-token"
        env["HOMINEM_P95_OUTPUT"] = str(env_output)

        cmd = [
            sys.executable,
            str(script_path),
            "--base-url",
            f"http://127.0.0.1:{port}",
            "--token",
            "cli-token",
            "--samples",
            "3",
            "--threshold-ms",
            "300",
            "--output",
            str(cli_output),
        ]
        completed = subprocess.run(cmd, env=env, check=False)
        if completed.returncode != 0:
            raise AssertionError(f"expected exit 0, got {completed.returncode}")

        assert cli_output.exists()
        assert not env_output.exists()

        report = json.loads(cli_output.read_text(encoding="utf-8"))
        assert report["base_url"] == f"http://127.0.0.1:{port}"
        assert report["summary"]["failed"] == 0

    server.shutdown()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
