# 14 — Silent stale-puzzle fallback

**Status: Resolved.** The public puzzle model carries `isFallback`, and the active board
discloses bounded previous-puzzle fallback without changing exact-date history routes.

**Category:** Data flow / architecture
**Severity:** Low-Medium

## Summary

When no puzzle exists for the current day, the server transparently serves the most recent puzzle from any prior date instead of a 404 — but this fallback is invisible to the client. Nothing in the UI indicates the player is looking at yesterday's (or older) puzzle rather than today's.

## Evidence

- `app/lib/realitea/puzzle.server.ts:48-92` (`loadActivePublicPuzzle`) — resolves today's puzzle by timezone-aware `dateKey`; if none exists, falls back to "most recent puzzle of any date" at `:63-76`.
- The fallback is logged server-side only: `childLogger.warn(...)` at `:66-75`.
- `PublicDailyPuzzle` (the client-facing type, `types.ts:24-34`) has no flag indicating "this is a fallback/stale puzzle" — the client only sees whatever `dateKey` the served puzzle actually has, with no signal that it differs from "today."

## Why it matters

If puzzle generation ever fails for a day (generation pipeline error, feed outage, etc.), players silently get an old puzzle re-served with no indication — potentially confusing for a returning player who already solved that exact puzzle previously, and it masks a generation-pipeline failure from being visible anywhere except server logs.

## Suggested fix

Add an explicit `isFallback: boolean` (or similar) field to `PublicDailyPuzzle`, set when `loadActivePublicPuzzle` takes the fallback path, and surface a small UI notice ("Today's puzzle isn't ready yet — here's a previous one") when true.

## Open questions for discussion
- How often does this fallback actually trigger in practice? Worth checking `childLogger` history/monitoring before deciding how much UI investment this deserves.
- Should this instead trigger an alert to whoever operates the generation pipeline, rather than (or in addition to) a client-facing notice?
