/**
 * Standalone perf/correctness harness for the Connections daily picker.
 * No database, no network — just fixture generation + the pure picker.
 *
 * Run: pnpm connections:simulate
 * Flags: --bank=900 --days=730 --vocab=4000 --cooldown=180 --seed=1
 */
import { daysBetween, pickDailyGroups } from "./picker";
import { generateSyntheticBank } from "./synthetic";

function seededRng(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const arg of argv) {
    const match = /^--([\w-]+)=(.*)$/.exec(arg);
    if (match?.[1] && match[2] !== undefined) out[match[1]] = match[2];
  }
  return out;
}

function addDays(isoDate: string, n: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor(p * sorted.length));
  return sorted[idx] ?? 0;
}

function run() {
  const args = parseArgs(process.argv.slice(2));
  const bankSize = Number(args.bank ?? 900);
  const days = Number(args.days ?? 730);
  const vocabSize = Number(args.vocab ?? 4000);
  const cooldownDays = Number(args.cooldown ?? 180);
  const seed = Number(args.seed ?? 1);
  const startDate = "2026-01-01";

  const rng = seededRng(seed);
  const bank = generateSyntheticBank({ size: bankSize, vocabSize, rng });

  console.log(`bank=${bankSize} vocab=${vocabSize} days=${days} cooldown=${cooldownDays} seed=${seed}`);
  console.log(`per-tier bank size ~= ${Math.floor(bankSize / 4)}`);

  const usage = new Map<string, string>(); // last-used date, what the picker actually consumes
  const fullHistory = new Map<string, string[]>(); // every use, for post-hoc cooldown verification
  const attemptCounts: number[] = [];
  const durationsMs: number[] = [];
  let failures = 0;
  let firstFailureDay = -1;

  const start = performance.now();
  for (let day = 0; day < days; day++) {
    const asOf = addDays(startDate, day);
    const t0 = performance.now();
    const result = pickDailyGroups(bank, asOf, usage, { cooldownDays, rng });
    const t1 = performance.now();

    durationsMs.push(t1 - t0);
    attemptCounts.push(result.attempts);

    if (!result.ok) {
      failures++;
      if (firstFailureDay === -1) firstFailureDay = day;
      continue;
    }
    for (const g of result.groups) {
      usage.set(g.id, asOf);
      const history = fullHistory.get(g.id) ?? [];
      history.push(asOf);
      fullHistory.set(g.id, history);
    }
  }
  const totalMs = performance.now() - start;

  // Verify the cooldown property actually held for every reused group.
  let cooldownViolations = 0;
  fullHistory.forEach((dates) => {
    for (let i = 1; i < dates.length; i++) {
      const prev = dates[i - 1];
      const curr = dates[i];
      if (!prev || !curr) continue;
      if (daysBetween(prev, curr) < cooldownDays) cooldownViolations++;
    }
  });

  attemptCounts.sort((a, b) => a - b);
  durationsMs.sort((a, b) => a - b);

  console.log("\n--- results ---");
  console.log(`total wall time: ${totalMs.toFixed(1)}ms for ${days} picks (${(totalMs / days).toFixed(3)}ms/pick avg)`);
  console.log(`failures: ${failures}${firstFailureDay >= 0 ? ` (first at day ${firstFailureDay})` : ""}`);
  console.log(`cooldown violations: ${cooldownViolations} (should always be 0)`);
  console.log(`unique groups used at least once: ${fullHistory.size} / ${bankSize}`);
  console.log(
    `attempts per pick — min ${attemptCounts[0] ?? 0}, p50 ${percentile(attemptCounts, 0.5)}, p95 ${percentile(
      attemptCounts,
      0.95,
    )}, max ${attemptCounts[attemptCounts.length - 1] ?? 0}`,
  );
  console.log(
    `latency per pick — p50 ${percentile(durationsMs, 0.5).toFixed(3)}ms, p95 ${percentile(durationsMs, 0.95).toFixed(
      3,
    )}ms, max ${(durationsMs[durationsMs.length - 1] ?? 0).toFixed(3)}ms`,
  );
}

run();
