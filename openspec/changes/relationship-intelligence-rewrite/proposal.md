## Why

The current `apps/dumphim` product is a playful relationship voting prototype,
but the real opportunity is a private-first relationship intelligence system
that helps users evaluate multiple relationships over time using structured
events, notes, check-ins, flags, and trusted friend input.

The monorepo already has the right primitives: React Router v7 SSR, a shared UI
package, external Hominem auth, and a shared `@pontistudios/db` package with a
Kysely + MySQL client. The rewrite should use those primitives directly instead
of extending the old Postgres + Pokemon-card implementation.

## What Changes

- Reframe `dumphim` into a new product identity: `relationship-intelligence`.
- Establish a new MySQL domain model in `packages/db` for people, timeline
  events, notes, check-ins, flags, friend invites, votes, and daily metrics.
- Canonicalize MySQL migrations inside `packages/db/src/migrations` so the
  shared package has one clear migration path.
- Replace the Pokemon-card UI with a mature, private-first relationship manager
  shell.
- Preserve external Hominem auth and React Router v7 + Hono SSR.

## Capabilities

### New Capabilities
- `relationship-people`: Track multiple active, paused, ended, or archived
  relationships.
- `relationship-timeline`: Record events, stage changes, and notes over time.
- `relationship-signals`: Record check-ins and red/green flags.
- `trusted-friend-input`: Invite trusted friends to give contextual opinions.
- `relationship-analytics`: Materialize daily health metrics for dashboards.

### Modified Capabilities
- `dumphim-voting`: Reduced from the core product identity to a scoped social
  signal inside a broader private workflow.

## Impact

Affected systems include:

- `packages/db` - new MySQL table types, migration files, and migration config.
- `apps/dumphim` - app identity, route model, UI shell, and data access.
- Linear / planning artifacts - roadmap split into schema, shell, and core loop.

The rewrite intentionally does not migrate the existing Postgres/Drizzle dumphim
tables forward. The MySQL path becomes canonical for the new product.
