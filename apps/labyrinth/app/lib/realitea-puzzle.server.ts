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
import pino from "pino";
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
  addDaysToDateKey,
  getDateKey,
  getPuzzleWindow,
  parseDate,
  validateCandidate,
  type PuzzleRecord,
} from "./realitea-puzzle";
import { LabyrinthServerEnv } from "./server/env";
import { isValidWord } from "./word-list.server";

const logger = pino(
  process.env.NODE_ENV === "development"
    ? { transport: { target: "pino-pretty" } }
    : { level: process.env.NODE_ENV === "test" ? "silent" : "info" },
);

/**
 * Transaction-or-database handle. The `db.transaction` callback receives a
 * `PostgresJsTransaction` instance that exposes the same query API as `db`,
 * so functions that may run inside or outside a transaction accept either.
 */
type PuzzleDatabase = {
  select: typeof db.select;
  update: typeof db.update;
  insert: typeof db.insert;
  query: typeof db.query;
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
    .where(inArray(rhobhDailyPuzzles.status, ["published", "scheduled"]));
  return new Set(rows.map((r) => r.normalizedAnswer));
}

async function markExpiredPuzzles(now: Date, tx: PuzzleDatabase = db): Promise<void> {
  await tx
    .update(rhobhDailyPuzzles)
    .set({ status: "consumed", updatedAt: now })
    .where(and(eq(rhobhDailyPuzzles.status, "published"), lte(rhobhDailyPuzzles.expireAt, now)));
}

export async function getPublishedPuzzle(
  now: Date,
  tx: PuzzleDatabase = db,
): Promise<PuzzleRecord | null> {
  const childLogger = logger.child({
    operation: "getPublishedPuzzle",
    timestamp: now.toISOString(),
  });

  const row = await tx.query.rhobhDailyPuzzles.findFirst({
    where: and(
      eq(rhobhDailyPuzzles.status, "published"),
      lte(rhobhDailyPuzzles.publishAt, now),
      gt(rhobhDailyPuzzles.expireAt, now),
    ),
    orderBy: desc(rhobhDailyPuzzles.publishAt),
  });

  if (row) {
    childLogger.info({ event: "[PUZZLE_AVAILABLE]", puzzle_id: row.id }, "published puzzle found");
  } else {
    childLogger.debug({ event: "[NO_PUBLISHED_PUZZLE]" }, "no published puzzle in current window");
  }

  return row ? normalizePuzzleRecord(row) : null;
}

export async function loadScheduledPuzzle(dateKey: string): Promise<PuzzleRecord | null> {
  const row = await db.query.rhobhDailyPuzzles.findFirst({
    where: and(
      eq(rhobhDailyPuzzles.scheduledForDateKey, dateKey),
      inArray(rhobhDailyPuzzles.status, ["published", "scheduled"]),
    ),
    orderBy: desc(rhobhDailyPuzzles.createdAt),
  });
  return row ? normalizePuzzleRecord(row) : null;
}

async function callGenerationApi(
  dateKey: string,
  excludedAnswers: string[],
): Promise<Candidate | null> {
  const childLogger = logger.child({ operation: "callGenerationApi", dateKey });
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
      childLogger.warn(
        {
          event: "[GENERATION_CANDIDATE_REJECTED]",
          answer: candidate.answer,
          reasons: result.reasons,
        },
        "candidate rejected",
      );
    }

    return null;
  } catch (err) {
    childLogger.error(
      { event: "[GENERATION_API_ERROR]", error: err instanceof Error ? err.message : String(err) },
      "generation API call failed",
    );
    return null;
  }
}

export async function generateScheduledPuzzle(dateKey: string): Promise<PuzzleRecord | null> {
  const childLogger = logger.child({ operation: "generateScheduledPuzzle", dateKey });

  const existing = await loadScheduledPuzzle(dateKey);
  if (existing) {
    childLogger.debug(
      { event: "[SKIP_GENERATION_EXISTS]", puzzle_id: existing.id },
      "puzzle already exists for date",
    );
    return existing;
  }

  const date = parseDate(dateKey);
  if (!date) {
    childLogger.error({ event: "[ERROR_INVALID_DATEKEY]", input: dateKey }, "invalid date key");
    throw new Error(`Invalid date key: ${dateKey}`);
  }

  const [recentAnswers, inventoryAnswers] = await Promise.all([
    getRecentAnswers(date),
    getInventoryAnswers(),
  ]);
  const excludedAnswers = [...new Set([...recentAnswers, ...inventoryAnswers])];

  let candidate: Candidate | null = null;
  for (let attempt = 0; attempt < 3 && !candidate; attempt++) {
    candidate = await callGenerationApi(dateKey, excludedAnswers);
    if (!candidate) {
      childLogger.warn(
        { event: "[GENERATION_RETRY]", attempt: attempt + 1 },
        "generation attempt yielded no valid candidate",
      );
      if (attempt < 2) {
        const delayMs = Math.pow(2, attempt) * 1000;
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }

  if (!candidate) {
    childLogger.error(
      { event: "[GENERATION_EXHAUSTED]" },
      "puzzle generation failed after all attempts",
    );
    return null;
  }

  const window = getPuzzleWindow(date);
  const now = new Date();
  const detailFromSummary =
    candidate.sourceSummary && candidate.sourceSummary.length > 0
      ? candidate.sourceSummary.join(" ")
      : candidate.detail;
  const dateValue = parseDate(window.dateKey)?.toISOString().slice(0, 10) ?? window.dateKey;

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
      normalizedAnswer: normalizeAnswer(candidate.answer),
      publishAt: window.publishAt,
      role: "",
      scheduledForDateKey: window.dateKey,
      sourcePublishedAt: candidate.sourcePublishedAt ?? [],
      sourceSummary: candidate.sourceSummary ?? [],
      sourceTitles: candidate.sourceTitles ?? [],
      sourceUrls: candidate.sourceUrls,
      status: "scheduled",
      updatedAt: now,
      validationStatus: "approved",
    })
    .returning();

  childLogger.info(
    { event: "[PUZZLE_GENERATED]", puzzle_id: inserted[0]?.id, answer: candidate.answer },
    "puzzle generated and scheduled",
  );
  return normalizePuzzleRecord(inserted[0] as RhobhDailyPuzzle);
}

export async function promoteScheduledPuzzle(now: Date): Promise<PuzzleRecord | null> {
  const window = getPuzzleWindow(now);
  const childLogger = logger.child({
    operation: "promoteScheduledPuzzle",
    dateKey: window.dateKey,
    timestamp: now.toISOString(),
  });

  return db.transaction(async (tx) => {
    await markExpiredPuzzles(now, tx as unknown as PuzzleDatabase);

    const active = await getPublishedPuzzle(now, tx as unknown as PuzzleDatabase);
    if (active) {
      childLogger.debug(
        { event: "[SKIP_PROMOTION_PUBLISHED]", puzzle_id: active.id },
        "puzzle already published",
      );
      return active;
    }

    // Attempt 1: find scheduled for today's dateKey
    let scheduled = await (tx as unknown as PuzzleDatabase).query.rhobhDailyPuzzles.findFirst({
      where: and(
        eq(rhobhDailyPuzzles.status, "scheduled"),
        eq(rhobhDailyPuzzles.scheduledForDateKey, window.dateKey),
      ),
      orderBy: desc(rhobhDailyPuzzles.createdAt),
    });

    // Fallback: any recent scheduled puzzle
    if (!scheduled) {
      childLogger.debug(
        { event: "[SKIP_PROMOTION_NO_SCHEDULED]" },
        "no scheduled puzzle for today",
      );
      scheduled = await (tx as unknown as PuzzleDatabase).query.rhobhDailyPuzzles.findFirst({
        where: eq(rhobhDailyPuzzles.status, "scheduled"),
        orderBy: desc(rhobhDailyPuzzles.createdAt),
      });
      if (scheduled) {
        childLogger.warn(
          {
            event: "[FALLBACK_ACTIVATED_SCHEDULED_ANY]",
            puzzle_id: scheduled.id,
            intended_dateKey: window.dateKey,
            fallback_dateKey: scheduled.scheduledForDateKey,
          },
          "promoting most-recent scheduled puzzle as fallback",
        );
      }
    }

    if (!scheduled?.id) {
      childLogger.error({ event: "[ERROR_NO_SCHEDULED_PUZZLE]" }, "no scheduled puzzle found");
      return null;
    }

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

    childLogger.info(
      {
        event: "[PUZZLE_PROMOTED]",
        puzzle_id: scheduled.id,
        source_dateKey: scheduled.scheduledForDateKey,
      },
      "scheduled puzzle promoted to published",
    );
    return normalizePuzzleRecord(updated[0] as RhobhDailyPuzzle);
  });
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
  const window = getPuzzleWindow(now);
  const childLogger = logger.child({
    operation: "loadActivePublicPuzzle",
    dateKey: window.dateKey,
    timestamp: now.toISOString(),
  });

  await markExpiredPuzzles(now);
  let published = (await getPublishedPuzzle(now)) ?? (await promoteScheduledPuzzle(now));

  // Last-resort fallback: serve the most-recently published puzzle regardless of window
  if (!published) {
    const row = await db.query.rhobhDailyPuzzles.findFirst({
      where: eq(rhobhDailyPuzzles.status, "published"),
      orderBy: desc(rhobhDailyPuzzles.publishAt),
    });
    if (row) {
      published = normalizePuzzleRecord(row);
      childLogger.warn(
        {
          event: "[FALLBACK_ACTIVATED_PUBLISHED_ANY]",
          puzzle_id: published.id,
          intended_dateKey: window.dateKey,
          served_dateKey: published.scheduledForDateKey,
        },
        "no current puzzle; serving archived puzzle as fallback",
      );
    }
  }

  if (!published) {
    childLogger.error(
      { event: "[ERROR_NO_PUZZLE_AVAILABLE]" },
      "all fallbacks exhausted — no puzzle available",
    );
    return null;
  }

  childLogger.info(
    {
      event: "[PUZZLE_AVAILABLE]",
      puzzle_id: published.id,
      dateKey: published.scheduledForDateKey,
    },
    "active puzzle loaded",
  );
  return { puzzle: toPublicDailyPuzzle(published) };
}

export async function loadPuzzleRecordByDateKey(dateKey: string): Promise<PuzzleRecord | null> {
  const window = getPuzzleWindow(parseDate(dateKey) ?? new Date());
  const row = await db.query.rhobhDailyPuzzles.findFirst({
    where: and(
      eq(rhobhDailyPuzzles.scheduledForDateKey, window.dateKey),
      inArray(rhobhDailyPuzzles.status, ["published", "scheduled"]),
    ),
    orderBy: desc(rhobhDailyPuzzles.createdAt),
  });
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
  const childLogger = logger.child({ operation: "evaluateGuessServer", requestedDateKey: dateKey });
  const word = normalizeGuess(rawWord);

  if (word.length !== REALITEA_ANSWER_LENGTH) {
    return { valid: false, word, reason: "wrong-length" };
  }

  if (previousGuesses.some((guess) => guess.word === word)) {
    return { valid: false, word, reason: "already-guessed" };
  }

  // Try exact dateKey, then previous day as grace period for midnight-rollover games
  let puzzle = await loadPuzzleRecordByDateKey(dateKey);
  if (!puzzle) {
    const prevDateKey = addDaysToDateKey(dateKey, -1);
    if (prevDateKey) {
      puzzle = await loadPuzzleRecordByDateKey(prevDateKey);
      if (puzzle) {
        childLogger.info(
          { event: "[GUESS_GRACE_PERIOD_ACCEPTED]", acceptedDateKey: prevDateKey, word },
          "guess accepted via previous-day grace period",
        );
      }
    }
  }

  if (!puzzle) {
    childLogger.warn({ event: "[GUESS_PUZZLE_NOT_FOUND]", word }, "no puzzle found for dateKey");
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
