import "dotenv/config";
import { closeDb } from "@pontistudios/db";

import { buildDateRange, getDateKey, isDateKey } from "../app/lib/realitea-date";
import { generateScheduledPuzzle } from "../app/lib/realitea-generation";
import { withDbCleanup } from "../app/lib/realitea-scripts";
import { LabyrinthServerEnv } from "../app/lib/server/env";

interface GenerationOptions {
  dateKey?: string;
  from?: string;
  to?: string;
  daysAhead?: number;
}

export function parseGenerateArgs(argv: string[]): GenerationOptions {
  const opts: GenerationOptions = {};
  for (const arg of argv) {
    if (arg.startsWith("--date-key=")) opts.dateKey = arg.slice("--date-key=".length);
    else if (arg.startsWith("--from=")) opts.from = arg.slice("--from=".length);
    else if (arg.startsWith("--to=")) opts.to = arg.slice("--to=".length);
    else if (arg.startsWith("--days-ahead=")) opts.daysAhead = parseInt(arg.slice("--days-ahead=".length), 10);
  }
  return opts;
}

export function buildGenerateRange(opts: GenerationOptions): string[] {
  const startKey = opts.dateKey ?? opts.from ?? getDateKey(new Date());
  if (!isDateKey(startKey)) throw new Error(`Invalid start date: ${startKey}`);

  if (opts.daysAhead) {
    return buildDateRange(startKey, { daysAhead: opts.daysAhead });
  }

  const endKey = opts.to ?? opts.dateKey;
  if (endKey && endKey !== startKey) {
    if (!isDateKey(endKey)) throw new Error(`Invalid end date: ${endKey}`);
    return buildDateRange(startKey, { endKey });
  }

  return [startKey];
}

async function main() {
  LabyrinthServerEnv.parse(process.env);

  const opts = parseGenerateArgs(process.argv.slice(2));
  const dateKeys = buildGenerateRange(opts);

  let generated = 0;
  let failed = 0;
  let skipped = 0;

  for (const dateKey of dateKeys) {
    try {
      const puzzle = await generateScheduledPuzzle(dateKey);
      if (puzzle) {
        generated++;
      } else {
        failed++;
        console.error(`[FAILED] ${dateKey}: generation returned no result`);
      }
    } catch (err) {
      failed++;
      console.error(`[ERROR] ${dateKey}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  skipped = dateKeys.length - generated - failed;
  console.log(JSON.stringify({ generated, failed, skipped }));

  if (failed > 0) process.exit(1);
}

if (!process.env.VITEST) {
  await withDbCleanup(main).catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    closeDb();
    process.exit(1);
  });
}
