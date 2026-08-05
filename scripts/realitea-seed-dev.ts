/**
 * realitea-seed-dev.ts
 *
 * Dev-only: inserts a cheap, fixture RealiTea puzzle for today (and
 * optionally a few days around it) with no LLM call — unlike
 * scripts/realitea-generate.ts, which is LLM-backed and costs real tokens.
 *
 * A fresh dev DB has zero rows in `daily_puzzles` (migrations only seed the
 * `games`/`feeds` metadata, never puzzle content), so `/games/realitea`
 * throws ERROR_NO_PUZZLE_AVAILABLE until something populates today's row.
 * This script exists so that doesn't require an OPENROUTER_API_KEY just to
 * get a playable board locally.
 *
 * Never wired into CI — local test-data seeding only. See also
 * scripts/realitea-seed-history.ts, which backfills a spread of *past* days
 * with attempts for exercising the history page; this script only seeds
 * puzzle content (no attempts) for today going forward.
 *
 * Usage:
 *   pnpm realitea:seed-dev
 *   pnpm realitea:seed-dev --days 3       # today + the next 2 days
 *   pnpm realitea:seed-dev --answer OCEAN # override today's answer
 *   pnpm realitea:seed-dev --force        # overwrite today even if it exists
 */
import "dotenv/config";
import { parseArgs } from "node:util";

import { normalizeGuess } from "../app/lib/realitea/index";
import { addDaysToDateKey, getDateKey } from "../app/lib/realitea/date";
import { getGameBySlug, loadPuzzleForDate } from "../app/lib/realitea/repository";
import { articles, dailyPuzzles, db, feeds } from "../app/lib/server/db";
import { and, eq } from "drizzle-orm";

const RHOBH_GAME_SLUG = "rhobh";
const SEED_FEED_URL = "https://seed.local/realitea-dev-feed";

/** Fixed, deterministic 5-letter dictionary words — no LLM, no repeats. */
const DEFAULT_ANSWERS = ["DRAMA", "GLASS", "TOAST", "STORM", "TWIST", "CROWN", "SPARK"];

function parseCliArgs(): { days: number; answer: string | undefined; force: boolean } {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      days: { type: "string" },
      answer: { type: "string" },
      force: { type: "boolean" },
    },
    strict: true,
  });

  const days = values.days ? Number.parseInt(values.days, 10) : 1;
  if (!Number.isInteger(days) || days < 1) {
    throw new Error(`--days must be a positive integer, got: ${values.days}`);
  }

  return { days, answer: values.answer, force: values.force ?? false };
}

async function ensureGameAndFeed() {
  const game = await getGameBySlug(RHOBH_GAME_SLUG);
  if (!game) {
    throw new Error(`Game not found: ${RHOBH_GAME_SLUG} — run migrations first (pnpm db:migrate).`);
  }

  const [feed] = await db
    .insert(feeds)
    .values({ url: SEED_FEED_URL, label: "Seed: local dev fixtures" })
    .onConflictDoNothing({ target: feeds.url })
    .returning();

  const feedRow =
    feed ?? (await db.query.feeds.findFirst({ where: eq(feeds.url, SEED_FEED_URL) }));
  if (!feedRow) throw new Error("Failed to create or find the seed feed");

  return { game, feed: feedRow };
}

async function seedPuzzle(
  gameId: number,
  feedId: number,
  dateKey: string,
  rawAnswer: string,
  force: boolean,
) {
  const existing = await loadPuzzleForDate(gameId, dateKey);
  if (existing && !force) {
    console.log(`  ${dateKey}: puzzle already exists (${existing.answer}), skipping`);
    return;
  }

  if (existing && force) {
    await db
      .delete(dailyPuzzles)
      .where(and(eq(dailyPuzzles.gameId, gameId), eq(dailyPuzzles.dateUtc, dateKey)));
  }

  const answer = normalizeGuess(rawAnswer);
  if (answer.length !== 5) {
    throw new Error(`Answer must normalize to exactly 5 letters, got "${rawAnswer}" -> "${answer}"`);
  }

  const url = `${SEED_FEED_URL}/${dateKey}`;
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
      clue: `Dev fixture clue for ${dateKey}.`,
      detail: `Dev fixture story detail for ${dateKey} — the answer was ${answer}.`,
    })
    .onConflictDoNothing({ target: [dailyPuzzles.gameId, dailyPuzzles.dateUtc] });

  console.log(`  ${dateKey}: seeded (${answer})`);
}

async function main() {
  const { days, answer, force } = parseCliArgs();
  console.log(`Seeding ${days} day(s) of RealiTea dev fixtures\n`);

  const { game, feed } = await ensureGameAndFeed();
  const today = getDateKey(new Date(), "UTC");

  for (let offset = 0; offset < days; offset += 1) {
    const dateKey = offset === 0 ? today : addDaysToDateKey(today, offset);
    if (!dateKey) continue;
    const rawAnswer = offset === 0 && answer ? answer : DEFAULT_ANSWERS[offset % DEFAULT_ANSWERS.length];
    await seedPuzzle(game.id, feed.id, dateKey, rawAnswer, force);
  }

  console.log(`\nDone. View: http://localhost:3001/games/realitea`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
