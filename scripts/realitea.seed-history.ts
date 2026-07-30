/**
 * realitea.seed-history.ts
 *
 * Dev-only: backfills a spread of past RealiTea puzzles and attempts so the
 * /games/realitea/history page can be exercised manually — solved days
 * (forming two separate streak segments with a break in between), a failed
 * day, an in-progress day, and a run of entirely-unplayed days.
 *
 * Never wired into CI — this is local test-data seeding, not part of the
 * shipped generation pipeline (that's scripts/realitea.generate.ts, which is
 * LLM-backed and meant for future-dated inventory, not cheap historical
 * backfill).
 *
 * Usage:
 *   pnpm realitea:seed-history --user-id <hominem-user-id>
 *
 * `--user-id` defaults to the local e2e test account
 * (e2e@test.hakumi.io -> 8a3479d7-95ef-4dd5-b5ff-82d92a208933), resolved via
 * manual sign-in earlier in development — this DB has no `users` table to
 * look it up (Better Auth owns that in Hominem's own database).
 */
import "dotenv/config";
import { parseArgs } from "node:util";

import { evaluateGuess, isGuessSolved } from "../app/lib/realitea/index";
import { addDaysToDateKey, getDateKey } from "../app/lib/realitea/date";
import { appendGuess, createAttempt, getGameBySlug, loadAttempt, loadPuzzleForDate } from "../app/lib/realitea/repository";
import { articles, db, dailyPuzzles, feeds } from "../app/lib/server/db";
import { eq } from "drizzle-orm";

const DEFAULT_USER_ID = "8a3479d7-95ef-4dd5-b5ff-82d92a208933"; // e2e@test.hakumi.io
const RHOBH_GAME_SLUG = "rhobh";
const LOOKBACK_DAYS = 19;

type PlannedStatus = "solved" | "failed" | "playing" | "unplayed";

function parseCliArgs(): { userId: string } {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: { "user-id": { type: "string" } },
    strict: true,
  });
  return { userId: values["user-id"] ?? DEFAULT_USER_ID };
}

/** Fixed, deterministic 5-letter answers per offset — no LLM, no repeats. */
const ANSWERS = [
  "GLASS",
  "PORSH",
  "BRAWL",
  "SHADE",
  "TOAST",
  "CROWN",
  "STORM",
  "FEUDS",
  "TWIST",
  "REVEL",
  "GOSSY",
  "DRAMA",
  "VOICE",
  "TEARS",
  "LIMOS",
  "CHAMP",
  "GLARE",
  "SPARK",
  "TRUST",
];

const FILLER_GUESSES = ["ABASE", "ABASH", "ABATE", "ABBEY", "ABACK"];
const SIX_WRONG_GUESSES = ["ABASE", "ABASH", "ABATE", "ABBEY", "ABACK", "ABAFT"];

async function ensureGameAndFeed() {
  const game = await getGameBySlug(RHOBH_GAME_SLUG);
  if (!game) throw new Error(`Game not found: ${RHOBH_GAME_SLUG} — run the app once to seed it first.`);

  const [feed] = await db
    .insert(feeds)
    .values({ url: "https://seed.local/realitea-history-feed", label: "Seed: history backfill" })
    .onConflictDoNothing({ target: feeds.url })
    .returning();

  const feedRow =
    feed ??
    (await db.query.feeds.findFirst({ where: eq(feeds.url, "https://seed.local/realitea-history-feed") }));
  if (!feedRow) throw new Error("Failed to create or find the seed feed");

  return { game, feed: feedRow };
}

async function ensurePuzzle(gameId: number, feedId: number, dateKey: string, answer: string) {
  const existing = await loadPuzzleForDate(gameId, dateKey);
  if (existing) return existing;

  const url = `https://seed.local/realitea-history/${dateKey}`;
  const [article] = await db
    .insert(articles)
    .values({ feedId, url, title: `Seed article for ${dateKey}`, status: "used" })
    .onConflictDoNothing({ target: articles.url })
    .returning();
  const articleRow =
    article ?? (await db.query.articles.findFirst({ where: eq(articles.url, url) }));
  if (!articleRow) throw new Error(`Failed to create or find seed article for ${dateKey}`);

  await db
    .insert(dailyPuzzles)
    .values({
      gameId,
      articleId: articleRow.id,
      dateUtc: dateKey,
      answer,
      answerType: "storyline",
      normalizedAnswer: answer,
      clue: `Seed clue for ${dateKey}.`,
      detail: `Seed story detail for ${dateKey} — the answer was ${answer}.`,
    })
    .onConflictDoNothing({ target: [dailyPuzzles.gameId, dailyPuzzles.dateUtc] });

  const puzzle = await loadPuzzleForDate(gameId, dateKey);
  if (!puzzle) throw new Error(`Failed to create or find seed puzzle for ${dateKey}`);
  return puzzle;
}

async function seedAttempt(
  userId: string,
  gameId: number,
  dateKey: string,
  answer: string,
  status: PlannedStatus,
) {
  if (status === "unplayed") return;

  const existing = await loadAttempt(userId, gameId, dateKey);
  if (existing) {
    console.log(`  ${dateKey}: attempt already exists, skipping`);
    return;
  }

  const attempt = await createAttempt(userId, gameId, dateKey);

  const guessPlan: string[] =
    status === "solved"
      ? [...FILLER_GUESSES.slice(0, 2), answer]
      : status === "failed"
        ? SIX_WRONG_GUESSES
        : FILLER_GUESSES.slice(0, 2); // playing: a couple of guesses, unresolved

  let attemptStatus: "playing" | "solved" | "failed" = "playing";
  for (const [index, word] of guessPlan.entries()) {
    const states = evaluateGuess(answer, word);
    const solved = isGuessSolved({ word, states });
    const isLast = index === guessPlan.length - 1;
    attemptStatus = solved ? "solved" : isLast && status === "failed" ? "failed" : "playing";
    await appendGuess(attempt.id, { word, states }, attemptStatus);
  }

  console.log(`  ${dateKey}: seeded ${status} (${guessPlan.length} guesses)`);
}

async function main() {
  const { userId } = parseCliArgs();
  console.log(`Seeding RealiTea history for user ${userId}\n`);

  const { game, feed } = await ensureGameAndFeed();
  const today = getDateKey(new Date(), "UTC");

  // Plan: -1..-5 solved, -6 failed, -7 playing, -8..-12 solved (a second,
  // separate streak segment), -13..-19 unplayed.
  const plan: { offset: number; status: PlannedStatus }[] = [
    ...[1, 2, 3, 4, 5].map((offset) => ({ offset, status: "solved" as const })),
    { offset: 6, status: "failed" as const },
    { offset: 7, status: "playing" as const },
    ...[8, 9, 10, 11, 12].map((offset) => ({ offset, status: "solved" as const })),
    ...[13, 14, 15, 16, 17, 18, 19].map((offset) => ({ offset, status: "unplayed" as const })),
  ];

  for (const { offset, status } of plan) {
    const dateKey = addDaysToDateKey(today, -offset);
    if (!dateKey) continue;
    const answer = ANSWERS[offset - 1] ?? "DRAMA";

    const puzzle = await ensurePuzzle(game.id, feed.id, dateKey, answer);
    await seedAttempt(userId, game.id, dateKey, puzzle.answer, status);
  }

  console.log(`\nDone. Seeded ${LOOKBACK_DAYS} days (through ${addDaysToDateKey(today, -LOOKBACK_DAYS)}).`);
  console.log(`View: http://localhost:3001/games/realitea/history`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
