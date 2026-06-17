import { closeDb } from "@pontistudios/db";

import { getDateKey, parseDate } from "../app/lib/realitea-daily-puzzle";
import { generateScheduledPuzzle } from "../app/lib/realitea-daily-puzzle.server";

function getDateArg(): string | null {
  const dateArg = process.argv.find((arg) => arg.startsWith("--date-key="));
  if (dateArg) {
    return dateArg.slice("--date-key=".length);
  }

  return process.env.DATE_KEY ?? null;
}

function requireEnvironment() {
  const missing = ["DATABASE_URL", "OPENROUTER_API_KEY"].filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

async function main() {
  requireEnvironment();

  const dateKey = getDateArg() ?? getDateKey(new Date());
  const date = parseDate(dateKey);
  if (!date) {
    throw new Error(`Invalid date key: ${dateKey}`);
  }

  const puzzle = await generateScheduledPuzzle(dateKey, {
    generationBatchId: `manual-scheduled:${dateKey}`,
    now: date,
  });

  if (!puzzle) {
    console.log(JSON.stringify({ dateKey, status: "failed" }, null, 2));
    process.exitCode = 1;
    return;
  }

  console.log(
    JSON.stringify(
      {
        dateKey,
        id: puzzle.id,
        sourceKind: puzzle.sourceKind,
        status: puzzle.status,
      },
      null,
      2,
    ),
  );
}

try {
  await main();
} finally {
  closeDb();
}
