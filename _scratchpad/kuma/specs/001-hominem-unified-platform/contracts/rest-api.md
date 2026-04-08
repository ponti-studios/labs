# REST Contracts: /api/v1

## Auth
- JWT required for all `/api/v1/*` endpoints.
- `user_id` is extracted from JWT claims and passed to operations.

## Endpoints

### Accounts
- `GET /api/v1/accounts` -> list accounts for JWT user
- `POST /api/v1/accounts` -> create account for JWT user

### Transactions
- `GET /api/v1/transactions` -> list transactions for JWT user
- `POST /api/v1/transactions` -> create transaction for JWT user

### Tasks
- `GET /api/v1/tasks` -> list tasks for JWT user
- `POST /api/v1/tasks` -> create task for JWT user

### Events
- `GET /api/v1/events` -> list events for JWT user
- `POST /api/v1/events` -> create event for JWT user

## Error Contract
- Validation failures -> 400 with `ToolError{type:"validation"}` payload shape.
- Unauthorized/missing JWT -> 401 with `ToolError{type:"unauthorized"}`.
- Not found -> 404 with `ToolError{type:"not_found"}`.
- Internal/system failures -> 500 with `ToolError{type:"system"}`.

## Compatibility
- Response payloads should remain compatible with existing MCP tool outputs for equivalent operations.
