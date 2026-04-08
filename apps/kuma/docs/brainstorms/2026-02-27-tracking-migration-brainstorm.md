# Brainstorm: Migrate Tracking to MCP Server

**Date**: 2026-02-27

## What We're Building

Migrate the **Tracking** command from voidline to kuma as MCP tools + REST endpoints. Tracking is an inventory consumption system that tracks:
- Acquisitions (adding inventory)
- Usage (consuming from inventory)
- Reconciliations (expected vs actual remaining)

## Why This Approach

**Extend existing possessions table with JSONB** rather than creating a new table because:
1. Possessions already exists with basic fields (name, category, value, purchase_date)
2. JSONB provides flexibility for tracking-specific fields while maintaining some schema
3. Follows existing pattern (see `health` table uses JSONB for flexible data)
4. Leverages existing RLS policies on possessions table

## Key Decisions

### Schema Extension

Add JSONB column `tracking` to `possessions` table with this structure:

```json
{
  "acquisitions": [
    {
      "amount": 500,
      "unit": "grams",
      "date": "2026-01-15",
      "source": "purchased"
    }
  ],
  "usage": [
    {
      "amount": 50,
      "unit": "grams",
      "date": "2026-01-20",
      "type": "direct",
      "container": "container-1"
    }
  ],
  "reconciliations": [
    {
      "measured": 450,
      "unit": "grams",
      "date": "2026-01-31",
      "expected": 450
    }
  ],
  "settings": {
    "tolerance": 0.02,
    "unit": "grams",
    "autoCalculateUsage": true
  }
}
```

### MCP Tools (7 tools)

| Tool | Description |
|------|-------------|
| `add_acquisition` | Add inventory to a possession |
| `add_usage` | Record usage/consumption |
| `add_reconciliation` | Record physical count |
| `get_inventory` | Get current inventory levels |
| `list_tracking_history` | Get full history |
| `calculate_remaining` | Calculate expected remaining |
| `reconcile_inventory` | Compare expected vs actual |

### REST Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/possessions/:id/acquisitions` | POST | Add acquisition |
| `/api/v1/possessions/:id/usage` | POST | Add usage |
| `/api/v1/possessions/:id/reconciliations` | POST | Add reconciliation |
| `/api/v1/possessions/:id/inventory` | GET | Get inventory levels |
| `/api/v1/possessions/:id/history` | GET | Get tracking history |

## Open Questions

1. **Migration**: How to handle existing voidline tracking.db data? (SQLite → PostgreSQL)
2. **Units**: Should we support multiple units or standardize on grams?
3. **Container tracking**: Keep container field or simplify?
4. **Date ranges**: Support for usage with start/end dates (for recurring usage)?

## Next Steps

1. Create migration to add `tracking` JSONB column to possessions
2. Add operations for CRUD on tracking data
3. Create MCP tools
4. Create REST handlers
5. Delete tracking from voidline
