# Agent Rules — Labs

This file defines hard constraints for AI agents working in this repository.
Violating these rules will produce incorrect or unsafe work.

## Required operational guide

Before making changes that affect environment variables, routes, databases,
authentication, cross-service ownership, or deployment, read
[Core development flows](docs/operations/core-development-flows.md) and
[Deployment and routing lessons](docs/operations/deployment-and-routing.md).
These documents define the required pre-merge provisioning, CI ordering, and
post-deployment verification steps.

For any environment-variable change, also read the
[environment configuration contract](docs/operations/environment-configuration.md).
It requires agents to classify runtime versus build-time values, declare Vite
variables in Docker build stages, and scan production/GitHub configuration before
merging. Labs is deployed to Fly; inspect `fly.toml`, the Fly deploy workflow,
and GitHub Actions secrets together.

## Data ownership

Hominem owns PostgreSQL data, schema changes, and production migrations. Labs
must not connect directly to that database or add database migration steps to
GitHub Actions. Persistent Labs features use an owning Hominem API. Historical
SQL migrations in `migrations/` are retained for history and are not executed
by Labs CI or deployment workflows.

## Script Environment Validation

Labs scripts must validate required environment values through the schemas in
`app/lib/server/env.ts`.

- ❌ Do not define ad-hoc `requireEnvironment()` functions
- ❌ Do not inline `if (!process.env.X)` checks for required configuration

## Authenticated Testing

- For every UI change, verify the result in a browser before considering the
  work complete. Use the local app and its dedicated test account when the UI
  requires authentication; capture a screenshot when it helps document the
  result or the user asks for one.
- Browser, manual, and end-to-end tests that need an authenticated Labs user use the local test account `test@lvh.me`. Never use a personal account for testing.
- Keep authenticated testing on local or explicitly disposable test services; never submit test-account credentials or OTPs to production.
- For local sign-in, trigger the OTP from the app, then retrieve it with Hominem's `just otp test@lvh.me` helper. Do not read the mailbox file directly.
- Unit tests that mock authentication can keep using isolated fixture identities. Multi-user tests may use additional synthetic test accounts when distinct identities are required.

## Authentication (Hominem)

Hominem's Better Auth deployment is the sole auth authority for this repo. Labs
never issues or validates its own sessions, and never hosts a login form.

- Session checks go through `getHominemUser()` in `app/lib/server/hominem-auth.ts`
  (server-only — it forwards the request's `Cookie` header to the Hominem API).
- To send a player to sign in, use `buildHominemLoginUrl(returnTo)`. `returnTo`
  must be an absolute Labs URL; the Hominem API only honors origins it trusts as
  `LABS_URL`.
- ❌ Do not add a login/OTP form, session table, or token issuance to this repo.

### Public npm Packages

`@ponti-studios/auth` and `@ponti-studios/ui` are published as public npm
packages. No GitHub Packages token or registry override is required to install
them locally or in CI.

## Storybook Development Only

- Storybook is development-only in this repository.
- Never run `storybook build`, `build-storybook`, or any equivalent production Storybook export.
- Use the `storybook` script for local validation — Labs runs `storybook dev -p 6007` from the repository root.
- Do not add CI, package scripts, or deployment steps that build Storybook statically.
