import { closeDb } from "@pontistudios/db";

import { getDateKey } from "../app/lib/realitea-daily-puzzle";
import { reconcilePuzzleInventory } from "../app/lib/realitea-daily-puzzle.server";

function requireEnvironment() {
  const missing = ["DATABASE_URL", "OPENROUTER_API_KEY"].filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

async function main() {
  requireEnvironment();

  const now = new Date();
  const result = await reconcilePuzzleInventory(now);

  console.log(
    JSON.stringify(
      {
        activeDateKey: result.activeDateKey,
        createdReserveCount: result.createdReserveCount,
        createdScheduledDateKeys: result.createdScheduledDateKeys,
        promotedSourceKind: result.promotedSourceKind,
        publishedSourceKind: result.publishedSourceKind,
        readyDepth: result.readyDepth,
        reserveDepth: result.reserveDepth,
        runDateKey: getDateKey(now),
        status: "reconciled",
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
