# Hominem Auth Integration for RealiTea — Progress Log

This document records, in detail, everything done so far to integrate Hominem
(Better Auth) authentication into RealiTea's guess flow, plus the CI/deploy
incidents that had to be resolved along the way. It is a narrative + reference
doc, not a spec — read [00-index.md](realitea-audit/00-index.md) for the
original audit findings that motivated this work (particularly
[01-no-server-side-attempt-tracking.md](realitea-audit/01-no-server-side-attempt-tracking.md)
and [02-no-rate-limiting.md](realitea-audit/02-no-rate-limiting.md)).

## Goal

RealiTea's guess API currently trusts the client to report its own guess
history (`previousGuesses` in the request body). A scripted client can lie
about that array to bypass the six-guess cap and the duplicate-guess check
entirely. The fix requires knowing *who* is guessing, which means wiring in
real authentication — and Hominem (`api.ponti.io`, Better Auth) is the only
service allowed to authenticate users. Labs never creates accounts or hosts a
login form; it only reads the session cookie Hominem sets.

### Requirements (established before this doc's work began)

- Anonymous (signed-out) visitors get exactly **one** free guess per puzzle,
  unpersisted. A second guess attempt is rejected with `auth-required`.
- Signed-in users get **6 guesses/day/puzzle**, matching `MAX_GUESSES`.
- Users can play puzzles from older, previously-unplayed dates — attempts are
  keyed by `(user, game, date)`, not just "today."
- No limit on number of *distinct puzzles* played per session — the cap is
  per-puzzle, not global.
- Rate limit: max **10 guesses/minute** per signed-in user, across all
  puzzles (prevents a scripted client from brute-forcing many puzzles in
  parallel even though each one is capped at 6/day).
- Only Hominem issues sessions; labs shares the cookie. Production: API at
  `api.ponti.io`, game at `labs.ponti.io`, cookie domain `.ponti.io`.
- Sign-in is a redirect to Hominem's own hosted `/login` page, with a
  `next` param bringing the user back to labs afterward.
- The shared auth package was renamed from `@hominem/auth` to
  `@ponti-studios/auth` to match the rest of the `@ponti-studios/*` scope
  labs already depends on (`@ponti-studios/ui`, etc.).

## Task breakdown and status

| # | Task | Status |
|---|---|---|
| 1 | Rename `@hominem/auth` → `@ponti-studios/auth` | ✅ done |
| 2 | Publish `@ponti-studios/auth` to GitHub Packages | ✅ done |
| 3 | Add `LABS_URL` trusted origin + login redirect-back mode (Hominem side) | ✅ done |
| 4 | Add labs dependency on `@ponti-studios/auth` + session helper | ✅ done |
| 5 | Add `realitea_attempts` DB table + migration | ✅ done, applied to prod |
| 6 | Rewrite guess evaluation with server-side attempt tracking + rate limit | ✅ done |
| 7 | Client UX for login-required state | ✅ done |

---

## Task 4 — Session helper (`app/lib/server/hominem-auth.ts`)

```ts
import { getServerAuth } from "@ponti-studios/auth/server";

const DEFAULT_HOMINEM_API_URL = "http://localhost:4040";

export function getHominemApiUrl(): string {
  return process.env.HOMINEM_API_URL ?? DEFAULT_HOMINEM_API_URL;
}

export type HominemUser = { id: string; email?: string | null };

export async function getHominemUser(request: Request): Promise<HominemUser | null> {
  try {
    const { user } = await getServerAuth(request, { apiBaseUrl: getHominemApiUrl() });
    if (!user?.id) return null;
    return { id: user.id, email: user.email ?? null };
  } catch {
    return null;
  }
}

export function buildHominemLoginUrl(returnTo: string): string {
  const url = new URL("/login", getHominemApiUrl());
  url.searchParams.set("next", returnTo);
  return url.toString();
}
```

Key design decisions, with the *why* preserved from code comments:

- **Fails closed to "not signed in," not to an error.** Any transport
  failure, non-2xx, or unparseable payload from the Hominem API returns
  `null` instead of throwing. An outage in Hominem degrades RealiTea to
  anonymous play (one free guess) rather than a 500 on every request.
- **Forwards the request's own `Cookie` header** — `getServerAuth` reads it
  directly from the inbound `Request`. This is server-only; must never be
  called from client code (it would leak the raw cookie-forwarding call into
  a bundle, though `@ponti-studios/auth/server` itself is a server-only
  export path so this would fail to resolve client-side, not silently ship).
- **Local dev cookie limitation, documented but unsolved by this file:**
  Hominem and labs run on different `localhost` ports locally, which cannot
  share a cookie domain the way `.ponti.io` does in prod. The comment in the
  file flags this as a known local-auth wrinkle — see README/AGENTS notes
  (this doc does not resolve that; it's flagged for whoever tests task 6/7
  locally).
- `buildHominemLoginUrl` builds `{HOMINEM_API_URL}/login?next={returnTo}`.
  `returnTo` must be an absolute labs URL whose *origin* Hominem's
  `LABS_URL` trusted-origin list accepts (task 3), or Hominem's redirect
  policy (`resolveAppRedirectUrl` in `@ponti-studios/auth/shared/redirect-policy`)
  rejects it.

Committed as `6428f9a9` ("Add Hominem session verification via
@ponti-studios/auth").

---

## Task 5 — `realitea_attempts` table

### Schema (`app/lib/server/db/schema/realitea.ts`)

```ts
export const attemptStatusValues = ["playing", "solved", "failed"] as const;
export type AttemptStatus = (typeof attemptStatusValues)[number];

type StoredGuess = { word: string; states: ("absent" | "correct" | "present")[] };

export const realiteaAttempts = labs.table(
  "realitea_attempts",
  {
    id: serial("id").primaryKey(),
    hominemUserId: text("hominem_user_id").notNull(),
    gameId: integer("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
    dateUtc: date("date_utc").notNull(),
    guesses: jsonb("guesses").$type<StoredGuess[]>().notNull().default([]),
    guessedAt: jsonb("guessed_at").$type<string[]>().notNull().default([]),
    status: text("status", { enum: attemptStatusValues }).notNull().default("playing"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("realitea_attempts_user_game_date_idx").on(
      table.hominemUserId, table.gameId, table.dateUtc,
    ),
    index("realitea_attempts_user_updated_idx").on(table.hominemUserId, table.updatedAt),
  ],
);
```

Design decisions:

- **No FK from `hominem_user_id` to a `users` table.** Better Auth's `user`
  table lives in Hominem's `public` schema, in the *same physical Postgres
  instance* as labs (`hominem` DB) but a different logical owner. Skipping
  the FK is deliberate: it keeps labs' migration and lifecycle fully
  independent from Hominem's — labs can migrate without ever needing to know
  Hominem's schema shape, and vice versa. Referential integrity for this
  column is enforced at the application layer (`getHominemUser` returning a
  real Better Auth user id) rather than the database layer.
- **Attempts keyed by `(hominemUserId, gameId, dateUtc)`, unique-indexed.**
  This is what makes "play old unplayed puzzles" work for free — there's one
  row per user per puzzle-date, not one row per user overall.
- **`guesses` and `guessedAt` are parallel jsonb arrays, not a join table.**
  A guess history for one puzzle is small (≤6 entries) and always read/written
  as a unit, so a normalized child table would just add join overhead for no
  benefit. `guessedAt` exists as a *separate* array (not embedded per-guess
  object only) because the rate limiter needs to scan timestamps across
  *all* of a user's attempts cheaply — see `countRecentGuesses` below.
- **Anonymous players get no row at all.** Their one free guess is evaluated
  and returned without ever touching this table.
- **Second index `(hominem_user_id, updated_at)`** exists specifically to
  narrow the rate-limit scan to rows the player touched recently, instead of
  a full scan of every attempt the player has ever created.

### Migration (`migrations/0013_high_sphinx.sql`)

```sql
CREATE TABLE "labs"."realitea_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"hominem_user_id" text NOT NULL,
	"game_id" integer NOT NULL,
	"date_utc" date NOT NULL,
	"guesses" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"guessed_at" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'playing' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
ALTER TABLE "labs"."realitea_attempts" ADD CONSTRAINT "realitea_attempts_game_id_games_id_fk"
  FOREIGN KEY ("game_id") REFERENCES "labs"."games"("id") ON DELETE cascade ON UPDATE no action;
CREATE UNIQUE INDEX "realitea_attempts_user_game_date_idx"
  ON "labs"."realitea_attempts" USING btree ("hominem_user_id","game_id","date_utc");
CREATE INDEX "realitea_attempts_user_updated_idx"
  ON "labs"."realitea_attempts" USING btree ("hominem_user_id","updated_at");
```

Committed as `83103339` ("Add realitea_attempts table for server-side guess
tracking"). Getting this applied to production required an unplanned
migration-history repair — see [incident 3](incidents/003-production-migration-history-diverged.md).

### Repository functions added (`app/lib/realitea/repository.ts`)

```ts
export async function loadAttempt(userId, gameId, dateUtc): Promise<RealiteaAttempt | null>
export async function createAttempt(userId, gameId, dateUtc): Promise<RealiteaAttempt>
export async function appendGuess(attemptId, guess, status): Promise<void>
export async function countRecentGuesses(userId, windowMs): Promise<number>
```

- `appendGuess` uses raw `sql` jsonb concatenation (`guesses || $1::jsonb`)
  rather than read-modify-write in JS, so concurrent guesses from the same
  user don't race and clobber each other's array append.
- `countRecentGuesses(userId, windowMs)` pulls every attempt row updated
  since `now - windowMs` for that user (using the `user_updated_idx` index),
  then flattens and counts timestamps in `guessedAt` that fall within the
  window. This is what will back the 10-guesses/minute limit — it is
  necessarily cross-puzzle (a user working through 3 different old puzzles
  in the same minute should still hit the limit), which is why it can't be
  derived from a single attempt row's guess count.

### Types added (`app/lib/realitea/types.ts`)

```ts
type GuessRejectReason =
  | "not-in-word-list"
  | "wrong-length"
  | "already-guessed"
  | "auth-required"
  | "rate-limited"
  | "game-over";

export interface RealiteaGuessResult {
  valid: boolean;
  word?: string;
  states?: LetterState[];
  isSolved?: boolean;
  isGameOver?: boolean;
  status?: GameStatus;
  reason?: GuessRejectReason;
  authRequired?: boolean;
  remainingGuesses?: number;
}
```

`auth-required` and `rate-limited` are new reject reasons added specifically
for this feature; `authRequired` and `remainingGuesses` are new optional
result fields the client will need for task 7's UX.

---

## Task 6 — Server-side guess evaluation rewrite (done)

`evaluateGuessServer` (`app/lib/realitea/puzzle.server.ts`) now takes
`(dateKey, rawWord, user: HominemUser | null, anonymousGuessCount: number)`.
After resolving the puzzle (unchanged word-length check + grace-period
lookup), it branches:

- **Authenticated (`user` present):** `loadAttempt(user.id, gameId,
  resolvedDateKey)`. If an attempt exists and `status !== "playing"` →
  `reason: "game-over"`. If the word is already in `attempt.guesses` →
  `reason: "already-guessed"` (checked against the DB row, not anything the
  client sent). Then `countRecentGuesses(user.id, 60_000) >= 10` →
  `reason: "rate-limited"`, checked even before an attempt row exists, since
  it scans across all of the user's puzzles. On a valid guess: create the
  attempt if needed (unique-index conflict on concurrent creates falls back
  to a reload rather than erroring), score it, `appendGuess(...)`, return
  `remainingGuesses: MAX_GUESSES - guessCount`.
- **Anonymous (`user` is `null`):** `anonymousGuessCount >= 1` → `{ valid:
  false, reason: "auth-required", authRequired: true }` without ever
  touching the word list or the answer. Otherwise the single guess is scored
  in memory and returned with `isGameOver: true` always, and
  `authRequired: !isSolved` (a win on the free guess needs no sign-in nudge).
  Nothing is persisted for anonymous players — see the design note below.

`app/routes/api.games.realitea.guess.ts` now calls `getHominemUser(request)`
and passes the result through. The wire payload intentionally still includes
`previousGuesses` from the client — only its `.length` is read, and only for
the anonymous branch, so `use-game.ts` needed no payload-shape changes for
this task.

**Design note on the anonymous count being client-reported:** this is a
deliberate, accepted gap, not an oversight. Nothing security-sensitive
depends on it — the six-guess cap, duplicate check, and rate limit are all
authoritative only once `realitea_attempts` is involved (i.e. once signed
in). An anonymous player can trivially get more than one free guess (e.g. by
reloading, since neither client nor server persists anything for them). The
feature is a UX nudge toward signing in, not an access-control boundary.

Covered by 8 new/updated cases in `puzzle.server.test.ts` (anonymous
first-guess vs. second-guess, authenticated create/duplicate/six-guess-cap/
already-finished/rate-limited paths) — 44/44 tests passing. Verified
end-to-end against the dev server + real Postgres: a first anonymous guess
scores and returns `authRequired: true, isGameOver: true`; a second returns
`reason: "auth-required"` without ever evaluating the word.

---

## Task 7 — Client UX for login-required state (done)

- `use-game.ts` gained an `authRequired` boolean in `RealiTeaGameState`,
  folded into `isGameOver` (`status !== "playing" || authRequired`) so typing
  and submission lock immediately, without waiting on `deriveGameStatus`
  (which only knows about solved/6-guesses and has no concept of the
  anonymous cap). Reset alongside `guesses` on the midnight-rollover effect.
  The fetcher-result effect now sets it from either branch of a response:
  `result.reason === "auth-required"` (rejected second guess) or
  `result.authRequired === true` on a *valid* first guess. The other two new
  reject reasons (`rate-limited`, `game-over`) get a shake + inline message
  like the pre-existing ones, so no server rejection reason is silently
  swallowed.
- `route.tsx`'s loader now also returns `loginUrl`, built from
  `buildHominemLoginUrl(resolveReturnTo(request))` (both from Task 4's
  `hominem-auth.ts`, imported the same server-only way `puzzle.server.ts`
  already was). `resolveReturnTo` forces `https:` unless the host is
  localhost (Hominem's `LABS_URL` trust check is origin-based, and the app
  server can't be assumed to see its own public scheme through Railway's
  proxy), and strips a trailing `.data` path suffix — React Router's
  client-side revalidation (the timezone-sync effect already in this route)
  fetches the loader through a `<path>.data` endpoint, which would otherwise
  leak into the login redirect and send the player back to a JSON response
  instead of the page. Caught by manual browser testing, not by the type
  system, and now has a regression test (`loader.test.tsx`).
- The route component renders a `authRequired` branch ahead of the normal
  `isGameOver` recap card: a "Free guess used — sign in to keep playing"
  prompt linking to `loginUrl`, instead of the onscreen keyboard. It
  deliberately does **not** fall through to the existing solved/failed recap
  card, since that reveals `currentPuzzle.detail` (the answer's spoiler
  text) — an anonymous player who hasn't solved it shouldn't see that just
  because their one guess ran out.

Covered by 2 new route tests (sign-in prompt appears with the correct href
and replaces the keyboard; input is fully locked so no second guess request
ever reaches the server) plus a loader test asserting the `.data`-suffix
stripping. 20/20 tests passing in this route's suite; typecheck and lint
clean; verified live against the dev server + real DB.

---

## Incidents resolved along the way

Task 6 work was blocked for most of this session by a chain of CI/deploy
failures unrelated to the auth feature itself but blocking any further
`main` pushes from being trustworthy, followed by two production auth
outages found during and after QA. Each incident now has its own file with
queryable frontmatter under [docs/incidents/](incidents/) — see
[incidents/README.md](incidents/README.md) for the full index (severity,
category, services, tags). Summary:

1. [`@ponti-studios/ui@0.4.3` 404 from GitHub Packages](incidents/001-ui-package-404-github-packages.md)
2. [Still 404 after publishing: stale lockfile](incidents/002-stale-lockfile-github-packages.md)
3. [Production migration history diverged (`case_updates`)](incidents/003-production-migration-history-diverged.md)
4. [Railway remote build had no GitHub Packages auth (first 401)](incidents/004-railway-build-no-github-packages-auth.md)
5. ["It cannot move on until all services are deploying properly"](incidents/005-ci-green-but-not-deployed.md)
6. [Railway remote build 401, second occurrence (wrong token type)](incidents/006-railway-build-wrong-token-type.md)
7. [`@ponti-studios/ui` upgrade broke Tailwind content scanning again (twice)](incidents/007-tailwind-content-scanning-broken-twice.md)
8. [New users couldn't sign in: `LABS_URL` not configured in Hominem's production environment](incidents/008-labs-url-not-configured.md)
9. [GitHub Packages unreadable on Railway; then the npm republish shipped a broken package](incidents/009-github-packages-unreadable-and-broken-npm-package.md)
10. [Signed-in players silently treated as anonymous: Cloudflare's bot-challenge blocked the server-to-server session check](incidents/010-cloudflare-blocked-session-check.md)
11. [Cross-device progress not synced: today's puzzle was seeded from localStorage, not the server](incidents/011-cross-device-progress-not-synced.md)

## Current baseline (end of this session)

- CI is green and *verified* green (Railway-side, not just GitHub
  Actions-side).
- `@ponti-studios/ui` and `@ponti-studios/auth` are both now installed from
  the public npmjs.org registry, not GitHub Packages — Railway couldn't read
  GitHub Packages at all ([incident 9, part A](incidents/009-github-packages-unreadable-and-broken-npm-package.md)),
  so both packages were republished publicly and all the token/registry-override
  plumbing was removed. The republished `@ponti-studios/auth@0.1.1` shipped
  with broken subpath exports, patched around in this repo
  ([incident 9, part B](incidents/009-github-packages-unreadable-and-broken-npm-package.md)) —
  see [incidents 7](incidents/007-tailwind-content-scanning-broken-twice.md)–[9](incidents/009-github-packages-unreadable-and-broken-npm-package.md)
  for the full history of everything that's gone wrong with these two
  packages across this session.
- Production's `labs` schema migration history is consistent with the
  committed `migrations/` directory again, including `realitea_attempts`.
- **All 7 tasks are done.** RealiTea's guess API is now server-authoritative
  for signed-in players (six-guess cap, duplicate check, rate limit all
  backed by `realitea_attempts`), anonymous players get one honest free
  guess with a sign-in nudge, and the client surfaces that nudge instead of
  silently failing or leaking the answer.
- **Sign-in from RealiTea is confirmed working end-to-end in production**,
  including for brand-new users — see
  [incident 8](incidents/008-labs-url-not-configured.md) for the `LABS_URL`
  misconfiguration that briefly blocked this, and
  [incident 10](incidents/010-cloudflare-blocked-session-check.md) for a
  second, differently-shaped outage found afterward: signed-in players were
  silently treated as anonymous because Cloudflare's bot-challenge in front
  of `api.ponti.io` was intercepting labs' server-to-server session check.
- Also shipped in this session, adjacent to the auth work: a header redesign
  for the RealiTea route (large centered logo, gold divider) and a tile-grid
  gap/sizing pass (see [incident 7](incidents/007-tailwind-content-scanning-broken-twice.md)
  for the logo-asset regression this surfaced and fixed).

