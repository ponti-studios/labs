import { closeDb } from "@pontistudios/db";

import { getDateKey, isDateKey } from "../app/lib/realitea-daily-puzzle";
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
  if (!isDateKey(dateKey)) {
    throw new Error(`Invalid date key: ${dateKey}`);
  }

  const puzzle = await generateScheduledPuzzle(dateKey);

  if (!puzzle) {
    console.log(JSON.stringify({ dateKey, status: "failed" }, null, 2));
    process.exitCode = 1;
    return;
  }

  console.log(JSON.stringify({ dateKey, id: puzzle.id, status: puzzle.status }, null, 2));
}

try {
  await main();
} finally {
  closeDb();
}
