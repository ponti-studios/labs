import { closeDb } from "@pontistudios/db";

import { generateReservePuzzles } from "../app/lib/realitea-daily-puzzle.server";

function getCountArg(): number {
  const arg = process.argv.find((value) => value.startsWith("--count="));
  const raw = arg ? arg.slice("--count=".length) : process.env.COUNT ?? "1";
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? 1 : Math.max(1, parsed);
}

function requireEnvironment() {
  const missing = ["DATABASE_URL"].filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

async function main() {
  requireEnvironment();

  const count = getCountArg();
  const created = await generateReservePuzzles(count, {
    generationBatchId: `manual-reserve:${new Date().toISOString()}`,
    now: new Date(),
  });

  console.log(
    JSON.stringify(
      {
        countRequested: count,
        createdCount: created.length,
        ids: created.map((record) => record.id),
        sourceKinds: created.map((record) => record.sourceKind),
        status: "reserve-generated",
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
