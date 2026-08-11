# 07 — ErrorBoundary can't read the loader's Response error

**Category:** React correctness bug
**Severity:** Medium (user-facing: wrong/generic error message shown)

## Summary

The route's `ErrorBoundary` is typed to expect a plain `Error` and reads `error.message`, but the loader actually throws a `Response` (via `Response.json(...)`), which React Router surfaces to error boundaries as a route `ErrorResponse` object (`.status`/`.statusText`/`.data`), not an `Error` with `.message`. As a result, the specific "no puzzle today" message is never shown — the boundary always falls back to its generic string.

## Evidence

- `app/routes/games/realitea/route.tsx:183` — `type ErrorBoundaryProps = { error: Error }` (hand-rolled, not the generated route type).
- `app/routes/games/realitea/route.tsx:192` — reads `error.message`.
- `app/routes/games/realitea/route.tsx:51-58` — the loader throws a `Response.json(...)` with a specific message ("No RealiTea puzzle found for today") for the 404 case.
- Contrast with the established correct pattern already used elsewhere in the app: `app/root.tsx:105-124`, which types the prop as `Route.ErrorBoundaryProps` and calls `isRouteErrorResponse(error)` to extract `error.data` before rendering.

## Why it matters

Today, when there's genuinely no puzzle for the day (a real, expected condition per the loader's own code), the user sees a generic fallback error instead of the specific, more helpful message the loader author clearly intended to surface.

## Suggested fix

Replace the hand-rolled `ErrorBoundaryProps` type with the generated `Route.ErrorBoundaryProps`, and use `isRouteErrorResponse(error)` to extract `.data`/`.status`, mirroring `app/root.tsx:105-124`.

## Open questions for discussion
- Is this worth a quick standalone fix now, or should it be bundled with the broader `use-game.ts` error-handling pass (network-failure detection, [13](13-fetcher-effect-double-guard.md))?
