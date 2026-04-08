# Research: Hominem Unified Platform

## Decision 1: Single module rename to github.com/charlesponti/kuma
- **Decision**: Standardize module path and imports to one module for API/MCP/CLI.
- **Rationale**: Prevent drift and broken interfaces across split repos/modules.
- **Alternatives considered**: Keep split modules; rejected due to duplicate domain code and integration overhead.

## Decision 2: Shared operations package in internal/operations
- **Decision**: Move business logic and DB query orchestration into reusable operation functions.
- **Rationale**: Enables MCP, REST, and CLI to share validation, error mapping, and response shaping.
- **Alternatives considered**: Keep SQL in each adapter; rejected due to inconsistency and maintenance risk.

## Decision 3: CLI is HTTP-only
- **Decision**: Standardize CLI execution on HTTP mode using API URL and token configuration.
- **Rationale**: HTTP-only CLI reduces complexity, removes duplicate execution paths, and matches production architecture.
- **Alternatives considered**: Keep a legacy direct database execution path; rejected due to added maintenance and drift risk.

## Decision 4: Error unification via existing ToolError
- **Decision**: Reuse ToolError classes (`validation`, `system`, `not_found`, `unauthorized`) in operations and adapters.
- **Rationale**: Predictable behavior across MCP/API/CLI with minimal rewrites.

## Decision 5: Testing split by layer
- **Decision**: Add operation unit tests, Gin handler tests, and CLI command tests.
- **Rationale**: Verifies shared layer and adapters independently and together.
