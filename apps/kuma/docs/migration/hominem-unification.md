# Hominem Unification Migration Notes

## Summary

The MCP server and CLI now share one module path: `github.com/charlesponti/kuma`.

## Key Changes

- Server module renamed from `hominem-mcp` to `hominem`.
- Shared domain operations added in `internal/operations`.
- New JWT-protected REST routes available at `/api/v1/*` for accounts, transactions, tasks, and events.
- CLI entrypoint available at `cmd/cli`.

## CLI Mode Compatibility

- CLI now runs in HTTP mode only using `HOMINEM_API_URL`.

## Environment Variables

- `HOMINEM_API_URL` overrides API target (default `http://localhost:8080`).
- `HOMINEM_TOKEN` provides bearer JWT for HTTP mode.

## Example Commands

```bash
go run ./cmd/cli --api-url=http://localhost:8080 --token="$HOMINEM_TOKEN" accounts list

go run ./cmd/cli --api-url=http://localhost:8080 --token="$HOMINEM_TOKEN" transactions list
```
