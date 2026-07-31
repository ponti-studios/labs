---
id: 7
title: "@ponti-studios/ui upgrade broke Tailwind content scanning again (twice)"
date: 2026-07-29
status: resolved
severity: high
category: css-build
services: [labs, ponti-studios-ui]
tags: [tailwind, css, dependency-upgrade, regression]
related_incidents: [6]
doc: docs/hominem-auth-integration.md
---

# @ponti-studios/ui upgrade broke Tailwind content scanning again (twice)

Two more outages hit `labs.ponti.io` after this incident log's original
entries were written, both triggered by touching `@ponti-studios/ui`'s
version again after incident 6 had already reverted it to `0.4.3`:

1. **Silent revert regression.** Bumping straight back to `0.4.4` (to pick
   up an unrelated fix) reintroduced incident 6's exact symptom: the
   compiled CSS bundle collapsed from ~104KB with real Tailwind utilities to
   ~17KB with almost none, because `0.4.4`'s `styles.css` switched from
   `@import "tailwindcss"` to `@reference "tailwindcss"` — a real, documented
   breaking change in the package's own contract (its header comment says
   the *consuming app* must now own the Tailwind import), not something
   pinning the version around can dodge. `app/app.css` never did that
   import itself; it relied on the old transitive one.
2. **User upgraded to `0.6.0` directly** (outside this session's prior
   version pinning), which still exhibited the identical break — confirmed
   locally by diffing the `0.4.3`/`0.6.0` tarballs byte-for-byte (identical
   file list, only `styles.css`'s Tailwind import line differed).

**Durable fix:** `app/app.css` now has its own `@import "tailwindcss";`
line, ahead of `@import "@ponti-studios/ui/styles.css";`, matching the order
the package's docs require. This makes the app correct for `0.4.4` *and*
`0.6.0` *and* any future version — the fix is in labs' own CSS entry point,
not a version pin. Verified by a clean-cache local build (`rm -rf
node_modules/.vite .react-router build && pnpm build`) showing ~105KB of CSS
with `.fixed{}`/`.absolute{}`/etc. present, then confirmed live in
production by diffing the served CSS filename/byte size before and after
deploy. `@ponti-studios/ui` is now pinned at `0.6.0`.

**Lesson for next time:** a `@ponti-studios/ui` version bump that changes
*nothing visibly wrong in isolated component testing* can still silently
gut the whole app's Tailwind output, because the failure mode is
"almost all utility classes vanish," not a build error — `pnpm build`
succeeds either way. Any future bump should be spot-checked by grepping the
built CSS for a well-known utility class (e.g. `.fixed{`), not just by the
build exiting 0.
