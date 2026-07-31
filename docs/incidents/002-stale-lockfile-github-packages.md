---
id: 2
title: "Still 404 after publishing: stale lockfile"
date: 2026-07-29
status: resolved
severity: medium
category: dependency-publishing
services: [labs]
tags: [ci, npm, github-packages, pnpm, lockfile]
related_incidents: [1]
doc: docs/hominem-auth-integration.md
---

# Still 404 after publishing: stale lockfile

**Symptom:** publishing the package didn't fix labs' install.

**Root cause:** labs' `pnpm-lock.yaml` had a stale entry for
`@ponti-studios/ui@0.4.3` left over from npmjs.org resolution.
npmjs.org-resolved lockfile entries don't need an explicit `tarball:` field
— pnpm computes the URL by convention
(`.../-/{pkg}-{version}.tgz`). GitHub Packages uses a non-standard tarball
URL scheme (`.../download/{scope}/{pkg}/{version}/{shasum}`) that breaks
that convention-based fallback, so the lockfile needed an explicit
`tarball:` field pnpm hadn't been asked to record yet.

**Fix:** `pnpm store prune` + `pnpm update @ponti-studios/ui --latest`,
which bumped labs to `0.4.4` and captured the correct explicit `tarball:`
URL. Verified with a clean `rm -rf node_modules && pnpm install
--frozen-lockfile && pnpm build`.
