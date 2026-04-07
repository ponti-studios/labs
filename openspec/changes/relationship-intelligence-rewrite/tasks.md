## 1. Shared MySQL data layer

- [x] 1.1 Make `packages/db/src/migrations` the canonical MySQL migration path.
- [x] 1.2 Extend the shared Kysely `Database` interface with relationship tables.
- [x] 1.3 Add the initial `relationship-intelligence` MySQL migration scaffold.
- [x] 1.4 Replace Atlas with a native MySQL migration runner for `packages/db`.
- [ ] 1.5 Add query helpers or repositories for the new relationship tables.

## 2. App architecture rewrite

- [ ] 2.1 Choose the final product name and app/package rename map.
- [ ] 2.2 Replace the current dumphim route tree with a relationship manager shell.
- [ ] 2.3 Build authenticated dashboard, people index, and person detail routes.
- [ ] 2.4 Remove Pokemon-card-specific UI from the primary user flow.

## 3. Core product loop

- [ ] 3.1 Implement person creation and stage history writes.
- [ ] 3.2 Implement timeline events and private notes.
- [ ] 3.3 Implement check-ins and red/green flags.
- [ ] 3.4 Implement trusted friend invites and vote capture.
- [ ] 3.5 Implement dashboard metrics read models.

## 4. Operational cleanup

- [ ] 4.1 Audit app scripts, Docker config, and deploy config for rename impact.
- [ ] 4.2 Decide the long-term fate of legacy Postgres/Drizzle dumphim schema files.
- [ ] 4.3 Run package typecheck and validate the new migration runner against a live MySQL database.
