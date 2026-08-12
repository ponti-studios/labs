/** Seed deterministic RealiTea puzzles for local development without an LLM call. */
import { parseArgs } from "node:util";

import { addDaysToDateKey, getDateKey } from "../app/lib/realitea/core/date";
import {
  ensureSeedPuzzle,
  requireSeedGame,
} from "../app/lib/realitea/server/dev-seed.server";
import { runScript } from "./_shared/run-script";

const SEED_TOPIC_FEED_URL = "https://seed.local/realitea-dev-feed";
const DEFAULT_ANSWERS = ["DRAMA", "GLASS", "TOAST", "STORM", "TWIST", "CROWN", "SPARK"];

function parseCliArgs() {
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
  if (!Number.isInteger(days) || days < 1) throw new Error(`--days must be a positive integer, got: ${values.days}`);
  return { days, answer: values.answer, force: values.force ?? false };
}

async function main() {
  const { days, answer, force } = parseCliArgs();
  const game = await requireSeedGame();
  console.log(`Seeding ${days} day(s) of RealiTea dev fixtures\n`);

  const today = getDateKey(new Date(), "UTC");
  for (let offset = 0; offset < days; offset += 1) {
    const dateKey = offset === 0 ? today : addDaysToDateKey(today, offset);
    if (!dateKey) continue;
    const rawAnswer = offset === 0 && answer ? answer : DEFAULT_ANSWERS[offset % DEFAULT_ANSWERS.length];
    const puzzle = await ensureSeedPuzzle(game.id, dateKey, rawAnswer, {
      force,
      articleUrl: `${SEED_TOPIC_FEED_URL}/${dateKey}`,
      cluePrefix: "Dev fixture clue",
      detailPrefix: "Dev fixture story detail",
    });
    console.log(`  ${dateKey}: seeded (${puzzle.answer})`);
  }
  console.log("\nDone. View: http://localhost:3001/games/realitea");
}

if (!process.env.VITEST) await runScript(main);
