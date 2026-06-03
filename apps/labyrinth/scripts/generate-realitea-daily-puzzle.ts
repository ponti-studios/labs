import { closeDb } from "@pontistudios/db";

import { mapRecordToStoredPuzzle, parseDate } from "../app/lib/realitea-daily-puzzle";
import { generateDailyPuzzle } from "../app/lib/realitea-daily-puzzle.server";

function getDateArg(): string | null {
  const dateArg = process.argv.find((arg) => arg.startsWith("--date-utc="));
  if (dateArg) {
    return dateArg.slice("--date-utc=".length);
  }

  return process.env.DATE_UTC ?? null;
}

function requireEnvironment() {
  const missing = ["DATABASE_URL", "OPENROUTER_API_KEY"].filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

async function main() {
  requireEnvironment();

  const dateInput = getDateArg();
  const date = parseDate(dateInput) ?? new Date();
  const dateUtc = date.toISOString().slice(0, 10);
  const puzzle = await generateDailyPuzzle(date);

  if (!puzzle) {
    console.log(
      JSON.stringify(
        {
          dateUtc,
          status: "fallback",
        },
        null,
        2,
      ),
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    JSON.stringify(
      {
        dateUtc: puzzle.dateUtc,
        puzzle: mapRecordToStoredPuzzle(puzzle),
        status: "published",
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
