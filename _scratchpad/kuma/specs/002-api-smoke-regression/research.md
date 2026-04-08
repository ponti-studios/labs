# Research: API Smoke & Regression Guardrails

## Decision 1: Use script-based QA harness (Bash + Python)
- **Decision**: Keep smoke checks in Bash and p95 sampling in Python under `kuma/scripts/qa/`.
- **Rationale**: Minimal runtime dependencies, fast local iteration, and direct compatibility with GitHub Actions shell execution.
- **Alternatives considered**: Build a new Go QA binary; rejected due to higher implementation overhead for an operational guardrail.

## Decision 2: Keep smoke and p95 as separate commands
- **Decision**: Maintain two executables: `smoke_api.sh` (functional correctness) and `p95_api.py` (latency regression).
- **Rationale**: Separates fast correctness checks from slower sampling checks and improves troubleshooting signal.
- **Alternatives considered**: Merge into one script; rejected due to mixed concerns and less clear failure ownership.

## Decision 3: Configuration precedence is deterministic
- **Decision**: Resolve config with precedence `CLI flags > environment variables > defaults`; treat explicitly empty CLI values as user intent.
- **Rationale**: Prevents hidden env overrides and makes local/CI runs reproducible.
- **Alternatives considered**: Env-first precedence; rejected because it is less predictable for explicit command invocations.

## Decision 4: Report format is JSON-first and stable
- **Decision**: Emit deterministic JSON with stable key structure, UTC timestamps, explicit `exit_code`, and typed failure categories.
- **Rationale**: Supports artifact diffing, machine parsing, and reliable CI diagnostics.
- **Alternatives considered**: Human-readable logs only; rejected because artifact consumers need structured output.

## Decision 5: Failures are typed and non-fail-fast
- **Decision**: Classify failures as `config_error`, `auth_error`, `network_error`, `status_error`, or `latency_error`, continue all checks, and fail at summary.
- **Rationale**: Produces complete diagnostics in one run and accelerates root-cause triage.
- **Alternatives considered**: Fail-fast on first failure; rejected because it hides additional regressions.

## Decision 6: CI gating policy balances signal and flake resistance
- **Decision**: PR workflow gates on smoke failures; p95 runs every PR with bounded sampling and artifact output, with optional threshold gating mode.
- **Rationale**: Keeps correctness fully blocking while preserving performance visibility without unnecessary flakiness.
- **Alternatives considered**: Nightly-only checks; rejected due to delayed regression detection.

## Decision 7: p95 sampling strategy for stable CI
- **Decision**: Use warm-up requests excluded from measurement, then 20–30 measured samples per endpoint for CI defaults.
- **Rationale**: Improves p95 stability versus very low sample counts while keeping runtime manageable.
- **Alternatives considered**: 5–10 samples (too noisy) and 50+ samples (too slow for PR workflows).

## Clarification Resolution Summary

All Technical Context fields are resolved for this feature; no `NEEDS CLARIFICATION` items remain.