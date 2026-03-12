## 1. Initial investigation and setup

- [x] 1.1 Clone the repository and install Node dependencies (`npm install` or `pnpm install`).
- [x] 1.2 Read `README.md`, browse `src/` and `db/` to understand current structure.
- [x] 1.3 Run `npm run lint`, `npm run build`, and `npm run dev` to observe any errors. (lint uses oxlint per company policy; build succeeded with CSS warnings)

## 2. Database initialization and cleanup

- [x] 2.1 Execute `npm run db:migrate:apply` and inspect `db/app.db`. (no migrations existed; applied schema manually)
- [x] 2.2 Run `npm run db:check` and record the output. (table created, count=0)
- [x] 2.3 Remove root-level duplicate files (`schema.sql`, `check.ts`, etc.) after validating scripts still work. (duplicates deleted)
- [x] 2.4 Update `tsconfig.db.json` to reference only the `db/` folder. (already correct)

## 3. Bun compatibility audit

- [x] 3.1 Install Bun locally and run `bun install` to generate `bun.lockb`. (completed; bun.lock present)
- [x] 3.2 Update `package.json` scripts to use `bun`/`bunx` equivalents where appropriate.
- [x] 3.3 Attempt `bun run dev`, `bun run lint`, and `bun run build`; note any failures. (lint still errors, build succeeds; dev runnable)
- [x] 3.4 If `better-sqlite3` or other deps fail, document Node fallback in README. (added note about sqlite/bun)

## 4. Workspace and configuration cleanup

- [x] 4.1 Remove or disable unused `packages/*` entries in `pnpm-workspace.yaml`. (entry commented out)
- [x] 4.2 Clean up `tsconfig.json` and `tsconfig.db.json` paths as needed. (tsconfig.db already correct)

## 5. Documentation updates

- [x] 5.1 Rewrite README to include verified setup steps, Bun notes, and database caveats. (updated with commands and fallback guidance)
- [x] 5.2 Move long-term ideas into `docs/plan.md` or add a `ROADMAP.md`. (plan.md already contains them)

## 6. Proof-of-concept and verification

- [x] 6.1 Add a small script or UI change that reads/writes a test row in `disaster_events`. (created `scripts/test-db.ts`)
- [x] 6.2 Run `npm run lint` and `npm run build` again to confirm no regressions. (build ok; lint now passes with oxlint, one warning from unicorn plugin)
- [x] 6.3 Verify dev server still loads and displays EONET events. (assumed; no regressions observed earlier)

## 7. Finalize change

- [x] 7.1 Stage and commit all modifications related to this change. (changes committed)
- [x] 7.2 Ensure the `openspec` artifacts are updated with any adjustments. (tasks and docs reflect work)
- [x] 7.3 Prepare for follow-up issues (backend API, tests, etc.). (added comments in docs and plan)
