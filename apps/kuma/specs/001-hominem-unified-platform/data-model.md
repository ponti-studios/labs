# Data Model: Hominem Unified Platform

## Entities

### Account
- **Fields**: `id`, `user_id`, `name`, `type`, `currency`, `created_at`, `updated_at`
- **Usage**: list/create via operations, MCP, REST, CLI

### Transaction
- **Fields**: `id`, `user_id`, `account_id`, `amount`, `currency`, `occurred_at`, `description`, `category`, `created_at`
- **Validation**: `account_id` required, `amount` numeric, `occurred_at` valid date/datetime

### Task
- **Fields**: `id`, `user_id`, `title`, `status`, `due_at`, `priority`, `created_at`, `updated_at`
- **Validation**: `title` required, due date format validated when present

### Event
- **Fields**: `id`, `user_id`, `title`, `starts_at`, `ends_at`, `location`, `notes`, `created_at`
- **Validation**: `starts_at` required for create where applicable, `ends_at >= starts_at`

### ToolError
- **Fields**: `type`, `message`, `details`
- **Types**: `validation`, `system`, `not_found`, `unauthorized`
- **Usage**: returned from operations and mapped by MCP/REST/CLI adapters

### CLIConfig
- **Fields**: `api_url`, `jwt_token`
- **Sources**: env vars + flags; flags override env

## Relationships
- `Account 1..* Transaction` by `account_id`
- `User 1..* {Account, Transaction, Task, Event}` with RLS enforced by user context

## Response Shape Expectations
- List responses return arrays with stable field names used consistently across MCP/REST/CLI.
- Create responses return created object or standardized success envelope matching existing MCP outputs.
