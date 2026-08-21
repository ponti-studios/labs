# Deployment and routing lessons

This document records the deployment lessons from moving What out of Labs and
making Labs' legacy game URLs redirect to the standalone What app. Future
agents should treat these rules as part of the deployment contract, not as
optional troubleshooting advice.

## What we missed

The failures were distributed across several boundaries:

1. **Application tests passed, but the public route was not verified.** The
   redirect loader had unit coverage, but the test supplied `WHAT_APP_URL`
   directly. It did not prove that the production Labs service had the right
   variable, that the deployed build contained the route, or that
   `labs.ponti.io` returned the expected `Location` header.
2. **The deploy context was assumed rather than checked.** The Labs Dockerfile
   uses root workspace files such as `pnpm-workspace.yaml`, while the workflow
   deployed `packages/labs` as the source root. Railway therefore could not
   build the service. A successful workflow submission was mistaken for a
   successful application deployment.
3. **Environment variables drifted.** The code used `WHAT_APP_URL`, while
   Railway also contained the stale `WHAT_APP_ORIGIN` pointing at an old
   Railway hostname. There was no checked-in inventory saying which variable
   each runtime actually consumes, which made the stale value difficult to
   identify.
4. **The migration was validated at the wrong layer.** CI migrated a test
   database, but production migration status and application deployment order
   were separate concerns. The database workflow now needs to be a successful
   gate before application deploy workflows run.
5. **Route configuration errors appeared only in CI.** React Router assigns IDs
   from route definitions. Reusing the same route module for two routes created
   a duplicate route ID, even though the TypeScript source looked reasonable.
   Generated route/type checks must be treated as part of route editing.

## Contracts to preserve

### URL and environment contract

- `packages/what/src/lib/server/env.ts` owns What's server environment schema.
- Labs redirects use `WHAT_APP_URL`; browser-facing Labs links use
  `VITE_WHAT_APP_URL`.
- Production values for both are `https://what.ponti.io`.
- Local values for both are `http://localhost:5173`.
- Do not derive these URLs from `NODE_ENV`, hard-code a Railway hostname, or
  introduce a second similarly named variable without updating the owning env
  schema and this document.
- After changing a URL variable, inspect the deployed service's variables and
  make a request to the public domain. A local `.env.example` is not evidence
  that Railway is configured.

### Routing contract

- What owns the game UI, game API, auth return handling, and game persistence.
- Labs does not proxy or recreate What routes.
- Any intentionally retained Labs game entry point must be an explicit redirect
  route, preserve only the supported query parameters, and be tested with both
  local and production origins.
- A route module reused by multiple React Router paths needs distinct route IDs.
- `tz` is not a supported query parameter. Timezone state is transported in the
  `what_timezone` cookie and invalid or missing values resolve to `UTC`.

### Railway build contract

Before changing a deploy workflow, inspect all three together:

- the service Dockerfile;
- the service's `railway.json`;
- `.github/workflows/reusable-railway-deploy.yml` and the caller's
  `deploy_path`.

For this workspace, the Labs and What Dockerfiles require the monorepo root as
their build context. Their workflows therefore deploy with an empty
`deploy_path`; `railway.json` selects the package Dockerfile. A package
subdirectory is only a valid deploy root if the Dockerfile can build without
root workspace files.

### CI and migration ordering contract

The required production sequence is:

```text
CI succeeds
  -> deploy-db-prod succeeds when packages/db changes
    -> application deploy workflows may run
```

- CI uses the Foundation test database and runs the normal Drizzle migration
  command against that disposable test target.
- Production migrations run only in `deploy-db-prod`, never in an application
  deploy or game-generation workflow.
- Application deploy workflows must be triggered from the successful database
  workflow and must check the source SHA from that workflow.
- A database change must not be hidden by a no-op deploy. The change detector,
  workflow trigger, and migration command must be tested together.
- Never repair production by dropping or resetting the database. Inspect
  Drizzle's migration tracker and follow the repository migration rules.

## Required verification for future changes

### Before commit

- Run the relevant package typecheck and tests.
- Run the generated route/typecheck command when editing React Router routes.
- Run `actionlint` and inspect workflow `workflow_run` SHA handling when editing
  Actions.
- Confirm `git diff --check` is clean.
- For deploy changes, verify the Dockerfile paths and build context from the
  repository root.

### After CI and deployment

Check the complete chain, in order:

1. CI is green for the intended commit SHA.
2. `deploy-db-prod` is green or correctly reports that no database changes are
   required.
3. The expected Labs/What Railway deployment exists for that same SHA and is
   actually `SUCCESS`, not merely submitted or detached.
4. Public smoke tests follow redirects and inspect the final URL:

   ```sh
   curl -sS -D - -o /dev/null https://labs.ponti.io/games/realitea
   curl -sS -D - -o /dev/null https://labs.ponti.io/games/what
   curl -sS -D - -o /dev/null https://what.ponti.io/
   ```

   The retained Labs redirect should point to `https://what.ponti.io/` in
   production. It must not point to a `*.up.railway.app` hostname.
5. Verify the auth flow's return target and confirm no `tz` query parameter is
   added by the game API. Verify timezone behavior with a valid,
   missing/malformed, and invalid `what_timezone` cookie.

## Diagnostic order

When a public game link fails, diagnose from the outside inward:

1. Inspect the public response's status and `Location` header.
2. Inspect the deployed service's environment variables without printing
   secrets.
3. Check the Railway deployment status and build logs for the exact commit.
4. Compare the workflow's `deploy_path` with the Dockerfile's required context.
5. Only then debug route code, loaders, or database behavior.

This order prevents spending time changing application code when the request is
still being served by an old deployment or the new deployment never built.
