---
id: 9
title: "GitHub Packages unreadable on Railway; then the npm republish shipped a broken package"
date: 2026-07-29
status: resolved
severity: critical
category: dependency-publishing
services: [labs, railway, ponti-studios-auth, ponti-studios-ui]
tags: [railway, npm, github-packages, exports, pnpm-patch, ci]
related_incidents: [4, 6, 8]
doc: docs/hominem-auth-integration.md
---

# GitHub Packages unreadable on Railway; then the npm republish shipped a broken package

## Part A — Railway couldn't install from GitHub Packages at all

At some point after incident 6 (which set up `GITHUB_PACKAGES_TOKEN`
plumbing through `Dockerfile`/`reusable-railway-deploy.yml` to let Railway's
remote builder authenticate to `npm.pkg.github.com`), Railway's build
environment stopped being able to read GitHub Packages entirely — this
affected any Hominem-owned package (`@ponti-studios/auth`,
`@ponti-studios/ui`) that labs depended on.

**Fix:** both packages were republished to the public npmjs.org registry
instead (`@ponti-studios/ui@0.6.0`, `@ponti-studios/auth@0.1.1`). Labs'
`main` commit `4e7ee459` ("Consume public auth and UI packages") removed all
the `GITHUB_PACKAGES_TOKEN` plumbing this repo had accumulated: the
`@ponti-studios:registry=https://npm.pkg.github.com` line in `.npmrc`, the
`Authorization to GitHub Packages` step in every CI workflow
(`ci.yml`, `deploy-playground-prod.yml`, `realitea-generate.yml`), the
`ARG GITHUB_PACKAGES_TOKEN`/`railway variables --set` steps in the Dockerfile
and `reusable-railway-deploy.yml`, and the corresponding `AGENTS.md`
section — net simplification, since installing from a public npm registry
needs no token at all. Deployed cleanly (`deploy-labyrinth-prod` run
`30517155439`, verified green).

## Part B — the republished @ponti-studios/auth@0.1.1 had broken subpath exports

The very next deploy broke differently — the Railway build log showed:

```
Error: [vite]: Rolldown failed to resolve import "@ponti-studios/auth/server"
from "/app/app/lib/server/hominem-auth.ts".
```

**Root cause**, confirmed by inspecting the actual published tarball
(`npm pack @ponti-studios/auth@0.1.1`):

- `package.json`'s `"files": ["build"]` means only the compiled
  `build/*.js` output is included in what's published — `src/` is excluded.
- But the top-level `"exports"` field in that same `package.json` still
  points every subpath at `./src/*.ts` (e.g. `"./server": {"default":
  "./src/server.ts"}`) — files that don't exist in the published package.
- The package correctly has a `"publishConfig": { "exports": {...} }` block
  pointing every subpath at the matching `./build/*.js` file instead — the
  standard fix-up mechanism for exactly this situation. But Node's module
  resolution (and Vite/Rolldown, which follows it) only ever reads the
  **top-level** `"exports"` field at runtime; `publishConfig` is purely a
  publish-time instruction the publishing tool is responsible for promoting
  into the real fields *before* writing to the registry. That promotion
  never happened — the published manifest has both blocks present,
  unswapped.
- Confirmed `@ponti-studios/ui@0.6.0` does **not** have this problem — its
  `files` field (`["src", ...]`) matches its own top-level `exports`
  (`./src/*.ts`) exactly, since that package ships raw source with no build
  step. Isolated to `@ponti-studios/auth`.
- No earlier working version exists to fall back to — `0.1.1` is the only
  version ever published to npmjs.org for this package.

**Stopgap fix (this repo, commit `0b94b458`):** a `pnpm patch`
(`patches/@ponti-studios__auth@0.1.1.patch`, registered via
`pnpm-workspace.yaml`'s `patchedDependencies`) that rewrites the installed
package's `exports` field to match its own `publishConfig.exports`
verbatim — i.e. every subpath now correctly points at `./build/*.js`. The
`Dockerfile`'s first `COPY` step was extended to include
`pnpm-workspace.yaml` and `patches/` alongside `.npmrc`/`package.json`/
`pnpm-lock.yaml`, so the patch applies on the very first `pnpm install`
layer, not just the later full one.

Verified in three stages before pushing: local `pnpm build` (clean cache),
a full local `docker build .` (reproducing Railway's exact build
environment), and finally the real Railway build log itself via `railway
logs --service labyrinth --build` (not just GitHub Actions reporting green)
through to a passing healthcheck.

**The durable fix belongs upstream**, in `@ponti-studios/auth`'s own publish
pipeline (make the publish step actually promote `publishConfig.exports`
into `exports` before `npm publish`, then republish as `0.1.2`) — out of
scope for this repo, which only patches around it.

**Lesson for next time:** `publishConfig` overrides are not automatically
applied by a plain `npm publish` for arbitrary fields like `exports` — only
a small, npm-version-dependent set of fields (`registry`, `tag`, `access`,
...) get auto-promoted, and even that has shifted across npm versions. A
package publish step that relies on `publishConfig.exports` needs to either
use a purpose-built tool that performs this promotion (e.g. `publint`-aware
tooling, or a manual `package.json` swap script) or hand-author the
top-level `exports` to already point at the built output. `pnpm build`
succeeding for the *publishing* package proves nothing about whether its
*consumers* can resolve it — the failure only surfaces downstream, in
whoever's `pnpm install` + bundler tries to actually import a subpath.
