# Implementation Plan: Hominem Unified Platform

**Branch**: `001-hominem-unified-platform` | **Date**: 2026-02-17 | **Spec**: `/specs/001-hominem-unified-platform/spec.md`  
**Input**: Feature specification from `/specs/001-hominem-unified-platform/spec.md`

## Summary

Consolidate CLI and MCP server code into a single Go module `github.com/charlesponti/kuma`, move CLI entrypoint under `cmd/cli`, and introduce a shared `internal/operations` layer used by MCP tools, Gin `/api/v1` handlers, and HTTP CLI flows. Preserve existing middleware/ops endpoints and unify error/response behavior via existing `ToolError` patterns.

## Technical Context

**Language/Version**: Go (existing repo standard)  
**Primary Dependencies**: Gin, pgx/database package in repo, Cobra/CLI stack in existing CLI project, existing MCP tooling in repo  
**Storage**: PostgreSQL  
**Testing**: Go `testing` + existing test setup (`go test ./...`)  
**Target Platform**: Linux server deployment (Railway) + developer machines (macOS/Linux)  
**Project Type**: Single Go backend + CLI in one module  
**Performance Goals**: Preserve API responsiveness with p95 <= 300ms for list endpoints in local baseline testing and avoid duplicated query paths  
**Constraints**: Maintain JWT, RLS, existing middleware, and response compatibility across MCP/API/CLI  
**Scale/Scope**: Accounts, transactions, tasks, and events list/create parity across all surfaces

## Constitution Check

- Keep a single source of truth for domain behavior (`internal/operations`).
- Preserve existing security model (JWT + RLS user context).
- Maintain testability with unit-level and adapter-level tests.
- Avoid introducing separate modules/repos for CLI/API/MCP.

## Project Structure

### Documentation (this feature)

```text
specs/001-hominem-unified-platform/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
cmd/
├── server/                # Gin + MCP server entrypoint (existing main)
└── cli/                   # Re-homed CLI binary

internal/
├── operations/            # Shared domain operations
├── api/                   # REST handlers/routes using operations
├── mcp/                   # MCP tools delegating to operations
├── config/                # Shared config loading
├── database/              # DB + RLS user context helpers
└── errors/                # ToolError and mappings

tests/
├── contract/              # Cross-surface parity contract tests
├── unit/                  # Operations unit tests
├── integration/           # Handler tests
└── cli/                   # CLI command tests
```

**Structure Decision**: Single consolidated Go module with adapters (MCP/REST/CLI) over shared operation services.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None anticipated | N/A | N/A |
