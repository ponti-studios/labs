---
id: 4
title: "Railway remote build had no GitHub Packages auth (first 401)"
date: 2026-07-29
status: resolved
severity: high
category: ci-cd
services: [labs, railway, github-actions]
tags: [railway, github-packages, docker, ci, github-actions]
related_incidents: [6]
doc: docs/hominem-auth-integration.md
---

# Railway remote build had no GitHub Packages auth (first 401)

**Symptom:** after the above fixes, `deploy-labyrinth-prod` reported
success on GitHub Actions, but the user reported "The github actions for
labs is failing" / the Railway service was crashing.

**Root cause:** Railway's `railway up --detach --ci` uploads code and
returns immediately — the GitHub Actions job going green only confirms the
*upload* succeeded, not that Railway's own remote Docker build ("Metal
builder") completed. That remote builder has zero access to GitHub Actions
secrets by default, and the `Dockerfile` had no mechanism to receive a
GitHub Packages token for its own `pnpm install` of `@ponti-studios/*`
packages.

**Fix:**
- `Dockerfile`: added `ARG GITHUB_PACKAGES_TOKEN` to the `builder` stage,
  writing it into `~/.npmrc` before `pnpm install` — but only in the
  intermediate stage never copied into the final `runner` stage, so the
  token doesn't ship in the image (BuildKit still warns
  `SecretsUsedInArgOrEnv` since it persists in build cache/layer history).
- `.github/workflows/reusable-railway-deploy.yml`: added an optional
  `github_packages_token` secret input, and a step that runs `railway
  variables --set "GITHUB_PACKAGES_TOKEN=$GITHUB_PACKAGES_TOKEN" --service
  ... --skip-deploys` before `railway up` — this works because Railway
  auto-injects service variables as Docker build `ARG`s whenever the ARG
  name matches the variable name.
- `.github/workflows/deploy-playground-prod.yml`: passed
  `secrets.NODE_AUTH_TOKEN` through as `github_packages_token` (later found
  to be the wrong token — see incident 6).

**A secondary bug hit while wiring this in:** the first attempt used `if:
secrets.github_packages_token != ''` on a step, which caused the entire
run to fail validation with zero jobs scheduled ("workflow file issue")
despite valid YAML — GitHub Actions disallows referencing `secrets.*`
directly in a step's `if:` for reusable (`workflow_call`) workflows. Fixed
by routing it through `env: GITHUB_PACKAGES_TOKEN: ${{
secrets.github_packages_token }}` first and using `if: env.GITHUB_PACKAGES_TOKEN
!= ''`. Also had to add `packages: read` to
`reusable-railway-deploy.yml`'s workflow-level `permissions:` block, since a
reusable workflow's effective token permissions are the *intersection* of
caller and callee permission blocks — the caller alone granting
`packages: read` wasn't enough.
