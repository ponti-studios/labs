/** Seed deterministic game puzzles for local development without an LLM call. */
import { parseArgs } from "node:util";

import { addDaysToDateKey, getDateKey } from "../src/lib/puzzle/date";
import { ensureGameCatalog } from "../src/lib/generation/ingest.server";
import { ensureSeedPuzzle, requireSeedGame } from "../src/lib/data/dev-seed.server";
import { runScript } from "./_shared/run-script";

const SEED_TOPIC_FEED_URL = "https://seed.local/game-dev-feed";
const DEFAULT_ANSWERS = ["DRAMA", "GLASS", "TOAST", "STORM", "TWIST", "CROWN", "SPARK"];

function parseCliArgs() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      days: { type: "string" },
      answer: { type: "string" },
    },
    strict: true,
  });
  const days = values.days ? Number.parseInt(values.days, 10) : 1;
  if (!Number.isInteger(days) || days < 1)
    throw new Error(`--days must be a positive integer, got: ${values.days}`);
  return { days, answer: values.answer };
}

async function main() {
  const { days, answer } = parseCliArgs();
  await ensureGameCatalog();
  const game = await requireSeedGame();
  console.log(`Seeding  day(s) of game dev fixtures\n`);

  const today = getDateKey(new Date(), "UTC");
  for (let offset = 0; offset < days; offset += 1) {
    const dateKey = offset === 0 ? today : addDaysToDateKey(today, offset);
    if (!dateKey) continue;
    const rawAnswer =
      offset === 0 && answer ? answer : DEFAULT_ANSWERS[offset % DEFAULT_ANSWERS.length];
    const puzzle = await ensureSeedPuzzle(game.id, dateKey, rawAnswer, {
      articleUrl: `${SEED_TOPIC_FEED_URL}/${dateKey}`,
      cluePrefix: "Dev fixture clue",
      detailPrefix: "Dev fixture story detail",
    });
    console.log(`  ${dateKey}: seeded (${puzzle.answer})`);
  }
  console.log("\nDone. View: http://localhost:3001/games/game");
}

if (!process.env.VITEST) await runScript(main);
