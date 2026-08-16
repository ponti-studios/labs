# 03 — Resumed-run effect never sets `running`, admin can fire a duplicate generation

**Status:** Fixed
**Category:** Correctness / React state
**Severity:** Medium

## Summary

The admin generate page seeds its `running` state once, from
`data.activeRunId`, in the initial `useState` call. A separate effect exists
to resume watching an in-progress run whenever `data.activeRunId` changes
(e.g. after a loader revalidation), but that effect only calls `setStage(...)`
and `watch(...)` — it never calls `setRunning(true)`. On an already-mounted
page, a revalidation that surfaces a newly-active run id will start
streaming its progress while the Generate button stays enabled and labeled
"Generate" instead of "Generating," because `running` is still `false`.

## Evidence

- `app/routes/games/realitea/admin/generate.tsx:62` —
  `const [running, setRunning] = useState(data.activeRunId !== null);` —
  `running` is only ever seeded from `activeRunId` at mount time.
- `app/routes/games/realitea/admin/generate.tsx:83-95` — the resume effect:
  ```ts
  useEffect(() => {
    if (data.activeRunId !== null) {
      setStage(...);
      // ...
      watch(data.activeRunId);
    }
  }, [data.activeRunId]);
  ```
  No `setRunning(true)` call anywhere in this effect.
- `watch()` itself (around line 67-78) only ever calls `setRunning(false)`
  on completion (line 75) — it never sets it `true` on start, because the
  original caller of `watch()` (the submit handler, line 100) already calls
  `setRunning(true)` explicitly before invoking it. The resume-effect path
  bypasses that call site entirely.

## Why it matters

Failure scenario: an admin has `/generate` open with no active run
(`running = false`). In another tab, or from another admin session, a
generation is started for the same game. Back in the first tab, any loader
revalidation that changes `data.activeRunId` without remounting the
component (window focus refetch, `nav back`, React Router revalidation after
an unrelated action) re-fires the effect and starts watching the new run —
but `running` stays `false`, so the Generate button remains clickable and
still reads "Generate." The admin can click it, firing a second concurrent
generation for the same game/date while one is already streaming, wasting
LLM cost and potentially racing two writes to the same `generationRuns`
row's downstream state.

## Suggested fix

Add `setRunning(true)` inside the resume effect at
`generate.tsx:83-95`, alongside the existing `setStage(...)`/`watch(...)`
calls, so the button is disabled for the full duration the effect is
actively watching a run — mirroring what the explicit submit-handler call
site already does.

## Verification

CONFIRMED by an independent verifier reading the effect, its dependency
array, and `watch()`'s own state transitions directly in
`generate.tsx`.
