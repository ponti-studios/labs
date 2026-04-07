## Context

`packages/db` currently has two parallel realities:

- a Postgres + Drizzle path used by the current dumphim implementation
- a Kysely + MySQL path used by other apps, with migrations split across
  multiple directories

The rewrite needs a single canonical MySQL path before app work begins. This
change establishes the domain model and migration layout for
`relationship-intelligence` while keeping the existing app operational.

## Goals / Non-Goals

**Goals**

- Define the canonical MySQL schema for the new relationship manager.
- Make `packages/db/src/migrations` the canonical MySQL migration directory.
- Extend the shared Kysely `Database` interface with relationship tables.
- Document the rename and rollout path before UI implementation begins.

**Non-Goals**

- This change does not rewrite the frontend yet.
- This change does not migrate existing dumphim production data.
- This change does not remove the old Postgres/Drizzle dumphim path yet.
- This change does not introduce Redis, workers, or AI advice.

## Decisions

- **Canonical storage path:** MySQL migrations live in
  `packages/db/src/migrations`. Build output copies that directory to
  `dist/migrations`.
- **Table naming:** Shared MySQL tables use a `relationship_` prefix to avoid
  collisions with other apps in the same database.
- **Ownership model:** All private records are scoped by `owner_user_id`, using
  the external Hominem auth identity directly.
- **Invite sharing model:** Share scope is represented by explicit booleans
  (`share_summary`, `share_timeline`, `share_flags`, `share_checkins`) rather
  than JSON for easier querying and stricter typing.
- **Metrics model:** Daily rollups live in `relationship_metrics_daily`, which
  lets dashboards avoid expensive full-history aggregation on every request.

## Data Model

### Core tables

- `relationship_people`
- `relationship_stage_history`
- `relationship_events`
- `relationship_notes`
- `relationship_checkins`
- `relationship_flags`
- `relationship_friend_invites`
- `relationship_friend_votes`
- `relationship_metrics_daily`

### Key access patterns

1. Owner dashboard by `owner_user_id`, `status`, `updated_at`
2. Person timeline by `person_id` and event/check-in timestamps
3. Friend sentiment rollup by `person_id` and `invite_id`

## Rollout Plan

1. Land the shared MySQL types and migration layout.
2. Replace Atlas entirely with a native MySQL migration runner owned by
   `packages/db`.
3. Build the new server-side query layer against Kysely.
4. Rebuild the app shell and route tree around the new domain.
5. Remove or archive legacy dumphim-specific card components after feature parity
   is reached.

## Risks / Trade-offs

- **Migration runner drift:** SQL files can diverge from applied history.
  Mitigation: store checksums in `schema_migrations` and fail fast on mismatch.
- **Mixed DB paradigms:** Postgres and MySQL coexist in one package. Mitigation:
  keep migration and type boundaries explicit.
- **Rename churn:** changing app identity can break scripts and deployment names.
  Mitigation: sequence rename after the shared data layer stabilizes.

## Open Questions

- What final product name replaces `dumphim` in code, package names, and deploy
  config?
- Should local mirrored user profile data exist in MySQL, or are external auth
  IDs enough for MVP?
- Do friend invite links expire by default, or only when manually revoked?
