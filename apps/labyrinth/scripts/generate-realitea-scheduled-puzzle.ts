import { closeDb, db, eq, rhobhDailyPuzzles } from "@pontistudios/db";

import { buildDateRange, getDateKey, isDateKey } from "../app/lib/realitea-date";
import { generateScheduledPuzzle } from "../app/lib/realitea-generation";
import { LabyrinthServerEnv } from "../app/lib/server/env";

interface GenerationOptions {
  dateKey?: string;
  from?: string;
  to?: string;
  daysAhead?: number;
  dryRun?: boolean;
}

function parseArgs(): GenerationOptions {
  const args = process.argv.slice(2);
  const opts: GenerationOptions = {};

  for (const arg of args) {
    if (arg.startsWith("--date-key=")) {
      opts.dateKey = arg.slice("--date-key=".length);
    } else if (arg.startsWith("--from=")) {
      opts.from = arg.slice("--from=".length);
    } else if (arg.startsWith("--to=")) {
      opts.to = arg.slice("--to=".length);
    } else if (arg.startsWith("--days-ahead=")) {
      opts.daysAhead = parseInt(arg.slice("--days-ahead=".length), 10);
    } else if (arg === "--dry-run") {
      opts.dryRun = true;
    }
  }

  return opts;
}

function getDateRange(opts: GenerationOptions): string[] {
  const now = new Date();
  const startKey = opts.dateKey ?? opts.from ?? getDateKey(now);
  const endKey = opts.to ?? opts.dateKey;

  if (!isDateKey(startKey)) throw new Error(`Invalid start date: ${startKey}`);
  if (endKey && !isDateKey(endKey)) throw new Error(`Invalid end date: ${endKey}`);

  if (opts.daysAhead) {
    return buildDateRange(startKey, { daysAhead: opts.daysAhead });
  }

  if (endKey && endKey !== startKey) {
    return buildDateRange(startKey, { endKey });
  }

  return [startKey];
}


async function main() {
  LabyrinthServerEnv.parse(process.env);

  const opts = parseArgs();
  const dateKeys = getDateRange(opts);

  console.log(
    `\n📅 Generating puzzles for ${dateKeys.length} day(s)${opts.dryRun ? " (dry-run)" : ""}\n`,
  );

  const results: Array<{ dateKey: string; status: string; id?: number; answer?: string }> = [];

  for (const dateKey of dateKeys) {
    try {
      const puzzle = await generateScheduledPuzzle(dateKey);

      if (!puzzle) {
        console.log(`❌ ${dateKey}: generation failed after all attempts`);
        results.push({ dateKey, status: "failed" });
        continue;
      }

      if (opts.dryRun) {
        console.log(`✓ ${dateKey}: validated (${puzzle.answer}) - dry-run, not inserted`);
        results.push({ dateKey, status: "validated", answer: puzzle.answer });
        continue;
      }

      console.log(`✓ ${dateKey}: generated (${puzzle.answer})`);
      results.push({ dateKey, status: "generated", id: puzzle.id, answer: puzzle.answer });
    } catch (err) {
      console.log(`❌ ${dateKey}: ${err instanceof Error ? err.message : String(err)}`);
      results.push({ dateKey, status: "error" });
    }
  }

  console.log(
    `\n📊 Summary: ${results.filter((r) => r.status !== "failed" && r.status !== "error").length}/${dateKeys.length} succeeded\n`,
  );
  console.log(JSON.stringify({ dates: dateKeys.length, results }, null, 2));
}

try {
  await main();
} finally {
  closeDb();
}
