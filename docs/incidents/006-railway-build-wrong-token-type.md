---
id: 6
title: "Railway remote build 401, second occurrence (wrong token type)"
date: 2026-07-29
status: resolved
severity: high
category: ci-cd
services: [labs, railway, github-actions]
tags: [railway, github-packages, docker, ci, github-actions, tokens]
related_incidents: [4, 5]
doc: docs/hominem-auth-integration.md
---

# Railway remote build 401, second occurrence (wrong token type)

**Symptom (from the user's pasted logs):**
```
ERR_PNPM_FETCH_401 GET https://npm.pkg.github.com/download/@ponti-studios/ui/0.4.4/...: Unauthorized - 401
Build Failed: ... "pnpm install --frozen-lockfile --prod --ignore-scripts" did not complete successfully: exit code: 1
```
The token *was* being passed through correctly this time (visible in
plaintext in the build log, redacted here) —
but GitHub Packages still rejected it.

**Root cause:** the token's `npm_` prefix identifies it as an **npmjs.org**
access token (from `secrets.NODE_AUTH_TOKEN`), not a GitHub PAT (`ghp_` /
`github_pat_`). It was structurally the wrong *type* of credential — valid
only against `registry.npmjs.org`, never valid against
`npm.pkg.github.com`, regardless of how correctly it was plumbed through.

**Fix (commit `f7a573e6`):** `deploy-playground-prod.yml` now passes
`secrets.GITHUB_TOKEN` — the job's own automatic, ephemeral, already-proven
GitHub Packages-valid token (used successfully by the `migrate` job's own
`pnpm install` step earlier in the same workflow) — instead of
`NODE_AUTH_TOKEN`. `reusable-railway-deploy.yml`'s workflow-level
`permissions:` also gained `packages: read` for this to take effect
(same intersection-of-permissions rule as incident 4).

## Verification (following incident 5's lesson directly)

Rather than trust GitHub Actions' report again, a temporary
`workflow_dispatch`-only diagnostic workflow was added
(`.github/workflows/debug-railway-status.yml`) to query Railway's CLI
directly for the authoritative build/deploy logs of the triggered run.

Two iterations were needed to get the Railway CLI invocation right:
- `railway status --service <id>` doesn't accept a `--service` flag at all
  (that flag only exists on `railway logs`) — fixed to `railway status
  --json`, which works off the token's implicitly linked project without
  needing `railway link` first.
- `railway logs --service <id> --build` and `railway logs --service <id>`
  (deploy logs) both work with `--service`.

The resulting logs, read directly from Railway (not GitHub Actions),
confirmed a genuine success end to end:
- `[builder 6/6] RUN pnpm build` completed (`✓ built in 4.05s` for both
  client and SSR bundles).
- `exporting to docker image format` / `image push` completed.
- The new deploy container logged `Starting Container`.
- `curl -s -o /dev/null -w "%{http_code}" https://labs.ponti.io` → `200`.

The diagnostic workflow was then deleted (commit `bdb72f8c`) — it was
purely a one-time verification tool and isn't part of the permanent
pipeline (unlike the `github_packages_token` plumbing in
`reusable-railway-deploy.yml` / `deploy-playground-prod.yml` / `Dockerfile`,
which are permanent fixes).

**Commit sequence for incidents 4–6:** `4a23184d` (pass token into build),
`d438c5e1` (fix `secrets.*` in step `if:`), `f7a573e6` (fix token type),
`8768b58b`/`59d29af9` (add/fix debug workflow), `bdb72f8c` (remove debug
workflow).
