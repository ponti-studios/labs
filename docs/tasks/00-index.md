# RealiTea generation rework — correctness bugs and follow-ups

Six items tracking issues found in and around the `feat(realitea):
cost-tracked, resumable puzzle generation` change (`57ed331d`) that's now on
`main`. The first five came from a code review of PR
[#239](https://github.com/ponti-studios/labs/pull/239)'s base branch
content; the sixth came from investigating a live production failure while
closing out ticket 01.

Four of the original five bugs are fixed and merged (PR
[#240](https://github.com/ponti-studios/labs/pull/240),
`fix/realitea-generation-correctness-bugs`). Ticket 01 turned out to be a
false alarm on closer investigation — resolved, no code change needed beyond
a diagnostic log left in place. Ticket 06 is newly filed, not started.

| # | Title | Severity | Status | File |
|---|---|---|---|---|
| [01](01-cost-tracking-silently-broken.md) | Cost tracking — confirmed working, not a bug | N/A | Resolved (false alarm) | `app/lib/realitea/generation/generate.server.ts` |
| [02](02-reap-completion-race-overwrites-run-status.md) | Reap job and background completion handler race, can overwrite a succeeded run's status | Medium | Fixed | `app/lib/realitea/admin/generate.server.ts` |
| [03](03-stale-running-flag-allows-duplicate-generation.md) | Resumed-run effect never sets `running`, admin can fire a duplicate generation | Medium | Fixed | `app/routes/games/realitea/admin/generate.tsx` |
| [04](04-unguarded-candidate-loop-aborts-cron-run.md) | Unguarded candidate-matching loop can abort an entire cron invocation | Medium | Fixed | `app/lib/realitea/generation/generate.server.ts` |
| [05](05-per-attempt-failures-missing-from-audit-trail.md) | Per-attempt LLM failures no longer recorded in the admin-action audit trail | Low | Fixed | `app/lib/realitea/generation/generate.server.ts` |
| [06](06-no-circuit-breaker-on-provider-degradation.md) | Cron generation has no circuit breaker, burns the full 30-minute budget on a bad provider day | Medium | Open | `app/lib/realitea/ops.ts` |

## How 01–05 were found

Via `/code-review` at medium effort: 8 independent finder angles (line-by-line
scan, removed-behavior audit, cross-file call-site tracing, reuse,
simplification, efficiency, altitude, and CLAUDE.md conventions) against
`git diff main...HEAD` for the branch that became #239, followed by a
one-vote verification pass per candidate finding. All five originally carried
a `CONFIRMED` verdict from that pass — but 01 didn't survive a deeper look
during implementation (see its ticket for the full correction).

Three additional findings from the same review (a duplicated currency
formatter, and two design notes about the background job's lack of a queue
and the in-memory event bus's single-process scope) were fixed directly in
the codebase rather than filed as tickets — see commit `94b5de49` on the
now-merged `copilot/fix-github-actions-job` branch.

## How 06 was found

While closing out ticket 01, a real production cron run
([31960833898](https://github.com/ponti-studios/labs/actions/runs/31960833898),
2026-08-16) was found to have failed 30 consecutive generation attempts
across every game and date in its window before being killed by the
30-minute job timeout. Live reproduction (same model, same config, real
production-shaped article content) succeeded cleanly, pointing to a
transient provider-side degradation of `deepseek/deepseek-v4-flash` rather
than a code bug — but exposed that the generation loop has no way to notice
"everything is failing the same way" and stop early.
