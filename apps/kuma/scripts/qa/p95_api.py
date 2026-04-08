#!/usr/bin/env python3
import argparse
import os
import json
import math
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib import error as urlerror
from urllib import request


# T006: Foundational p95 endpoint matrix and threshold defaults.
P95_ENDPOINTS = [
    "/api/v1/accounts",
    "/api/v1/transactions",
    "/api/v1/tasks",
    "/api/v1/events",
    "/api/v1/finance/report?type=transactions",
]
EXPECTED_STATUS = 200
SCHEMA_VERSION = "1.0"


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


# T007: Standardized p95 report schema writer.
def compute_p95(values: list[float]) -> float | None:
    if not values:
        return None
    ordered = sorted(values)
    rank = max(1, math.ceil(0.95 * len(ordered)))
    return ordered[rank - 1]


def sample_endpoint(
    base_url: str,
    path: str,
    token: str,
    timeout_ms: int,
    warmup_samples: int,
    samples: int,
    threshold_ms: float,
) -> dict[str, Any]:
    latencies_ms: list[float] = []
    statuses: list[int] = []
    errors: list[tuple[str, str]] = []

    timeout_sec = timeout_ms / 1000.0

    total_attempts = warmup_samples + samples

    for index in range(total_attempts):
        req = request.Request(base_url + path, method="GET")
        req.add_header("Accept", "application/json")
        if token:
            req.add_header("Authorization", f"Bearer {token}")

        start = time.perf_counter()
        try:
            with request.urlopen(req, timeout=timeout_sec) as resp:
                status_code = resp.getcode()
        except urlerror.HTTPError as http_err:
            status_code = http_err.code
        except Exception as exc:  # noqa: BLE001
            errors.append(
                ("network_error", f"request_failed:{type(exc).__name__}:{exc}")
            )
            continue
        finally:
            end = time.perf_counter()

        latency = (end - start) * 1000.0
        statuses.append(int(status_code))

        if index < warmup_samples:
            continue

        latencies_ms.append(latency)

        if status_code != EXPECTED_STATUS:
            if status_code in (401, 403):
                errors.append(("auth_error", f"unexpected_status:{status_code}"))
            else:
                errors.append(("status_error", f"unexpected_status:{status_code}"))

    avg_ms = (sum(latencies_ms) / len(latencies_ms)) if latencies_ms else None
    p95_ms = compute_p95(latencies_ms)

    passed = True
    failure_reasons: list[str] = []
    error_kind: str | None = None

    if not latencies_ms:
        passed = False
        failure_reasons.append("no_successful_samples")
        if error_kind is None:
            error_kind = "network_error"

    if p95_ms is not None and p95_ms > threshold_ms:
        passed = False
        failure_reasons.append(f"threshold_exceeded:{p95_ms:.2f}>{threshold_ms:.2f}")
        if error_kind is None:
            error_kind = "latency_error"

    if errors:
        passed = False
        first_kind, first_error = errors[0]
        if error_kind is None:
            error_kind = first_kind
        failure_reasons.append(first_error)

    return {
        "path": path,
        "status_set": sorted(set(statuses)),
        "samples": len(latencies_ms),
        "avg_ms": round(avg_ms, 2) if avg_ms is not None else None,
        "p95_ms": round(p95_ms, 2) if p95_ms is not None else None,
        "passed": passed,
        "error_kind": error_kind,
        "error": "; ".join(failure_reasons) if failure_reasons else None,
    }


def build_report(
    run_id: str,
    base_url: str,
    warmup_samples: int,
    samples: int,
    threshold_ms: float,
    has_token: bool,
    results: list[dict[str, Any]],
    started_at: str,
    ended_at: str,
) -> dict[str, Any]:
    failed = sum(1 for r in results if not r["passed"])
    passed = len(results) - failed
    exit_code = 1 if failed > 0 else 0

    return {
        "schema_version": SCHEMA_VERSION,
        "run_id": run_id,
        "base_url": base_url,
        "threshold_ms": threshold_ms,
        "started_at": started_at,
        "ended_at": ended_at,
        "warmup_samples": warmup_samples,
        "samples": samples,
        "has_token": has_token,
        "summary": {
            "total": len(P95_ENDPOINTS),
            "passed": passed,
            "failed": failed,
            "exit_code": exit_code,
        },
        "results": results,
        "exit_code": exit_code,
    }


# T008: Failure-safe output handling with atomic write.
def write_json_atomic(output_path: Path, payload: dict[str, Any]) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = output_path.with_suffix(output_path.suffix + ".tmp")
    temp_path.write_text(json.dumps(payload, indent=2))
    temp_path.replace(output_path)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Run API p95 regression checks for authenticated /api/v1 list endpoints."
    )
    parser.add_argument(
        "--base-url", default=os.getenv("HOMINEM_BASE_URL", "http://localhost:8080")
    )
    parser.add_argument("--token", default=os.getenv("HOMINEM_TOKEN", ""))
    parser.add_argument(
        "--samples", type=int, default=int(os.getenv("HOMINEM_P95_SAMPLES", "30"))
    )
    parser.add_argument(
        "--warmup-samples",
        type=int,
        default=int(os.getenv("HOMINEM_P95_WARMUP_SAMPLES", "2")),
    )
    parser.add_argument(
        "--threshold-ms",
        type=float,
        default=float(os.getenv("HOMINEM_P95_THRESHOLD_MS", "300")),
    )
    parser.add_argument(
        "--request-timeout-ms",
        type=int,
        default=int(os.getenv("HOMINEM_REQUEST_TIMEOUT_MS", "10000")),
    )
    parser.add_argument(
        "--output", default=os.getenv("HOMINEM_P95_OUTPUT", ".tmp/p95_report.json")
    )
    args = parser.parse_args()

    if args.samples <= 0:
        raise SystemExit("--samples must be > 0")
    if args.warmup_samples < 0:
        raise SystemExit("--warmup-samples must be >= 0")
    if args.threshold_ms <= 0:
        raise SystemExit("--threshold-ms must be > 0")
    if args.request_timeout_ms <= 0:
        raise SystemExit("--request-timeout-ms must be > 0")

    token = args.token

    run_id = (
        f"p95-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}-{os.getpid()}"
    )
    started_at = utc_now_iso()
    results = [
        sample_endpoint(
            base_url=args.base_url,
            path=endpoint,
            token=token,
            timeout_ms=args.request_timeout_ms,
            warmup_samples=args.warmup_samples,
            samples=args.samples,
            threshold_ms=args.threshold_ms,
        )
        for endpoint in P95_ENDPOINTS
    ]
    ended_at = utc_now_iso()

    output_path = Path(args.output)
    report = build_report(
        run_id=run_id,
        base_url=args.base_url,
        warmup_samples=args.warmup_samples,
        samples=args.samples,
        threshold_ms=args.threshold_ms,
        has_token=bool(token),
        results=results,
        started_at=started_at,
        ended_at=ended_at,
    )

    write_json_atomic(output_path, report)
    print(
        "p95 report written to"
        f" {output_path} (passed={report['summary']['passed']} failed={report['summary']['failed']})"
    )
    return int(report["summary"]["exit_code"])


if __name__ == "__main__":
    raise SystemExit(main())
