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
            self.send_response(200)
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

    with tempfile.TemporaryDirectory(prefix="p95_aggregation_") as tmp:
        output_path = Path(tmp) / "report.json"
        cmd = [
            sys.executable,
            str(script_path),
            "--base-url",
            f"http://127.0.0.1:{port}",
            "--token",
            "test-token",
            "--samples",
            "5",
            "--threshold-ms",
            "300",
            "--output",
            str(output_path),
        ]
        completed = subprocess.run(cmd, check=False)
        if completed.returncode != 0:
            raise AssertionError(f"expected exit 0, got {completed.returncode}")

        report = json.loads(output_path.read_text(encoding="utf-8"))
        assert report["schema_version"] == "1.0"
        assert report["summary"]["total"] == 4
        assert report["summary"]["failed"] == 0
        assert report["summary"]["exit_code"] == 0

        for result in report["results"]:
            assert result["samples"] == 5
            assert result["passed"] is True
            assert result["p95_ms"] is not None
            assert result["avg_ms"] is not None

    server.shutdown()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
