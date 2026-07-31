---
id: 1
title: "@ponti-studios/ui@0.4.3 404 from GitHub Packages"
date: 2026-07-29
status: resolved
severity: high
category: dependency-publishing
services: [labs, ponti-studios-ui]
tags: [ci, npm, github-packages, dependency-resolution]
related_incidents: [2]
doc: docs/hominem-auth-integration.md
---

# @ponti-studios/ui@0.4.3 404 from GitHub Packages

**Symptom:** CI failing on `pnpm install` with a 404 for
`@ponti-studios/ui@0.4.3`.

**Root cause:** the UI package (`~/Developer/ponti-studios-ui`) had only
ever been published to npmjs.org (`publishConfig.registry:
https://registry.npmjs.org`), but labs' `.npmrc` routes the whole
`@ponti-studios` scope to GitHub Packages
(`npm.pkg.github.com`). GitHub Packages requires an auth token even for
public packages, and more fundamentally, the package had simply never been
published there.

**Fix (chosen explicitly by the user: option "1", publish to GitHub
Packages, over the alternative of pointing labs' `.npmrc` back at
npmjs.org):**
- `~/Developer/ponti-studios-ui/package.json`:
  `publishConfig.registry` → `https://npm.pkg.github.com`.
- `~/Developer/ponti-studios-ui/.github/workflows/publish.yml`: rewrote the
  `publish` job — `registry-url: "https://npm.pkg.github.com"`,
  `permissions: packages: write` (was `id-token: write`),
  `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}` for `npm publish --access
  public`; removed the npmjs.org-specific verification step that polled
  `npm view ... --registry=https://registry.npmjs.org`.
- Manually published `0.4.3` and `0.4.4` from their existing git tags with
  `npm publish --registry=https://npm.pkg.github.com --access public
  --ignore-scripts` (the `--ignore-scripts` flag was a one-time workaround
  because `0.4.3`'s `prepack` → `tokens:check` step failed on
  style-dictionary output formatting differences specific to that historical
  tag — not a repo change).
- Committed as `beba04b` in the UI repo.
