# Core development flows

This is the operational checklist for changes that cross application code,
environment configuration, databases, authentication, or deployment. Use it
before opening a pull request and again when verifying the deployed result.

The general flow is:

```text
classify the change
→ update the owning contract
→ provision external configuration
→ run local checks
→ run CI
→ run the ordered deployment
→ verify public behavior
```

## Add or change an environment value

Use the detailed [environment configuration contract](environment-configuration.md)
for the required scan and delivery matrix.

1. Add the variable to the owning server environment schema. For What, this is
   `packages/what/src/lib/server/env.ts`; do not create an ad-hoc validator.
2. Add the variable name and a safe local value to the package `.env.example`.
3. Search the repository for existing names and consumers. Reuse the canonical
   name instead of adding aliases such as `WHAT_APP_URL` and `WHAT_APP_ORIGIN`.
4. Classify the value:

   - **Secret:** provision the real value in Railway and, if a workflow needs
     it, as a GitHub Actions secret before merging. Never commit it, put it in
     an example file, or print it in logs.
   - **Server-only non-secret:** configure it in Railway before merging and
     document the local and production values. Validate it at startup.
   - **Browser/build-time (`VITE_*`):** treat it as public. Configure it in the
     relevant Railway build environment and document that it must not contain
     credentials.
   - **Derived value:** compute it from the owning configured value rather than
     duplicating it in multiple variables.

5. Before merging, inspect the target Railway service variables without
   exposing secret values. A required production variable must already exist;
   the merge must not be the first time production discovers the omission.
6. Add or update a test for missing, malformed, and representative valid values
   where the variable affects behavior.
7. After deployment, verify startup and the public path that consumes it.

## Change a database schema

1. Edit the Drizzle schema, never a generated migration or tracker by hand.
2. Run `pnpm db:generate`.
3. Run `pnpm db:migrate` against the Foundation test database and run the
   affected tests.
4. Commit the schema, generated migration, snapshot, and journal together.
5. CI must pass before production migration begins.
6. The `migrate` job in `ci.yml` is the only production migration job.
   It runs on every production deployment and is a no-op when there are no
   pending migrations. Application deploys and game-generation workflows must
   not run migrations.
7. Labs and What deployment may proceed only after the migration job succeeds.
8. If production is inconsistent, inspect Drizzle's migration tracker and
   follow the migration recovery rules in `AGENTS.md`. Never reset or drop the
   database to make a migration pass.

## Change a route, redirect, or cross-service link

1. Identify the service that owns the UI, API, auth return handling, cookie,
   and persistence. Do not duplicate a route in a legacy service after moving
   ownership.
2. Use configured origins. Do not derive production URLs from `NODE_ENV` or
   hard-code a Railway hostname.
3. Test the loader/component and run React Router route generation plus the
   package typecheck. Reused route modules need unique route IDs.
4. Test local and production-like origins, including query-string preservation
   and removal of unsupported parameters.
5. For What, timezone travels in the `what_timezone` cookie. `tz` query
   parameters are ignored; missing, malformed, or invalid cookie values fall
   back to `UTC`.
6. After deployment, test the public URL with headers and follow the complete
   redirect chain. Confirm custom domains, not `*.up.railway.app` URLs.

## Move functionality between services

Before merging, record the new owner for each boundary:

| Boundary | Required decision |
| --- | --- |
| UI | Which service renders the page? |
| API | Which service handles data loaders and mutations? |
| Auth | Which service builds and receives the auth return URL? |
| Persistence | Which database schema and migration owns the data? |
| Environment | Which service receives each variable? |
| Legacy URL | Is it removed or an explicit redirect? |

Then update links, auth return URLs, cookies, CORS, environment configuration,
deployment paths, and smoke tests as one change. A package-level test is not
enough for a cross-service move.

## Change Railway or GitHub Actions deployment

Inspect the Dockerfile, `railway.json`, reusable workflow, and calling workflow
together. Confirm:

- the deploy context contains every file copied by the Dockerfile;
- the staged Railway config points to the intended package Dockerfile;
- the start command exists in the built image;
- `deploy_path` matches the Dockerfile's required context;
- CI runs before database deployment;
- database deployment runs before application deployment;
- workflow-run jobs use the source SHA that was tested;
- the job observes the actual Railway deployment result, not just a detached
  submission.

Run `actionlint` and test changed-file detection for application-only,
database-only, shared-package, and workflow-only changes.

## Change authentication or return URLs

- Use Hominem as the only auth authority.
- Test unauthenticated and authenticated requests.
- Verify the configured local and production origins separately.
- Confirm cookies are forwarded where required.
- Confirm the final return URL is the owning app's custom domain.
- Confirm obsolete query parameters are not added during the redirect.

## Change generated game content

- Use the single documented generator entry point.
- Test timezone/date behavior with cookie, missing, malformed, and invalid
  values.
- Ensure generation does not perform production migrations.
- Verify scheduled and manual modes use the same workflow.
- Check the generated result through the public game API.

## Deployment verification

For every production-affecting change, verify in order:

1. CI is green for the intended commit SHA.
2. The database workflow is green or correctly reports no database changes.
3. The expected Railway deployment exists for that SHA and is `SUCCESS`.
4. The public endpoint returns the expected status, headers, and content.
5. The primary user flow works from the public entry point through auth, API,
   cookies, and persistence.

For a redirect, the minimum check is:

```sh
curl -sS -D - -o /dev/null https://labs.ponti.io/games/realitea
```

For failures, diagnose outside-in: public response, deployed variables,
Railway deployment/build logs, workflow build context, then application code.
