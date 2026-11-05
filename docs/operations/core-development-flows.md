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

1. Add the variable to the owning server environment schema. Newsboy owns its
   schema in its separate repository; do not duplicate it in Labs.
2. Add the variable name and a safe local value to the root `.env.example`.
3. Search the repository for existing names and consumers. Reuse the canonical
   name instead of adding aliases such as `NEWSBOY_APP_URL` and `NEWSBOY_APP_ORIGIN`.
4. Classify the value:

   - **Secret:** provision the real value in the owning production service
     and, if a workflow needs it, as a GitHub Actions secret before merging.
     Never commit it, put it in an example file, or print it in logs.
   - **Server-only non-secret:** configure it in the owning production service
     before merging and document the local and production values. Validate it
     at startup.
   - **Browser/build-time (`VITE_*`):** treat it as public. Configure it in the
     relevant production build environment and document that it must not
     contain credentials.
   - **Derived value:** compute it from the owning configured value rather than
     duplicating it in multiple variables.

5. Before merging, inspect the target production service variables without
   exposing secret values. A required production variable must already exist;
   the merge must not be the first time production discovers the omission.
6. Add or update a test for missing, malformed, and representative valid values
   where the variable affects behavior.
7. After deployment, verify startup and the public path that consumes it.

## Change persistent data

Hominem owns PostgreSQL data, schema changes, and production migrations. Labs
must not add or run database migrations from GitHub Actions. Persistent Labs
features use an owning Hominem API; make schema or API changes in the Hominem
repository. Historical SQL migrations in Labs are retained for history and are
not part of its CI or deploy sequence.

## Change a route, redirect, or cross-service link

1. Identify the service that owns the UI, API, auth return handling, cookie,
   and persistence. Do not duplicate a route in a legacy service after moving
   ownership.
2. Use configured origins. Do not derive production URLs from `NODE_ENV` or
   hard-code a hosting-provider hostname.
3. Test the loader/component and run React Router route generation plus the
   root app typecheck. Reused route modules need unique route IDs.
4. Test local and production-like origins, including query-string preservation
   and removal of unsupported parameters.
5. For Newsboy, timezone travels in the `newsboy_timezone` cookie. `tz` query
   parameters are ignored; missing, malformed, or invalid cookie values fall
   back to `UTC`.
6. After deployment, test the public URL with headers and follow the complete
   redirect chain. Confirm custom domains, not provider hostnames.

## Move functionality between services

Before merging, record the new owner for each boundary:

| Boundary    | Required decision                                      |
| ----------- | ------------------------------------------------------ |
| UI          | Which service renders the page?                        |
| API         | Which service handles data loaders and mutations?      |
| Auth        | Which service builds and receives the auth return URL? |
| Persistence | Which database schema and migration owns the data?     |
| Environment | Which service receives each variable?                  |
| Legacy URL  | Is it removed or an explicit redirect?                 |

Then update links, auth return URLs, cookies, CORS, environment configuration,
deployment paths, and smoke tests as one change. A package-level test is not
enough for a cross-service move.

## Change Fly or GitHub Actions deployment

Inspect the Dockerfile, `fly.toml`, reusable Fly workflow, and calling workflow
together. Confirm:

- the deploy context contains every file copied by the Dockerfile;
- the root Fly config points to the root Dockerfile and matches the production
  app's port, health check, region, and machine sizing;
- the start command exists in the built image;
- the deploy workflow uses the checked-in root `fly.toml` and an app-scoped
  `FLY_API_TOKEN` GitHub secret;
- CI and build finish before Labs deployment; Hominem manages database
  migrations separately;
- workflow-run jobs use the source SHA that was tested;
- the job waits for the Fly deployment and machine health checks to finish.

Run `actionlint` and check changed-file detection for app, database, and
workflow changes.

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
2. The expected Fly deployment exists for that SHA and its machines pass
   health checks.
3. The public endpoint returns the expected status, headers, and content.
4. The primary user flow works from the public entry point through auth, API,
   cookies, and persistence.

For the standalone game, the minimum check is:

```sh
curl -sS -D - -o /dev/null https://newsboy.ponti.io/
```

For failures, diagnose outside-in: public response, deployed variables, Fly
deployment/build logs, workflow build context, then application code.
