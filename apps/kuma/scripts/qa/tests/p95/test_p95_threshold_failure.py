#!/usr/bin/env python3
import json
import socket
import subprocess
import sys
import tempfile
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from threading import Thread


class SlowHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path in ["/api/v1/accounts", "/api/v1/transactions", "/api/v1/tasks", "/api/v1/events"]:
            time.sleep(0.05)
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
    server = HTTPServer(("127.0.0.1", port), SlowHandler)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    time.sleep(0.2)

    with tempfile.TemporaryDirectory(prefix="p95_threshold_") as tmp:
        output_path = Path(tmp) / "report.json"
        cmd = [
            sys.executable,
            str(script_path),
            "--base-url",
            f"http://127.0.0.1:{port}",
            "--token",
            "test-token",
            "--samples",
            "4",
            "--threshold-ms",
            "5",
            "--output",
            str(output_path),
        ]
        completed = subprocess.run(cmd, check=False)
        if completed.returncode == 0:
            raise AssertionError("expected non-zero exit on threshold failure")

        report = json.loads(output_path.read_text(encoding="utf-8"))
        assert report["summary"]["failed"] >= 1
        assert report["summary"]["exit_code"] == 1
        assert any((r.get("error_kind") == "latency_error") or ((r.get("error") or "").find("threshold_exceeded") >= 0) for r in report["results"])

    server.shutdown()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
