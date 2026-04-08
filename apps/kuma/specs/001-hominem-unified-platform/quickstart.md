# Quickstart: Hominem Unified Platform

## Prerequisites
- Docker + Docker Compose
- Go toolchain matching repository standard

## Local Run
1. Start local dependencies and server:
   - `docker compose up`
2. Ensure API is available on `http://localhost:8080`.

3. Run unified CLI:
  - `go run ./cmd/cli --api-url=http://localhost:8080 --token="$HOMINEM_TOKEN" accounts list`

## CLI
- Set API target:
  - `export HOMINEM_API_URL=http://localhost:8080`
- Example:
  - `go run ./cmd/cli accounts list`

## Verification
- `go test ./...`
- `go test ./cmd/cli`
- Latest run:
  - `go test ./cmd/cli` → `ok github.com/charlesponti/kuma/cli`
  - `go test ./...` → all packages passed
- Manual checks:
  - `/health` returned `200`
  - `/metrics` returned `200`
  - `/api/v1/accounts` returned `401` without JWT and `200` with JWT
  - CLI (`accounts list`) returned `[]` with exit code `0`
  - `/api/v1/events` returned `200` with JWT after schema-aligned events query update
  - CLI (`transactions list`) returned `[]` with exit code `0`
  - MCP and REST output schemas for covered flows remain aligned via shared operation responses

## Performance Check (p95 target)

- Measure list endpoints under local baseline load and confirm p95 <= 300ms for:
  - `GET /api/v1/accounts`
  - `GET /api/v1/transactions`
  - `GET /api/v1/tasks`
  - `GET /api/v1/events`

- Latest local authenticated baseline (30 samples/endpoint):
  - `GET /api/v1/accounts`: status `200`, p95 `6.68ms`, avg `3.18ms`
  - `GET /api/v1/transactions`: status `200`, p95 `9.65ms`, avg `5.45ms`
  - `GET /api/v1/tasks`: status `200`, p95 `8.00ms`, avg `3.40ms`
  - `GET /api/v1/events`: status `200`, p95 `4.04ms`, avg `2.08ms`
