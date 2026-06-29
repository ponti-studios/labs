import "dotenv/config";
import { parseArgs } from "node:util";
import { closeDb } from "@pontistudios/db";

import { buildDateRange, getDateKey, isDateKey } from "../app/lib/realitea/date";
import { getErrorMessage } from "../app/lib/errors";
import { generateScheduledPuzzle } from "../app/lib/realitea/generation";
import { LabyrinthServerEnv } from "../app/lib/server/env";

interface GenerationOptions {
  dateKey?: string;
  from?: string;
  to?: string;
  daysAhead?: number;
}

export function parseGenerateArgs(argv: string[]): GenerationOptions {
  const { values } = parseArgs({
    args: argv,
    options: {
      "date-key": { type: "string" },
      from: { type: "string" },
      to: { type: "string" },
      "days-ahead": { type: "string" },
    },
    strict: true,
  });
  return {
    ...(values["date-key"] !== undefined && { dateKey: values["date-key"] }),
    ...(values.from !== undefined && { from: values.from }),
    ...(values.to !== undefined && { to: values.to }),
    ...(values["days-ahead"] !== undefined && { daysAhead: parseInt(values["days-ahead"], 10) }),
  };
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
      console.error(`[ERROR] ${dateKey}: ${getErrorMessage(err)}`);
    }
  }

  skipped = dateKeys.length - generated - failed;
  console.log(JSON.stringify({ generated, failed, skipped }));

  if (failed > 0) process.exit(1);
}

if (!process.env.VITEST) {
  try {
    await main();
  } catch (err) {
    console.error(getErrorMessage(err));
    process.exit(1);
  } finally {
    closeDb();
  }
}
