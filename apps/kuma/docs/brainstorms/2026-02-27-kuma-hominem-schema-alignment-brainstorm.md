# Brainstorm: Align Kuma with Hominem's Shared PostgreSQL Schema

**Date:** February 27, 2026  
**Participants:** Charles Ponti  
**Status:** Brainstorm Complete

---

## What We're Building

Kuma needs to read and write data to the same PostgreSQL database that Hominem uses, without managing schema migrations. Hominem's schema is managed by Drizzle ORM in the `@hominem/db` package, while Kuma uses Goose for migrations.

**Key Constraint:** Hominem's schema changes are applied via Drizzle migrations (not Goose), so Kuma cannot and should not try to manage the schema.

---

## Why This Approach

**Current State:**
- Hominem: Uses `postgresql://postgres:postgres@localhost:5432/hominem` with Drizzle ORM
- Kuma: Uses `postgresql://mcp_server:devpassword@localhost:5433/hominem` (separate instance) with Goose

**Problem:** Kuma has its own isolated database instance and schema, preventing data sharing with Hominem.

**Solution:** Point Kuma to Hominem's database and align its code to work with Hominem's existing schema.

---

## Key Decisions

### 1. **Database Connection**
- ✅ Update Kuma's `DATABASE_URL` to use Hominem's connection string
- ✅ Use `postgresql://postgres:postgres@localhost:5432/hominem`
- ✅ Update `.env`, `docker-compose.yml`, and k8s configs

### 2. **Schema Management Strategy**
Three approaches considered:

#### **Approach A: No Goose Migrations (Recommended)**
- Kuma does NOT create/manage migrations
- Kuma reads the existing Hominem schema at startup
- Kuma's code adapts to Hominem's table structure
- **Pros:** Simple, no schema conflicts, Hominem remains source of truth
- **Cons:** Kuma must validate schema compatibility on startup
- **Best for:** Read/write access to shared tables without schema ownership

#### **Approach B: Goose Snapshot Migration**
- Create a single Goose migration that documents Hominem's current schema
- Migration is marked as "informational only" (no-op)
- Goose tracks that Kuma "knows about" the schema
- **Pros:** Goose history shows schema state, easier to track
- **Cons:** Adds complexity, requires manual sync if Hominem schema changes
- **Best for:** Audit trail and version tracking

#### **Approach C: Dual Migration Systems**
- Kuma maintains its own Goose migrations for Kuma-specific tables
- Hominem's tables are left untouched
- **Pros:** Clear separation of concerns
- **Cons:** Requires careful coordination, risk of conflicts
- **Best for:** Long-term if Kuma needs its own schema extensions

### 3. **Recommended Approach: A (No Goose Migrations)**

**Rationale:**
- Hominem is the source of truth for schema
- Kuma is a consumer/reader of that schema
- Goose introspection is NOT designed for this use case (goose doesn't have built-in introspection)
- Simpler, fewer moving parts, less risk of conflicts

**Implementation:**
1. Update Kuma's database connection to Hominem's PostgreSQL
2. Remove/disable Kuma's existing schema migrations (or keep them as reference)
3. Add schema validation at Kuma startup to verify expected tables exist
4. Update Kuma's code to use Hominem's table names and structure

---

## Deep Dive: Schema Compatibility Analysis

### 1. Schema Overlap - VERIFIED ✅

**Kuma's Expected Tables (from migrations):**
- `finance_accounts`, `transactions`, `tasks`, `events`, `notes`, `health`, `trips`
- Plus: `categories`, `budget_categories`, `budget_goals`, `job_applications`, `interviews`, etc.

**Hominem's Actual Tables (from Drizzle schema):**
- **Exact matches:** `finance_accounts`, `transactions`, `tasks`, `events`, `notes`, `health`, `trips`
- **Plus 50+ additional tables:** auth tables, career, chat, bookmarks, possessions, surveys, etc.
- **Auth system:** Hominem uses `auth_subjects`, `auth_sessions`, `auth_refresh_tokens`, `auth_passkeys`, `auth_device_codes`

**Conclusion:** ✅ All tables Kuma needs exist in Hominem's schema. No conflicts detected.

### 2. Column Compatibility - MOSTLY COMPATIBLE ⚠️

**Key Differences Found:**

| Table | Kuma Column | Hominem Column | Status |
|-------|------------|----------------|--------|
| `users` | `"isAdmin"` (camelCase) | Not in Drizzle schema | ⚠️ Kuma-specific |
| `notes` | `"userId"` (camelCase) | `user_id` (snake_case) | ⚠️ Naming mismatch |
| `bookmark` | `"userId"` (camelCase) | `user_id` (snake_case) | ⚠️ Naming mismatch |
| `finance_accounts` | All columns match | All columns match | ✅ Perfect match |
| `transactions` | All columns match | All columns match | ✅ Perfect match |

**Naming Convention Issue:**
- Kuma uses camelCase: `"userId"`, `"createdAt"`, `"updatedAt"`
- Hominem uses snake_case: `user_id`, `created_at`, `updated_at`
- **Impact:** Kuma's code must use snake_case when querying Hominem's schema

### 3. Row-Level Security (RLS) - CRITICAL ⚠️

**Kuma's Current RLS Setup:**
- Kuma has RLS policies in migration `20260216000005_add_rls_policies.sql`
- Policies likely restrict access by `user_id`

**Hominem's RLS Setup:**
- Hominem uses Drizzle ORM with auth system
- Auth tables: `auth_subjects`, `auth_sessions`, `auth_passkeys`
- Likely has RLS policies for multi-tenant isolation

**Potential Conflicts:**
- If both systems have RLS enabled on the same tables, they may conflict
- Kuma's RLS policies may not work with Hominem's auth context
- **Action Required:** Audit and merge RLS policies before deployment

### 4. Migration History Handling - DECISION NEEDED

**Current Kuma Migrations:**
```
20260216000000_hominem_schema.sql       (Base schema - 669 lines)
20260216000005_add_rls_policies.sql     (RLS setup)
20260216000006_add_mcp_integration.sql  (Kuma-specific)
20260217000001_add_extended_schema.sql  (Extended schema)
20260227000001_budget_schema.sql        (Budget tables)
20260227000002_categories_schema.sql    (Categories)
20260228000001_add_tracking_column.sql  (Tracking)
```

**Problem:** These migrations will conflict with Hominem's Drizzle migrations.

**Solution Options:**

**Option A: Delete Kuma Migrations (Recommended)**
- Remove all Kuma migrations
- Kuma connects to existing Hominem schema
- Kuma never runs migrations
- **Pros:** Clean, no conflicts, Hominem is source of truth
- **Cons:** Kuma has no migration history

**Option B: Archive Kuma Migrations**
- Move to `_archive/migrations/` for reference
- Document why they were archived
- **Pros:** Preserves history, clear audit trail
- **Cons:** Slightly more complex

**Option C: Create Kuma-Only Migrations**
- Keep only Kuma-specific tables (if any)
- Remove overlapping tables
- **Pros:** Kuma can track its own schema
- **Cons:** Complex to maintain, risk of divergence

**Recommendation:** **Option B (Archive)** - Preserves history while keeping codebase clean

---

## Implementation Roadmap

### Phase 1: Configuration & Connection (Low Risk)
1. Update `DATABASE_URL` to point to Hominem's PostgreSQL
   - `.env`: `postgresql://postgres:postgres@localhost:5432/hominem`
   - `docker-compose.yml`: Update service connection
   - `k8s/base/configmap.yaml`: Update DB_HOST, DB_PORT, DB_USER

2. Archive existing Kuma migrations
   - Move `migrations/` to `_archive/migrations/`
   - Document why in `_archive/README.md`

### Phase 2: Code Adaptation (Medium Risk)
1. Update Kuma's database queries to use snake_case column names
   - Search for `"userId"` → replace with `user_id`
   - Search for `"createdAt"` → replace with `created_at`
   - Search for `"updatedAt"` → replace with `updated_at`

2. Add schema validation at startup
   - Create `internal/db/schema_validator.go`
   - Check that required tables exist
   - Log warnings if tables are missing

3. Test data access
   - Run Kuma against Hominem's database
   - Verify CRUD operations work
   - Test with actual Hominem data

### Phase 3: RLS & Security (High Risk)
1. Audit RLS policies
   - Compare Kuma's RLS with Hominem's RLS
   - Identify conflicts
   - Merge policies if needed

2. Test multi-user isolation
   - Verify RLS policies work correctly
   - Test that users can only access their own data

3. Update auth context
   - Ensure Kuma uses Hominem's auth system
   - Verify JWT tokens work with both systems

### Phase 4: Testing & Validation
1. Integration tests
   - Test Kuma reading/writing to Hominem tables
   - Test concurrent access
   - Test error handling

2. Data consistency checks
   - Verify no data corruption
   - Check foreign key constraints
   - Validate indexes

---

## Goose Introspection Note

**Question:** Can Goose introspect an existing PostgreSQL schema?

**Answer:** No, Goose does NOT have built-in schema introspection. Goose is a migration runner, not a schema analyzer. It:
- Runs migrations you write
- Tracks which migrations have been applied
- Does NOT read existing schema and generate migrations

**Alternatives if introspection were needed:**
- Use `pg_dump` to export schema
- Use tools like `pgAdmin` or `DBeaver` for schema visualization
- Write custom Go code to query `information_schema`

**For this use case:** Introspection is unnecessary. Kuma should simply connect to Hominem's database and use the existing schema.

---

## Success Criteria

- ✅ Kuma connects to Hominem's PostgreSQL instance
- ✅ Kuma can read/write to Hominem's tables
- ✅ No schema conflicts or migration errors
- ✅ Kuma validates schema compatibility on startup
- ✅ Data is shared between Kuma and Hominem applications
