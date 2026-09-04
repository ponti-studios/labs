# Environment configuration contract

Every environment variable has an owner, a delivery phase, and a required
deployment target. Adding a reference in application code is incomplete until
the corresponding value is available at the phase where that code executes.

## Classify the variable before adding it

| Variable shape | Read when | Required configuration |
| --- | --- | --- |
| `process.env.NAME` in server code | Container startup or request handling | Server environment schema, `.env.example`, and the owning Railway service variable |
| `import.meta.env.VITE_NAME` | Vite build and browser execution | `.env.example`, the owning Railway service variable, and Docker `ARG`/`ENV` in the build stage when Docker builds the bundle |
| `secrets.NAME` in GitHub Actions | Workflow execution | GitHub Actions secret or environment secret, declared in the workflow contract |
| Railway reference variable | Railway variable resolution | Source variable and target-service reference both configured in the same environment |
| Public browser configuration | Build and browser execution | Treat as public; never put credentials or private URLs in it |

The same logical value may need two names and two delivery paths. For example,
Labs uses:

- `WHAT_APP_URL` for server-side redirects at runtime;
- `VITE_WHAT_APP_URL` for browser-facing links embedded by Vite at build time.

Do not assume that configuring the runtime variable makes the Vite variable
available to the compiled bundle.

## Required implementation steps

When adding or changing a variable:

1. Add it to the owning server environment schema when server code reads it.
2. Add the name and a safe local value to the package `.env.example`.
3. Search for every consumer and classify each use as runtime, build-time,
   browser-public, workflow, or Railway reference configuration.
4. For a `VITE_*` value in a Docker-built package, declare it in the Docker
   build stage:

   ```dockerfile
   ARG VITE_WHAT_APP_URL
   ENV VITE_WHAT_APP_URL=$VITE_WHAT_APP_URL
   ```

   The declaration must appear in the stage that runs the Vite build, before
   the build command. Declaring it only in the final runtime stage is too late.
5. Provision the value in every required target before merging:
   - Railway service variables for runtime and build-time application values;
   - GitHub Actions secrets for workflow-only credentials;
   - GitHub environment secrets when production approval or environment scope
     is required.
6. Never commit secret values, print them in CI logs, use `railway variable list
   --kv`, or paste them into issue comments or generated artifacts.
7. Add a failure test or startup validation for required server values.
8. Redeploy after changing a build-time value. It is embedded in the bundle and
   cannot be corrected by changing only the runtime environment.

## Safe repository scan

Run this scan from the repository root before merging an environment change:

```sh
rg -n --glob '!**/node_modules/**' \
  'process\.env\.[A-Z][A-Z0-9_]*|import\.meta\.env\.[A-Z][A-Z0-9_]*|secrets\.[A-Z][A-Z0-9_]*' \
  packages .github
```

For every match, verify the following matrix. The scan is a discovery aid; a
variable is not considered configured merely because it appears in an example
file.

| Check | Question |
| --- | --- |
| Owner | Which package/service owns the variable and its schema? |
| Local | Is the name present in the relevant `.env.example`? |
| Runtime | If server code reads it, is it present in the Railway service? |
| Build | If Vite reads it, is it present during the Docker build stage? |
| Docker | Does the relevant Dockerfile declare the build variable with `ARG` and expose it with `ENV` before the build? |
| Workflow | If Actions reads it, is the GitHub secret/environment secret present? |
| Publicity | Is the value safe to embed in browser JavaScript? |
| Verification | Does a test or post-deploy smoke check exercise the consumer? |

To inspect Railway variable names without exposing values, use the service IDs
and print only keys:

```sh
railway variable list \
  --project <project-id> \
  --environment <environment-id> \
  --service <service-id> \
  --json \
  | jq -r 'keys[]' \
  | sort
```

Never use `--kv` for a diagnostic log. Compare names only, then verify values
through the Railway dashboard or a deploy/startup check that does not print
secrets.

## Current Labs and What boundary

| Service | Variable | Phase | Expected production value |
| --- | --- | --- | --- |
| Labs | `WHAT_APP_URL` | Runtime | `https://what.ponti.io` |
| Labs | `VITE_WHAT_APP_URL` | Docker/Vite build and browser | `https://what.ponti.io` |
| What | `WHAT_APP_URL` | Runtime | `https://what.ponti.io` |
| What | `PORTLESS_URL` | Local runtime only | Per-worktree `https://<name>.lvh.me:4200` |
| What | `GAME_ADMIN_EMAILS` | Runtime admin access | Comma-separated Hominem admin email addresses; required in production |

Local examples use `https://what.lvh.me:4200` for the What app under portless.
Portless injects `PORTLESS_URL` for each worktree, and What uses it for
worktree-specific auth return URLs at runtime. If a different service consumes
one of these values, update the table and the owning package example together.

## Verification sequence

After provisioning or changing a variable:

1. Confirm the variable name exists in the target Railway service without
   displaying its value.
2. Run package typechecks/tests and the Docker/build validation relevant to the
   consumer.
3. Run CI and confirm the deployment uses the intended commit.
4. For a Vite value, inspect the resulting public behavior; runtime logs alone
   cannot prove that the value was embedded in the bundle.
5. For a server value, verify startup and the endpoint that consumes it.
6. If a service crashes with a missing `VITE_*` value, inspect the Dockerfile
   build stage first, then the Railway variable configuration, then the source.
