/** Seed a deterministic What history scenario for local development. */
import { parseArgs } from "node:util";

import { addDaysToDateKey, getDateKey } from "../src/lib/what/core/date";
import { ensureWhatCatalog } from "../src/lib/what/generation/ingest.server";
import {
  ensureSeedPuzzle,
  requireSeedGame,
  seedAttempt,
  type SeedAttemptStatus,
} from "../src/lib/what/server/dev-seed.server";
import { runScript } from "./_shared/run-script";

const DEFAULT_USER_ID = "8a3479d7-95ef-4dd5-b5ff-82d92a208933";
const LOOKBACK_DAYS = 19;
const HISTORY_FEED_URL = "https://seed.local/what-history-feed";
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
const FILLER_GUESSES = ["ABASE", "ABASH"];
const SIX_WRONG_GUESSES = ["ABASE", "ABASH", "ABATE", "ABBEY", "ABACK", "ABAFT"];

function parseCliArgs() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: { "user-id": { type: "string" } },
    strict: true,
  });
  return { userId: values["user-id"] ?? DEFAULT_USER_ID };
}

async function main() {
  const { userId } = parseCliArgs();
  await ensureWhatCatalog();
  const game = await requireSeedGame();
  const today = getDateKey(new Date(), "UTC");
  const plan: Array<{ offset: number; status: SeedAttemptStatus }> = [
    ...[1, 2, 3, 4, 5].map((offset) => ({ offset, status: "solved" as const })),
    { offset: 6, status: "failed" },
    { offset: 7, status: "playing" },
    ...[8, 9, 10, 11, 12].map((offset) => ({ offset, status: "solved" as const })),
    ...[13, 14, 15, 16, 17, 18, 19].map((offset) => ({ offset, status: "unplayed" as const })),
  ];

  console.log(`Seeding What history for user ${userId}\n`);
  for (const { offset, status } of plan) {
    const dateKey = addDaysToDateKey(today, -offset);
    if (!dateKey) continue;
    const answer = ANSWERS[offset - 1] ?? "DRAMA";
    const puzzle = await ensureSeedPuzzle(game.id, dateKey, answer, {
      articleUrl: `${HISTORY_FEED_URL}/${dateKey}`,
      cluePrefix: "Seed clue",
      detailPrefix: "Seed story detail",
    });
    await seedAttempt(userId, game.id, dateKey, puzzle.answer, status, {
      solved: FILLER_GUESSES,
      failed: SIX_WRONG_GUESSES,
      playing: FILLER_GUESSES,
    });
    console.log(`  ${dateKey}: seeded ${status}`);
  }

  console.log(
    `\nDone. Seeded ${LOOKBACK_DAYS} days (through ${addDaysToDateKey(today, -LOOKBACK_DAYS)}).`,
  );
  console.log("View: http://localhost:3001/games/what/history");
}

if (!process.env.VITEST) await runScript(main);
