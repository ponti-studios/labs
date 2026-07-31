---
id: 8
title: "New users couldn't sign in: LABS_URL not configured in Hominem's production environment"
date: 2026-07-29
status: resolved
severity: critical
category: env-config
services: [labs, hominem-api]
tags: [auth, env-config, railway, login, trusted-origins]
related_incidents: [9, 10]
doc: docs/hominem-auth-integration.md
---

# New users couldn't sign in: LABS_URL not configured in Hominem's production environment

## Symptom

Discovered during manual QA of the anonymous → sign-in journey: a real
player hitting "sign in to keep playing" from RealiTea landed on a Hominem
error page instead of the login form:

> OAuth access — ERROR — Authorization stopped
> Open the sign-in link from the app or client you came from.
> Return to your MCP client and try again.

This blocked every new sign-up through RealiTea (and any other
Hominem-integrated app using the same `?next=` app-redirect pattern).

## Root cause

- Labs sends players to `${HOMINEM_API_URL}/login?next=<returnTo>` via
  `buildHominemLoginUrl` (`app/lib/server/hominem-auth.ts`).
- Hominem's `/login` route
  (`~/Developer/hominem/services/api/src/routes/login.tsx`) calls
  `resolveResume(resumeQuery)`, which for app-redirect mode calls
  `resolveAppRedirectUrl(next, getTrustedOrigins())`
  (`~/Developer/hominem/packages/auth/src/shared/redirect-policy.ts`) — this
  rejects the URL unless `next`'s **origin** is in the trusted-origins
  allowlist.
- `getTrustedOrigins()`
  (`~/Developer/hominem/services/api/src/auth/better-auth.ts:19`) includes
  `env.LABS_URL`, defined in the shared env schema
  (`~/Developer/hominem/packages/env/src/api.ts:18`) as `z.url().default(
  'http://localhost:3001')`.
- In production this was resolving to that localhost default — never
  overridden — so `https://labs.ponti.io`'s origin failed the check.
  `resolveAppRedirectUrl` returned `null` → `resolveResume` returned `null` →
  `/login`'s handler rendered the generic error page with **no `mode` prop**,
  which defaults to the OAuth-flavored copy ("Return to your MCP
  client...") — exactly matching the reported error, even though this was
  the plain app-redirect flow, not an MCP OAuth flow at all.
- This confirms the earlier work to "add `LABS_URL` trusted origin + login
  redirect-back mode" was only ever completed in *code* — the actual
  environment variable was never configured on Hominem's production
  deployment.

Reproduced directly: `curl
"https://api.ponti.io/login?next=https%3A%2F%2Flabs.ponti.io%2Fgames%2Frealitea"`
returned the error page.

## Resolution

`LABS_URL` is now set correctly in Hominem's production environment — the
same reproduction now returns the normal "Sign in" page. It isn't fully
confirmed from labs' side alone whether this was a standalone env-var fix or
related to incident 9 (if Hominem's own Railway deploys were *also* stuck
on the GitHub-Packages install problem, it could have been running a
pre-`LABS_URL`-wiring build the whole time) — recorded as an open question,
not asserted as a causal link that isn't independently verified.

**Note:** this incident is easily confused with incident 10, which has an
almost identical user-facing description ("sign-in doesn't work") but a
completely different root cause and failure mode — this one produces a
visible Hominem error page and blocks login outright; incident 10's login
flow completes successfully every time, and the failure only shows up
afterward, silently, when labs checks the session.
