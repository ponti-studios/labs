import { closeDb, db, eq, rhobhDailyPuzzles } from "@pontistudios/db";

import { addDaysToDateKey, getDateKey, isDateKey } from "../app/lib/realitea-daily-puzzle";
import { generateScheduledPuzzle } from "../app/lib/realitea-daily-puzzle.server";

interface GenerationOptions {
  dateKey?: string;
  from?: string;
  to?: string;
  daysAhead?: number;
  publish?: boolean;
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
    } else if (arg === "--publish") {
      opts.publish = true;
    } else if (arg === "--dry-run") {
      opts.dryRun = true;
    }
  }

  return opts;
}

function getDateRange(opts: GenerationOptions): string[] {
  const now = new Date();
  let startKey = opts.dateKey ?? opts.from ?? getDateKey(now);
  let endKey = opts.to ?? opts.dateKey;

  if (!isDateKey(startKey)) throw new Error(`Invalid start date: ${startKey}`);
  if (endKey && !isDateKey(endKey)) throw new Error(`Invalid end date: ${endKey}`);

  if (opts.daysAhead) {
    const dates: string[] = [];
    let current = startKey;
    for (let i = 0; i < opts.daysAhead; i++) {
      dates.push(current);
      const next = addDaysToDateKey(current, 1);
      if (!next) break;
      current = next;
    }
    return dates;
  }

  if (endKey && endKey !== startKey) {
    const dates: string[] = [];
    let current = startKey;
    while (true) {
      dates.push(current);
      if (current === endKey) break;
      const next = addDaysToDateKey(current, 1);
      if (!next) break;
      current = next;
    }
    return dates;
  }

  return [startKey];
}

function requireEnvironment() {
  const missing = ["DATABASE_URL", "OPENROUTER_API_KEY"].filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

async function publishPuzzle(puzzleId: number): Promise<void> {
  const now = new Date();
  await db
    .update(rhobhDailyPuzzles)
    .set({
      dateUtc: getDateKey(now),
      publishAt: now,
      expireAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      status: "published",
      updatedAt: now,
    })
    .where(eq(rhobhDailyPuzzles.id, puzzleId));
}

async function main() {
  requireEnvironment();

  const opts = parseArgs();
  const dateKeys = getDateRange(opts);

  console.log(
    `\n📅 Generating puzzles for ${dateKeys.length} day(s)${opts.dryRun ? " (dry-run)" : ""}${opts.publish ? " (will publish)" : ""}\n`,
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

      if (opts.publish && puzzle.id) {
        await publishPuzzle(puzzle.id);
        console.log(`✓ ${dateKey}: generated and published (${puzzle.answer})`);
        results.push({ dateKey, status: "published", id: puzzle.id, answer: puzzle.answer });
      } else {
        console.log(`✓ ${dateKey}: scheduled (${puzzle.answer})`);
        results.push({ dateKey, status: "scheduled", id: puzzle.id, answer: puzzle.answer });
      }
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
