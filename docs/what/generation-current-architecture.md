---
title: What Generation Pipeline — Current State
project: what
type: reference
status: active
owner: charlesponti
tags: [architecture, generation, ops]
related: [./architecture.md, ./candidate-generation.md, ./generation-redesign-proposal.md]
summary: Code-grounded walkthrough of What's ingest, article selection, puzzle generation, scheduling, storage, and serving as implemented today.
updated: 2026-09-10
---

# What Generation Pipeline — Current State

This is the map of the generation system as it actually exists. Every claim is
grounded in the files cited inline. Where a behavior is only explainable by
inference, it is labeled **Inference**. A freshness-first redesign is
proposed but **not implemented** — see
[generation-redesign-proposal.md](./generation-redesign-proposal.md); this doc
describes the shipped system, not the proposal.

What is a daily word game: one 5-letter answer per game per day, derived from
an RSS article. Five games share one pipeline, each pointed at a different
feed (`packages/what/src/lib/generation/catalog.ts`):

| slug | feed | label |
|---|---|---|
| `reality` (default) | `https://realityblurred.com/realitytv/feed` | Reality Blurred |
| `technology` | `https://techcrunch.com/feed/` | TechCrunch |
| `page-six` | `https://pagesix.com/feed/` | Page Six |
| `tmz` | `https://www.tmz.com/rss.xml` | TMZ |
| `sports` | `https://www.cbssports.com/rss/headlines/` | CBS Sports |

## End-to-end

```
5 RSS feeds
   │  poll + Readability extraction (ingest)
   ▼
articles (status: pending) ──────────────────────┐
   │  expire (>45d per game)                     │  only the winning
   │  select newest-pending batch of 8            │  article flips to 'used'
   ▼                                              ▼
LLM candidate generation (OpenRouter, 1 call/attempt)
   │  validate + pick first valid & matched candidate
   ▼
games_puzzles row for (game, dateKey)
   │
   ▼
Serving: player's local date → that date's puzzle,
   or fallback to most recent puzzle with dateUtc <= it (isFallback)
```

The pipeline runs as one daily GitHub Actions job
(`.github/workflows/game-generate.yml`): **ingest → generate → health-check**.
Generation never fetches live feeds at request time — it draws from the
`articles` inventory that ingest keeps built up. Puzzles are written up to 7
days ahead of serving; the route just looks up what exists for the player's
"today."

## 1. Ingest

**`packages/what/src/lib/generation/ingest.server.ts`**, entry
`packages/what/scripts/game-ingest.ts` (`pnpm game:ingest`).

- Fetches each active `games_topics` feed via `fetchFeedItems` (fast-xml-parser
  RSS parse, then per-item HTML fetch + Mozilla `Readability` extraction,
  text capped by `MAX_ARTICLE_TEXT_LENGTH` in `feed-text.ts`). Readability
  failures degrade silently to an empty string; title/description remain the
  fallback content.
- Inserts via `upsertArticles` from `packages/what/src/lib/data/articles.server.ts`
  with `.onConflictDoNothing({ target: articles.url })` (the URL column is
  unique) — re-polling a feed that returns already-seen items is a no-op. New
  rows default to `status: 'pending'`.
- `ingestAllActiveFeeds()` polls every active game's feed in parallel;
  `ensureGameCatalog()` upserts the 5-row catalog into `games_topics` on every
  run (`ON CONFLICT DO UPDATE`), so adding a topic to `catalog.ts` is enough
  to provision it.
- Ingest is deliberately decoupled from generation (see the file's header
  comment): its only job is to capture articles before they scroll out of the
  source feed's short window. It knows nothing about how many pending articles
  exist.

## 2. Selection (pending-article queries)

**`packages/what/src/lib/data/articles.server.ts`**

- `getPendingArticlesForGame(game, limit)` filters `status = 'pending'` for the
  game and orders by `desc(articles.publishedAt)` — newest published first.
  The docstring explains why: ingestion adds more pending articles per day
  than generation consumes, so ordering oldest-first would keep re-offering
  an aging cohort until it neared the 45-day expiry, producing puzzles built
  on month-old news.
- `expireStaleArticles(game, date)` flips `pending → expired` for any article
  older than the game's `articleExpiryDays` (default 45). It runs at the top
  of every `generatePuzzleForGame` call, so expiry is enforced lazily,
  per-generation — not by a separate sweep.

## 3. Generation

**`packages/what/src/lib/generation/puzzle-generator.server.ts`**

`generatePuzzleForGame(game, dateKey, options)` is the core function used by
both the cron/gap-fill path (via `generation-runner.ts`) and gap-fill-one.

1. **Idempotency:** `loadPuzzleForDate(game.id, dateKey)` — if a puzzle
   already exists for `(game, date)`, return it unchanged. No implicit
   regeneration.
2. **Expire stale articles**, then gather in parallel:
   - `getRecentAnswers(game, date)` — every normalized answer this game used
     within `repeatWindowDays` (default 90) of `date`, plus
     `getStoredAnswers(game.id)` — every answer this game has *ever*
     published, so the LLM never lands on a duplicate outside the window.
   - `getPendingArticlesForGame(game, GENERATION_BATCH_SIZE)` —
     `GENERATION_BATCH_SIZE = 8` — the newest 8 pending articles.
   - Empty batch → `ARTICLE_BACKLOG_EMPTY` failure, `null`, no live-feed
     fallback.
3. **Config:** one `generate.config` log per date with model, prompt path,
   `maxAttempts`, exclusion and article counts.
4. **Retry loop** (`maxAttempts`, default 3; backoff `2^attempt * 1000` ms
   between attempts):
   - Each attempt inserts a `generation_runs` row (`status: 'running'`,
     `trigger: 'cron'`, environment auto-detected) before calling the LLM, and
     updates it to `succeeded`/`failed` afterward with token/cost usage — the
     audit trail the admin console reads.
   - `requestPuzzleCandidate` → `callGenerationApiForCandidates`
     (`candidate-generator.server.ts`) sends one OpenRouter chat completion
     (`chatCompletion` from `@pontistudios/ai`) with a strict JSON-schema
     response requiring **1–5 candidates** (`generationResponseSchema`:
     `min(1).max(5)`). The prompt is `buildMessages`: the system prompt from
     `game.systemPromptPath` (all games share `src/prompts/game-generation.md`)
     plus a user message containing `dateKey`, `excludedAnswers`, and the 8
     articles as untrusted data with explicit prompt-injection resistance.
   - Each candidate is scored by `validateCandidate`
     (`candidate-validation.ts`): exactly 5 letters, dictionary word
     (`isDictionaryWord`), no `answerType: "person"`, answer not leaked into
     the clue/detail, no prompt-control marker phrases, not a repeat answer,
     and at least one cited source URL inside the offered article domains.
     Candidates are walked in the order the LLM returned them; the **first**
     one that both matches an offered pending article (via `matchArticle`,
     source URL ∈ batch) and passes validation wins.
   - Rejected candidates whose source matched a real article call
     `recordArticleRejection`, capped at `MAX_ARTICLE_REJECTIONS = 3` before
     an article is permanently `'rejected'`; below the cap it stays
     `'pending'` and can be re-offered. **Rejected answers accumulate into
     the exclusion set between attempts**, so the LLM is never re-asked for
     the same invalid word.
   - If no candidate wins, one `generate.attempt.failed` warn is logged with
     the attempt index and rejection reasons, and the loop retries.
5. **Publish:** once a pair wins, insert one `games_puzzles` row (unique on
   `(gamesTopicId, dateUtc)`) and call `markArticleUsed(article.id)` — the
   only place an article becomes `'used'`, and only ever for the single
   winning article; the other 7 stay `'pending'`.
6. **Exhaustion:** after all attempts with no winner, log
   `generate.puzzle.failed`, record the failure via `recordAdminAction`
   (`GENERATION_EXHAUSTED`), return `null` — the date stays empty until the
   next run treats it as "missing" again.

**Cross-topic isolation:** every query is scoped to `articles.gamesTopicId =
game.id`; `reality` never draws from `technology`'s backlog. Reuse is *within*
one topic's backlog across days, never across topics.

## 4. Scheduling / orchestration

**`packages/what/scripts/game-generate.ts`** (`pnpm game:generate`),
**`packages/what/src/lib/generation/generate-range.ts`**,
**`generation-runner.ts`**, workflow **`.github/workflows/game-generate.yml`**.

- Workflow triggers: `cron: "0 17 * * *"` UTC daily, plus on-demand
  `workflow_dispatch` with `mode` (`force` default / `gap_fill`), `days-ahead`
  (default `7`), optional `from`/`to`, all `if: github.ref == 'refs/heads/main'`.
  `concurrency: { group: game-generate, cancel-in-progress: false }` and
  `timeout-minutes: 30` bound one run; the circuit breaker is what actually
  stops a bad run early.
- Steps in order: ingest-feeds (`pnpm game:ingest`) → generate
  (`pnpm game:generate`, with flags derived from the dispatch inputs) →
  health-check (`pnpm game:health-check`), all against the same `DATABASE_URL`
  secret in the `realitea-production` environment.
- `game-generate.ts`: parses `--force --days-ahead --from --to`, validates env
  via `LabyrinthServerEnv.parse` (see below), then `resolveGenerateRange`:
  - Explicit `--from/--to`: `YYYY-MM-DD`, span ≤ `MAX_GENERATE_SPAN_DAYS` (14),
    and `from` must be strictly after the live dates — today in UTC *and*
    `America/Los_Angeles`. On rejection the error names the live dates and the
    earliest usable `--from`.
  - Relative: `[tomorrow, tomorrow + GAME_READY_INVENTORY_DAYS)` where
    `GAME_READY_INVENTORY_DAYS = 7` (from `candidate-validation.ts`).
  - **Dev escape hatch:** when `DATABASE_URL` points at a loopback host
    (`isDisposableDatabase`, e.g. `localhost:5434/hominem`), `allowLiveDates`
    is enabled — the live-date guard is skipped so today can be deleted and
    regenerated for rehearsal. The run logs a prominent
    `generate.run.liveGuardDisabled` warning. Production (`railway` host) is
    never affected, even when the script runs from a laptop.
- `main` runs housekeeping first: `backfillPuzzlePublishedAt`,
  `reapStaleGenerations` (`REAP_AFTER_MS`, 10 min) and `expireGenerations`
  (`RUN_TTL_DAYS`, 30). Then it takes a Postgres advisory lock
  (`withGenerateLock` in `lib/infrastructure/advisory-lock.server.ts`) so a
  manual dispatch racing the cron serializes instead of double-writing.
- Per game, `runGenerateRange` (`generation-runner.ts`):
  - **gap_fill** (`planGapFill`): diffs the window against existing `dateKey`s
    and generates only the missing dates — existing future puzzles are never
    touched.
  - **force** (`planScopedRegenerate`): refuses a `LIVE_DATE` in range
    (unless `allowLiveDates`) and refuses any date with recorded attempts
    (`HAS_ATTEMPTS`), then `deletePuzzlesInRange` and regenerates every date
    in the window. This is the only path that ever touches an
    already-generated future puzzle.
  - `circuit` (`recordCircuitAttempt`, threshold 6 consecutive failures) — when
    it trips, `recordCircuitOpen` fires an admin action and the script stops
    the rest of the run instead of exhausting the attempt budget.
  - Per-game `generate.game.completed` line reports counts plus
    `inventoryDepth` (map over the forward window) and `durationMs`.
- After all games, `generate.run.completed` summarizes totals, mode, duration,
  and `circuitOpened`; failures (circuit open, any failed dates) rethrow and
  exit 1.

## 5. Health check

**`packages/what/scripts/game-health-check.ts`** (`pnpm game:health-check`).

`computeHealthStatus` flags `DEGRADED` if there is no puzzle for today, or if
`countInventoryForRange` over the next `GAME_READY_INVENTORY_DAYS` (7) is
below target — `< 1` is "no puzzles scheduled," `< 7` is "low inventory."
The step exits 1 on any issue, failing the workflow run visibly in GitHub
(no separate alerting).

## 6. Date/timezone handling

**`packages/what/src/lib/puzzle/date.ts`, `timezone.ts`**

- `getDateKey(date, timeZone = "UTC")` formats via
  `Intl.DateTimeFormat("en-CA", { timeZone })` → `YYYY-MM-DD`.
- Player timezone travels in the `what_timezone` cookie; missing, malformed,
  or invalid values fall back to `UTC`. `tz` query parameters are ignored.
- `PRIMARY_PLAYER_TZ = "America/Los_Angeles"` (`generate-range.ts`).
  `liveDateKeys(now)` returns the set of "today" in both UTC and LA — the two
  can disagree by a day for part of every 24-hour cycle, and both are
  protected from force regeneration (see §4) because both are actively served
  to *some* player.

## 7. Storage

**`packages/db/src/schema/game.ts`** (Postgres schema `labs`)

- `games_topics`: one row per game/feed. Tunables: `answerLength` (5),
  `repeatWindowDays` (90), `articleExpiryDays` (45), `systemPromptPath`,
  `active`.
- `articles`: `status` enum `pending | used | rejected | expired`, unique on
  `url`, scoped per game via `gamesTopicId`.
- `generation_runs`: one row per LLM attempt (not per published puzzle) — the
  audit/cost table. `generationCandidates` holds scored candidates from
  admin previews. `gamesPuzzles.generationRunId` is `onDelete: "set null"` so
  the 30-day run-retention sweep can never cascade-delete a live puzzle.
- `games_puzzles`: one row per `(gamesTopicId, dateUtc)` (unique),
  `articleId` `notNull` + `onDelete: "restrict"` — a puzzle can never outlive
  its source article. No draft/promotion column; a row existing *is*
  "published."
- `games_attempts`: player attempt lifecycle per puzzle. `game_puzzle_revisions`:
  pre-image snapshots when an admin replaces a date that already has attempts.
- `admin_actions`: the audit trail for every operator write.

## 8. Serving / fallback

**`packages/what/src/lib/data/puzzle.server.ts`**, routes `src/routes/`.

- `resolveActivePuzzle` is the chokepoint the game loader and guess/attempt
  loaders share — they must agree on which puzzle "today" is. It computes the
  player's local `dateKey` from the `what_timezone` cookie and serves
  `loadPuzzleForDate`; if nothing exists for that date it falls back to the
  most recent puzzle with `dateUtc <= dateKey` (logs
  `FALLBACK_ACTIVATED_ANY_PUZZLE`, flags `isFallback = served.dateUtc !=
  dateKey`). The fallback is bounded by `dateUtc <= dateKey` (never serves
  future inventory across a timezone boundary) but has no lower age bound —
  **Inference:** a deliberate availability-over-freshness trade, which is
  exactly what the freshness redesign proposal targets.
- Uses the [logging taxonomy](#logging) below; the request-time fallback is
  visible via `isFallback` on the served payload and the log event.
- The guess path applies a one-day grace period: on a miss it tries
  `dateKey - 1` before giving up, separate from the unbounded serving
  fallback.

## 9. Admin console

**`packages/what/src/routes/admin.*`, `packages/what/src/lib/admin/*`**

- Operator surface behind Hominem auth + `GAME_ADMIN_EMAILS` allowlist
  (enforced in production/Railway). Run-level views (`topics`,
  `topics.$slug`, `dates.$date`, `inventory`, `generations.$id`, `costs`),
  a manual generate flow (`admin.generate*`) streaming progress over SSE
  (`generation-events.server.ts`), and publishing through
  `lib/admin/publish.ts`.
- Source modes for a manual run: `inventory` (default, 8 newest pending),
  `feeds` (multi-feed), `articles` (operator-picked IDs),
  `rss` (live feed, preview-only, not publishable), `fixtures` (canned data,
  preview-only).

## 10. Parameters at a glance

| Parameter | Value | Source |
| --- | --- | --- |
| Cron schedule | `0 17 * * *` UTC daily | `.github/workflows/game-generate.yml` |
| Generation batch size (articles offered) | 8 | `GENERATION_BATCH_SIZE`, `puzzle-generator.server.ts` |
| Article expiry | 45 days (per-game `articleExpiryDays`) | `packages/db/src/schema/game.ts` |
| Answer repeat window | 90 days (per-game `repeatWindowDays`) | `packages/db/src/schema/game.ts` |
| Forward generation/gap-fill window | 7 days ahead | `GAME_READY_INVENTORY_DAYS`, `candidate-validation.ts` |
| Max attempts per date | 3 | `generatePuzzleForGame` default `maxAttempts` |
| Max article rejections before `'rejected'` | 3 | `MAX_ARTICLE_REJECTIONS` |
| Retry backoff | `2^attempt * 1000` ms | `puzzle-generator.server.ts` |
| LLM candidates per completion | 1–5 | `generationResponseSchema`, `candidate-generator.server.ts` |
| Circuit breaker threshold | 6 consecutive failures | `CIRCUIT_BREAKER_THRESHOLD`, `circuit-breaker.ts` |
| Max span, any generate window | 14 days | `MAX_GENERATE_SPAN_DAYS`, `generate-range.ts` |
| Default max tokens | 4000 (override `GAME_MAX_TOKENS`) | `candidate-generator.server.ts` |
| Reasoning effort | optional, `GAME_REASONING_EFFORT` | `candidate-generator.server.ts` |
| Generation-run retention | 30 days | `RUN_TTL_DAYS`, `lib/admin/generate.server.ts` |
| Stuck-run reap timeout | 10 minutes | `REAP_AFTER_MS`, `lib/admin/generate.server.ts` |
| Primary player timezone | `America/Los_Angeles` | `PRIMARY_PLAYER_TZ`, `generate-range.ts` |
| Player timezone cookie | `what_timezone` | `lib/puzzle/timezone.ts` |

## Logging

Every structured log line carries a scoped dot-separated `event`
(`generate.run.started`, `generate.game.planned`, `generate.puzzle.created`,
`generate.attempt.failed`, `generate.api.error`, `generate.circuit.opened`,
`generate.run.failed`, plus `ingest.*` / `health.*`). Conventions live in
`packages/what/src/lib/logger.server.ts`:

- stdout is a TTY (or `LOG_PRETTY=1`) → pino-pretty single-line colorized
  output: `[HH:MM:ss.l] LEVEL: event — message {context}`.
- piped (CI/Railway) → lean NDJSON: ISO-8601 `time`, no `pid`/`hostname`,
  camelCase fields, `durationMs` on completions.
- `LOG_LEVEL` overrides the level (`debug` shows attempt/candidate detail);
  tests are silent.

## Known design tradeoffs

- **Gap-fill means "generated once, up to 7 days before serving."** A date is
  normally generated the first time it enters the window and never revisited;
  the article behind it can be days old by the time players see it. This is
  the core freshness issue the [redesign proposal](./generation-redesign-proposal.md)
  targets.
- **Serving fallback has no lower age bound** — a multi-day outage serves the
  most recent prior puzzle, labeled `isFallback` but unbounded in staleness.
- **Live-date protection is a hard gate in production** by design, and a soft
  gate in development (loopback DB only). Never bypass it for a production
  `DATABASE_URL`.