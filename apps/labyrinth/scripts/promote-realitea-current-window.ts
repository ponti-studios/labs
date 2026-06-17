import { closeDb } from "@pontistudios/db";

import { getPuzzleWindow } from "../app/lib/realitea-daily-puzzle";
import { promoteScheduledOrReservePuzzle } from "../app/lib/realitea-daily-puzzle.server";

function requireEnvironment() {
  const missing = ["DATABASE_URL"].filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

async function main() {
  requireEnvironment();

  const now = new Date();
  const window = getPuzzleWindow(now);
  const promoted = await promoteScheduledOrReservePuzzle(now);

  console.log(
    JSON.stringify(
      {
        activeDateKey: window.dateKey,
        id: promoted?.id ?? null,
        sourceKind: promoted?.sourceKind ?? null,
        status: promoted?.status ?? "missing",
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
