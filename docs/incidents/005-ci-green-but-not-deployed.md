---
id: 5
title: "\"It cannot move on until all services are deploying properly\""
date: 2026-07-29
status: resolved
severity: medium
category: process
services: [labs, railway, github-actions]
tags: [process, verification, railway, github-actions, trust]
related_incidents: [4, 6]
doc: docs/hominem-auth-integration.md
---

# "It cannot move on until all services are deploying properly"

After the fix in incident 4, GitHub Actions reported `migrate: success` and
`deploy: success`, and an HTTP 200 check against `labs.ponti.io` passed.
This was reported to the user as "all services are deploying and running
properly now."

**The user then pasted the actual Railway build logs, proving that claim
false.** This is the pivotal moment of the session: it established that
GitHub Actions "success" + an HTTP 200 check are *not* sufficient evidence
of a real deploy — a failed new build simply leaves Railway serving the
previous, still-working deployment, which is exactly what an HTTP 200
check can't distinguish from a successful new one. The user's explicit
standard from this point forward: **"we cannot move on until all services
are deploying properly,"** verified genuinely, not by proxy.

This incident has no code fix of its own — it's a process/verification
standard that directly shaped how incident 6 and every later incident in
this log were confirmed (always via Railway's own CLI/logs, never GitHub
Actions status alone).
