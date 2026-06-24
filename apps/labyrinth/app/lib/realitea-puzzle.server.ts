import { readFileSync } from "node:fs";
import { join as pathJoin } from "node:path";

import { createOpenRouterClient } from "@pontistudios/ai";
import {
  and,
  db,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lte,
  rhobhDailyPuzzles,
  type RhobhDailyPuzzle,
} from "@pontistudios/db";
import { z } from "zod";

import { normalizeAnswer, REALITEA_ANSWER_LENGTH } from "./realitea";
import {
  evaluateGuess,
  isGuessSolved,
  MAX_GUESSES,
  normalizeGuess,
  type PublicDailyPuzzle,
  type RealiteaGuessResult,
} from "./realitea";
import {
  BRAVO_FRANCHISE,
  BRAVO_PRIMARY_SOURCE_DOMAIN,
  BRAVO_REPEAT_WINDOW_DAYS,
  getDateKey,
  getPuzzleWindow,
  parseDate,
  validateCandidate,
  type DailyPuzzle,
  type PuzzleRecord,
} from "./realitea-puzzle";
import { LabyrinthServerEnv } from "./server/env";
import { isValidWord } from "./word-list.server";

/**
 * Transaction-or-database handle. The `db.transaction` callback receives a
 * `PostgresJsTransaction` instance that exposes the same query API as `db`,
 * so functions that may run inside or outside a transaction accept either.
 *
 * The structural type below captures the only methods the puzzle functions
 * actually call (`select` / `update` / `insert`). This is intentionally
 * narrower than the full Drizzle type so a default `db` and a `tx` argument
 * are interchangeable at the call sites we care about.
 */
type PuzzleDatabase = {
  select: typeof db.select;
  update: typeof db.update;
  insert: typeof db.insert;
};

const SYSTEM_PROMPT = readFileSync(
  pathJoin(import.meta.dirname, "./prompts/bravo-generation-system.md"),
  "utf-8",
);

const candidateSchema = z.object({
  answer: z.string().min(1),
  answerType: z.enum(["moment", "object", "person", "phrase", "place", "storyline"]),
  clue: z.string().min(1),
  detail: z.string().min(1),
  sourceUrls: z.array(z.string()),
  sourceSummary: z.array(z.string()).optional(),
  sourceTitles: z.array(z.string()).optional(),
  sourcePublishedAt: z.array(z.string()).optional(),
});

const generationResponseSchema = z.object({
  candidates: z.array(candidateSchema).min(1).max(5),
});

type Candidate = z.infer<typeof candidateSchema>;

/**
 * Drizzle's `select().from(table)` returns the row typed as
 * `RhobhDailyPuzzle` (from `$inferSelect`), but the `jsonb` columns come back
 * loosely typed. This function widens to `Record<string, unknown>` and applies
 * the post-DB normalizations we need (jsonb → string[]; `dateUtc` → `dateKey`).
 */
function normalizePuzzleRecord(row: RhobhDailyPuzzle): PuzzleRecord {
  const loose = row as unknown as Record<string, unknown>;
  const toArray = (v: unknown): string[] =>
    Array.isArray(v) ? (v as string[]) : JSON.parse(typeof v === "string" ? v : "[]");
  return {
    ...(row as unknown as PuzzleRecord),
    dateKey: (loose.dateUtc as string | null) ?? null,
    sourcePublishedAt: toArray(loose.sourcePublishedAt),
    sourceSummary: toArray(loose.sourceSummary),
    sourceTitles: toArray(loose.sourceTitles),
    sourceUrls: toArray(loose.sourceUrls),
  };
}

export async function getRecentAnswers(date: Date): Promise<Set<string>> {
  const cutoff = new Date(date);
  cutoff.setUTCDate(cutoff.getUTCDate() - BRAVO_REPEAT_WINDOW_DAYS);
  const cutoffDateValue = parseDate(getDateKey(cutoff))?.toISOString().slice(0, 10) ?? "";
  const rows = await db
    .select({ normalizedAnswer: rhobhDailyPuzzles.normalizedAnswer })
    .from(rhobhDailyPuzzles)
    .where(
      and(
        eq(rhobhDailyPuzzles.franchise, BRAVO_FRANCHISE),
        eq(rhobhDailyPuzzles.validationStatus, "approved"),
        gte(rhobhDailyPuzzles.dateUtc, cutoffDateValue),
      ),
    );
  return new Set(rows.map((r) => r.normalizedAnswer));
}

async function getInventoryAnswers(): Promise<Set<string>> {
  const rows = await db
    .select({ normalizedAnswer: rhobhDailyPuzzles.normalizedAnswer })
    .from(rhobhDailyPuzzles)
    .where(
      and(
        eq(rhobhDailyPuzzles.franchise, BRAVO_FRANCHISE),
        inArray(rhobhDailyPuzzles.status, ["published", "scheduled"]),
      ),
    );
  return new Set(rows.map((r) => r.normalizedAnswer));
}

async function markExpiredPuzzles(now: Date, tx: PuzzleDatabase = db): Promise<void> {
  await tx
    .update(rhobhDailyPuzzles)
    .set({ status: "consumed", updatedAt: now })
    .where(
      and(
        eq(rhobhDailyPuzzles.franchise, BRAVO_FRANCHISE),
        eq(rhobhDailyPuzzles.status, "published"),
        lte(rhobhDailyPuzzles.expireAt, now),
      ),
    );
}

export async function getPublishedPuzzle(
  now: Date,
  tx: PuzzleDatabase = db,
): Promise<PuzzleRecord | null> {
  const rows = await tx
    .select()
    .from(rhobhDailyPuzzles)
    .where(
      and(
        eq(rhobhDailyPuzzles.franchise, BRAVO_FRANCHISE),
        eq(rhobhDailyPuzzles.status, "published"),
        lte(rhobhDailyPuzzles.publishAt, now),
        gt(rhobhDailyPuzzles.expireAt, now),
      ),
    )
    .orderBy(desc(rhobhDailyPuzzles.publishAt))
    .limit(1);
  const row = rows[0];
  return row ? normalizePuzzleRecord(row) : null;
}

export async function loadScheduledPuzzle(dateKey: string): Promise<PuzzleRecord | null> {
  const rows = await db
    .select()
    .from(rhobhDailyPuzzles)
    .where(
      and(
        eq(rhobhDailyPuzzles.franchise, BRAVO_FRANCHISE),
        eq(rhobhDailyPuzzles.scheduledForDateKey, dateKey),
        inArray(rhobhDailyPuzzles.status, ["published", "scheduled"]),
      ),
    )
    .orderBy(desc(rhobhDailyPuzzles.createdAt))
    .limit(1);
  const row = rows[0];
  return row ? normalizePuzzleRecord(row) : null;
}

async function callGenerationApi(
  dateKey: string,
  excludedAnswers: string[],
): Promise<Candidate | null> {
  const env = LabyrinthServerEnv.safeParse(process.env);
  if (!env.success) return null;

  try {
    const client = createOpenRouterClient();

    const response = await client.chat.send({
      chatRequest: {
        model: env.data.openRouterModel,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT.replaceAll("{{ANSWER_LENGTH}}", String(REALITEA_ANSWER_LENGTH)),
          },
          {
            role: "user",
            content: JSON.stringify({
              dateKey,
              excludedAnswers,
              instructions:
                "Search bravotv.com/the-daily-dish for today's Bravo reality TV news, fetch article details, then generate puzzle candidates.",
            }),
          },
        ],
        maxTokens: 2000,
        responseFormat: {
          type: "json_schema",
          jsonSchema: {
            name: "generation_response",
            schema: z.toJSONSchema(generationResponseSchema),
            strict: true,
          },
        },
        tools: [
          {
            type: "openrouter:web_search",
            parameters: {
              allowedDomains: [BRAVO_PRIMARY_SOURCE_DOMAIN],
              engine: "auto",
              maxResults: 10,
              maxTotalResults: 20,
              searchContextSize: "medium",
            },
          },
          {
            type: "openrouter:web_fetch",
            parameters: {
              allowedDomains: [BRAVO_PRIMARY_SOURCE_DOMAIN],
              engine: "openrouter",
              maxContentTokens: 4000,
              maxUses: 8,
            },
          },
        ],
      },
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") return null;

    const cleanedContent = content.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const parsed = generationResponseSchema.parse(JSON.parse(cleanedContent));
    const previousAnswers = new Set(excludedAnswers);

    for (const candidate of parsed.candidates) {
      const result = validateCandidate(candidate, previousAnswers);
      if (result.valid) return candidate;
      console.warn("Rejected candidate", { answer: candidate.answer, reasons: result.reasons });
    }

    return null;
  } catch (err) {
    console.error("Generation failed", { dateKey, err });
    return null;
  }
}

export async function generateScheduledPuzzle(dateKey: string): Promise<PuzzleRecord | null> {
  const existing = await loadScheduledPuzzle(dateKey);
  if (existing) return existing;

  const date = parseDate(dateKey);
  if (!date) throw new Error(`Invalid date key: ${dateKey}`);

  const [recentAnswers, inventoryAnswers] = await Promise.all([
    getRecentAnswers(date),
    getInventoryAnswers(),
  ]);
  const excludedAnswers = [...new Set([...recentAnswers, ...inventoryAnswers])];

  let candidate: Candidate | null = null;
  for (let attempt = 0; attempt < 3 && !candidate; attempt++) {
    candidate = await callGenerationApi(dateKey, excludedAnswers);
    if (!candidate) {
      console.warn("Generation attempt failed", { attempt: attempt + 1, dateKey });
    }
  }

  if (!candidate) {
    console.warn("Puzzle generation failed after all attempts", { dateKey });
    return null;
  }

  const window = getPuzzleWindow(date);
  const now = new Date();
  const detailFromSummary =
    candidate.sourceSummary && candidate.sourceSummary.length > 0
      ? candidate.sourceSummary.join(" ")
      : candidate.detail;
  const dateValue = parseDate(window.dateKey)?.toISOString().slice(0, 10) ?? window.dateKey;
  console.log("generateScheduledPuzzle INSERT START", { dateKey, answer: candidate.answer });
  const inserted = await db
    .insert(rhobhDailyPuzzles)
    .values({
      answer: candidate.answer,
      answerType: candidate.answerType,
      clue: candidate.clue,
      createdAt: now,
      dateUtc: dateValue,
      detail: detailFromSummary,
      expireAt: window.expireAt,
      franchise: BRAVO_FRANCHISE,
      generationBatchId: null,
      generationStatus: "published",
      newsMode: "current",
      normalizedAnswer: normalizeAnswer(candidate.answer),
      publishAt: window.publishAt,
      role: "",
      scheduledForDateKey: window.dateKey,
      sourceKind: "current",
      sourcePublishedAt: candidate.sourcePublishedAt ?? [],
      sourceSummary: candidate.sourceSummary ?? [],
      sourceTitles: candidate.sourceTitles ?? [],
      sourceUrls: candidate.sourceUrls,
      status: "scheduled",
      updatedAt: now,
      validationStatus: "approved",
    })
    .returning();

  console.log("generateScheduledPuzzle INSERT DONE", { dateKey, id: inserted[0]?.id });
  return normalizePuzzleRecord(inserted[0] as RhobhDailyPuzzle);
}

export async function promoteScheduledPuzzle(now: Date): Promise<PuzzleRecord | null> {
  const window = getPuzzleWindow(now);

  return db.transaction(async (tx) => {
    await markExpiredPuzzles(now, tx);

    const active = await getPublishedPuzzle(now, tx);
    if (active) return active;

    let rows = await tx
      .select()
      .from(rhobhDailyPuzzles)
      .where(
        and(
          eq(rhobhDailyPuzzles.franchise, BRAVO_FRANCHISE),
          eq(rhobhDailyPuzzles.status, "scheduled"),
          eq(rhobhDailyPuzzles.scheduledForDateKey, window.dateKey),
        ),
      )
      .orderBy(desc(rhobhDailyPuzzles.createdAt))
      .limit(1);

    let scheduled = rows[0];

    // Fallback: if no scheduled puzzle for today, find the most recent one
    if (!scheduled) {
      rows = await tx
        .select()
        .from(rhobhDailyPuzzles)
        .where(
          and(
            eq(rhobhDailyPuzzles.franchise, BRAVO_FRANCHISE),
            eq(rhobhDailyPuzzles.status, "scheduled"),
          ),
        )
        .orderBy(desc(rhobhDailyPuzzles.createdAt))
        .limit(1);
      scheduled = rows[0];
    }

    if (!scheduled?.id) return null;

    const dateValue = parseDate(window.dateKey)?.toISOString().slice(0, 10) ?? null;
    const updated = await tx
      .update(rhobhDailyPuzzles)
      .set({
        dateUtc: dateValue,
        expireAt: window.expireAt,
        publishAt: window.publishAt,
        status: "published",
        updatedAt: now,
      })
      .where(eq(rhobhDailyPuzzles.id, Number(scheduled.id)))
      .returning();

    return normalizePuzzleRecord(updated[0] as RhobhDailyPuzzle);
  });
}

function toDailyPuzzle(record: PuzzleRecord): DailyPuzzle {
  return {
    answer: record.answer,
    answerType: record.answerType,
    clue: record.clue,
    dateKey: record.scheduledForDateKey ?? record.dateKey ?? "",
    detail: record.detail,
    role: record.role,
    sourceUrls: record.sourceUrls,
  };
}

export async function loadActivePuzzle(now: Date): Promise<{ puzzle: DailyPuzzle } | null> {
  await markExpiredPuzzles(now);
  const published = (await getPublishedPuzzle(now)) ?? (await promoteScheduledPuzzle(now));
  if (!published) return null;
  return { puzzle: toDailyPuzzle(published) };
}

export async function getStoredAnswersForValidation(): Promise<Set<string>> {
  const rows = await db
    .select({ normalizedAnswer: rhobhDailyPuzzles.normalizedAnswer })
    .from(rhobhDailyPuzzles)
    .where(eq(rhobhDailyPuzzles.franchise, BRAVO_FRANCHISE));
  return new Set(rows.map((r) => r.normalizedAnswer));
}

function toPublicDailyPuzzle(record: PuzzleRecord): PublicDailyPuzzle {
  return {
    answerType: record.answerType,
    clue: record.clue,
    dateKey: record.scheduledForDateKey ?? record.dateKey ?? "",
    detail: record.detail,
    role: record.role,
    sourceUrls: record.sourceUrls,
  };
}

export async function loadActivePublicPuzzle(
  now: Date,
): Promise<{ puzzle: PublicDailyPuzzle } | null> {
  await markExpiredPuzzles(now);
  let published = (await getPublishedPuzzle(now)) ?? (await promoteScheduledPuzzle(now));

  // Fallback: if still no puzzle, find the most recent published one regardless of time
  if (!published) {
    const rows = await db
      .select()
      .from(rhobhDailyPuzzles)
      .where(
        and(
          eq(rhobhDailyPuzzles.franchise, BRAVO_FRANCHISE),
          eq(rhobhDailyPuzzles.status, "published"),
        ),
      )
      .orderBy(desc(rhobhDailyPuzzles.publishAt))
      .limit(1);
    const row = rows[0];
    if (row) published = normalizePuzzleRecord(row);
  }

  if (!published) return null;
  return { puzzle: toPublicDailyPuzzle(published) };
}

export async function loadPuzzleRecordByDateKey(dateKey: string): Promise<PuzzleRecord | null> {
  const window = getPuzzleWindow(parseDate(dateKey) ?? new Date());
  const rows = await db
    .select()
    .from(rhobhDailyPuzzles)
    .where(
      and(
        eq(rhobhDailyPuzzles.franchise, BRAVO_FRANCHISE),
        eq(rhobhDailyPuzzles.scheduledForDateKey, window.dateKey),
        inArray(rhobhDailyPuzzles.status, ["published", "scheduled"]),
      ),
    )
    .orderBy(desc(rhobhDailyPuzzles.createdAt))
    .limit(1);
  const row = rows[0];
  return row ? normalizePuzzleRecord(row) : null;
}

/**
 * Server-evaluates a guess. The answer never leaves the server: callers receive
 * per-letter states and the post-guess status only.
 */
export async function evaluateGuessServer(
  dateKey: string,
  rawWord: string,
  previousGuesses: readonly { word: string }[],
): Promise<RealiteaGuessResult> {
  const word = normalizeGuess(rawWord);

  if (word.length !== REALITEA_ANSWER_LENGTH) {
    return { valid: false, word, reason: "wrong-length" };
  }

  if (previousGuesses.some((guess) => guess.word === word)) {
    return { valid: false, word, reason: "already-guessed" };
  }

  const puzzle = await loadPuzzleRecordByDateKey(dateKey);
  if (!puzzle) {
    return { valid: false, word, reason: "not-in-word-list" };
  }

  const inWordList = await isValidWord(word);
  if (!inWordList) {
    return { valid: false, word, reason: "not-in-word-list" };
  }

  const states = evaluateGuess(puzzle.answer, word);
  const isSolved = isGuessSolved({ word, states });
  const guessCount = previousGuesses.length + 1;
  const isGameOver = isSolved || guessCount >= MAX_GUESSES;
  const status: RealiteaGuessResult["status"] = isSolved
    ? "solved"
    : guessCount >= MAX_GUESSES
      ? "failed"
      : "playing";

  return { valid: true, word, states, isSolved, isGameOver, status };
}
