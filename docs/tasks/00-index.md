# RealiTea generation rework — correctness bugs

Five correctness bugs surfaced by a code review of PR [#239](https://github.com/ponti-studios/labs/pull/239)'s
base branch content — specifically the `feat(realitea): cost-tracked, resumable
puzzle generation` change (`57ed331d`) that's now on `main`. All five were
confirmed by re-reading the actual current code, not just diff inspection.

Four are fixed (on branch `fix/realitea-generation-correctness-bugs`, not yet
merged). The fifth (01) turned out to have a wrong root cause once actually
investigated — see its ticket for the correction and what's instrumented
instead of fixed.

| # | Title | Severity | Status | File |
|---|---|---|---|---|
| [01](01-cost-tracking-silently-broken.md) | Cost tracking may record `null` on every run (root cause unconfirmed) | High if real | Open — instrumented | `app/lib/server/ai/index.ts` |
| [02](02-reap-completion-race-overwrites-run-status.md) | Reap job and background completion handler race, can overwrite a succeeded run's status | Medium | Fixed | `app/lib/realitea/admin/generate.server.ts` |
| [03](03-stale-running-flag-allows-duplicate-generation.md) | Resumed-run effect never sets `running`, admin can fire a duplicate generation | Medium | Fixed | `app/routes/games/realitea/admin/generate.tsx` |
| [04](04-unguarded-candidate-loop-aborts-cron-run.md) | Unguarded candidate-matching loop can abort an entire cron invocation | Medium | Fixed | `app/lib/realitea/generation/generate.server.ts` |
| [05](05-per-attempt-failures-missing-from-audit-trail.md) | Per-attempt LLM failures no longer recorded in the admin-action audit trail | Low | Fixed | `app/lib/realitea/generation/generate.server.ts` |

## How these were found

Via `/code-review` at medium effort: 8 independent finder angles (line-by-line
scan, removed-behavior audit, cross-file call-site tracing, reuse,
simplification, efficiency, altitude, and CLAUDE.md conventions) against
`git diff main...HEAD` for the branch that became #239, followed by a
one-vote verification pass per candidate finding. All five tickets below
carry a `CONFIRMED` verdict from that verification pass — a separate agent
re-read the actual files and named the exact trigger and wrong behavior,
not just the diff.

Three additional findings from the same review (a duplicated currency
formatter, and two design notes about the background job's lack of a queue
and the in-memory event bus's single-process scope) were already fixed
directly in the codebase rather than filed as tickets — see commit
`94b5de49` on the now-merged branch.
