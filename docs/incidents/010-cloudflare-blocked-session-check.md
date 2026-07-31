---
id: 10
title: "Signed-in players silently treated as anonymous: Cloudflare's bot-challenge blocked the server-to-server session check"
date: 2026-07-31
status: resolved
severity: critical
category: networking
services: [labs, hominem-api, cloudflare, railway]
tags: [auth, cloudflare, bot-challenge, railway-private-network, session]
related_incidents: [8]
doc: docs/hominem-auth-integration.md
---

# Signed-in players silently treated as anonymous: Cloudflare's bot-challenge blocked the server-to-server session check

## Symptom

Reported by a real user: clicking "Sign in to keep playing" on RealiTea,
completing sign-in on Hominem's hosted `/login` page (email + OTP), and
landing back on `labs.ponti.io` — but the very next guess submission showed
the "Free guess used — sign in to keep playing" card again, as if no
session existed at all. Unlike incident 8, this was not an error page —
the redirect and login itself completed successfully every time.

## Investigation

Confirmed step by step, live against production, with the user actually
signed in:

- `GET https://api.ponti.io/api/auth/get-session`, hit directly by the
  user's own browser, returned a fully valid session and user record. The
  session itself was never the problem.
- Every server-side consumer of `getHominemUser()` in labs — `root.tsx`'s
  nav-authentication loader, `history.tsx`'s loader, and the
  `api.games.realitea.guess.ts` action — treated the same request as
  signed out. All three call the identical function, so this wasn't
  route-specific.
- `AUTH_COOKIE_DOMAIN` (`.ponti.io`), `LABS_URL` (`https://labs.ponti.io`),
  and `HOMINEM_API_URL` (`https://api.ponti.io`) were all independently
  confirmed correct in Railway's production variables for both the `api`
  and `labyrinth` services — ruling out a repeat of incident 8.
- The `@ponti-studios/auth@0.1.1` response-shape contract was also checked
  and ruled out: the client's `payload?.session ? payload.user : null`
  parse is byte-identical between the installed `0.1.1` and the current
  Hominem source (the only change between them was a compile-time-only
  type rename, `User` → `AuthUser`).
- Hominem's own `api` service logs (`requestLogger` middleware, which logs
  every request unconditionally) showed only a handful of
  `/api/auth/get-session` hits — far fewer than the number of times
  `getHominemUser()` should have been called from labs during the same
  window — meaning most of those calls never completed as a normal HTTP
  round trip from Hominem's point of view.
- Temporary diagnostic logging added to `getHominemUser()` (bypassing
  `getServerAuth`'s internal swallowing to log the raw response) confirmed
  it directly: the browser's `Cookie` header, including
  `__Secure-better-auth.session_token`, **was** being forwarded correctly
  all the way to labs' backend. But the outbound fetch from labs'
  Railway container to `https://api.ponti.io/api/auth/get-session` was
  coming back as:

  ```
  rawStatus=403
  rawServer="cloudflare"
  rawCfMitigated="challenge"
  rawBodySnippet: <!DOCTYPE html>...<title>Just a moment...</title>...
  ```

## Root cause

Cloudflare's bot-management challenge in front of `api.ponti.io` was
intercepting the **server-to-server** request labs' backend makes to verify
a session (`getServerAuth` in `@ponti-studios/auth`), and returning its
"Just a moment..." interstitial instead of proxying to Hominem's origin.
Because that interstitial is a normal (if unexpected) HTTP response — not a
transport-level failure — `getServerAuth`'s `response.json().catch(() =>
null)` silently parsed the HTML as an unparseable payload and returned
`user: null`, which `getHominemUser`'s own fail-closed catch then read as
"not signed in," exactly as designed for a real Hominem outage. The
difference from a real outage: the session was completely valid, and a
real browser hitting the same endpoint directly always succeeded, since
only the browser's request carries what Cloudflare's challenge accepts as
proof of a real visitor. Server-to-server traffic has no such proof, so it
got challenged.

This also explains why a handful of `get-session` calls apparently
succeeded in earlier ad hoc testing (see incident 8's baseline note) —
Cloudflare's bot heuristics are probabilistic/fingerprint-based, not a hard
allow/deny, so some server-side calls slipped through while most didn't.

## Fix

Split the one `getHominemApiUrl()` used for two different purposes into
two functions in `app/lib/server/hominem-auth.ts`:

- `getHominemApiUrl()` — unchanged, still the **public**
  `https://api.ponti.io` (from `HOMINEM_API_URL`). Still used by
  `buildHominemLoginUrl()`, which must stay public: it builds an `<a href>`
  the user's own browser navigates to, and Railway's private network is not
  reachable from outside Railway at all.
- `getHominemInternalApiUrl()` — new. Reads `HOMINEM_INTERNAL_API_URL`,
  falling back to `getHominemApiUrl()` when unset (so local dev and tests
  are unaffected). Used only by `getHominemUser()`'s `getServerAuth` call —
  a pure server-to-server request that has no reason to round-trip through
  Cloudflare at all.

`HOMINEM_INTERNAL_API_URL` is set in Railway (production) to Hominem's
private Railway network address, discovered via `railway variables
--service api` (`RAILWAY_PRIVATE_DOMAIN=hominem-api-production.railway.internal`)
and its actual listening port, confirmed from the `api` service's own
startup log (`server_started {"host":"0.0.0.0","port":8080}`, not the
`4040` code default):

```
HOMINEM_INTERNAL_API_URL=http://hominem-api-production.railway.internal:8080
```

Both `api` and `labyrinth` are services within the same Railway project
(`hominem`), so this reaches Hominem directly over Railway's internal
network — bypassing Cloudflare, and the bot-challenge, entirely for this
call.

Verified live in production after deploy (`railway up --service labyrinth`):
the nav bar rendered the authenticated variant, `/games/realitea/history`
showed real history instead of a sign-in prompt, and a genuine second guess
was accepted without hitting the `auth-required` wall. The public login
link was independently re-verified to still point at
`https://api.ponti.io/login?next=...` (not the internal hostname) —
an intermediate deploy briefly pointed *both* URLs at the internal address,
which would have made "Sign in to keep playing" itself unreachable from any
real browser; caught and fixed before it reached this incident's final
state.

**Lesson for next time:** a "fails closed to anonymous, not to a 500"
design (deliberately chosen so RealiTea degrades gracefully during a real
Hominem outage) has a blind spot: it can't distinguish "Hominem is actually
down" from "something in between is silently rewriting the response,"
and by design it never surfaces that difference in logs unless you
temporarily bypass the swallowing to look at the raw response. Any
infra sitting between two of your own services (a CDN, a WAF, bot
management) that's tuned for real end users can misfire on legitimate
service-to-service traffic — prefer routing internal, service-to-service
calls over a private network path when one is available, rather than
routing them back out through the same public edge a browser would use.
