import { readFileSync } from 'node:fs';
import { join as pathJoin } from 'node:path';

import { and, db, desc, eq, gt, gte, inArray, lte, rhobhDailyPuzzles } from '@pontistudios/db';
import { z } from 'zod';

import { normalizeAnswer, REALITEA_ANSWER_LENGTH } from './realitea';
import {
  evaluateGuess,
  isGuessSolved,
  MAX_GUESSES,
  normalizeGuess,
  type PublicDailyPuzzle,
  type RealiteaGuessResult,
} from './realitea';
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
} from './realitea-daily-puzzle';
import { LabyrinthServerEnv } from './server/env';
import { isValidWord } from './word-list.server';

const SYSTEM_PROMPT = readFileSync(
  pathJoin(import.meta.dirname, './prompts/bravo-generation-system.md'),
  'utf-8',
);

const candidateSchema = z.object({
  answer: z.string().min(1),
  answerType: z.enum(['moment', 'object', 'person', 'phrase', 'place', 'storyline']),
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

function normalizePuzzleRecord(row: Record<string, unknown>): PuzzleRecord {
  const toArray = (v: unknown): string[] =>
    Array.isArray(v) ? (v as string[]) : JSON.parse(typeof v === 'string' ? v : '[]');
  return {
    ...(row as unknown as PuzzleRecord),
    dateKey: (row.dateUtc as string | null) ?? null,
    sourcePublishedAt: toArray(row.sourcePublishedAt),
    sourceSummary: toArray(row.sourceSummary),
    sourceTitles: toArray(row.sourceTitles),
    sourceUrls: toArray(row.sourceUrls),
  };
}

export async function getRecentAnswers(date: Date): Promise<Set<string>> {
  const cutoff = new Date(date);
  cutoff.setUTCDate(cutoff.getUTCDate() - BRAVO_REPEAT_WINDOW_DAYS);
  const cutoffDateValue = parseDate(getDateKey(cutoff))?.toISOString().slice(0, 10) ?? '';
  const rows = await db
    .select({ normalizedAnswer: rhobhDailyPuzzles.normalizedAnswer })
    .from(rhobhDailyPuzzles)
    .where(
      and(
        eq(rhobhDailyPuzzles.franchise, BRAVO_FRANCHISE),
        eq(rhobhDailyPuzzles.validationStatus, 'approved'),
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
        inArray(rhobhDailyPuzzles.status, ['published', 'scheduled']),
      ),
    );
  return new Set(rows.map((r) => r.normalizedAnswer));
}

async function markExpiredPuzzles(now: Date, tx: any = db): Promise<void> {
  await tx
    .update(rhobhDailyPuzzles)
    .set({ status: 'consumed', updatedAt: now })
    .where(
      and(
        eq(rhobhDailyPuzzles.franchise, BRAVO_FRANCHISE),
        eq(rhobhDailyPuzzles.status, 'published'),
        lte(rhobhDailyPuzzles.expireAt, now),
      ),
    );
}

export async function getPublishedPuzzle(now: Date, tx: any = db): Promise<PuzzleRecord | null> {
  const rows = await tx
    .select()
    .from(rhobhDailyPuzzles)
    .where(
      and(
        eq(rhobhDailyPuzzles.franchise, BRAVO_FRANCHISE),
        eq(rhobhDailyPuzzles.status, 'published'),
        lte(rhobhDailyPuzzles.publishAt, now),
        gt(rhobhDailyPuzzles.expireAt, now),
      ),
    )
    .orderBy(desc(rhobhDailyPuzzles.publishAt))
    .limit(1);
  const row = rows[0] as Record<string, unknown> | undefined;
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
        inArray(rhobhDailyPuzzles.status, ['published', 'scheduled']),
      ),
    )
    .orderBy(desc(rhobhDailyPuzzles.createdAt))
    .limit(1);
  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? normalizePuzzleRecord(row) : null;
}

async function callGenerationApi(
  dateKey: string,
  excludedAnswers: string[],
): Promise<Candidate | null> {
  const env = LabyrinthServerEnv.safeParse(process.env);
  if (!env.success) return null;

  const request = {
    model: env.data.openRouterModel,
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT.replaceAll('{{ANSWER_LENGTH}}', String(REALITEA_ANSWER_LENGTH)),
      },
      {
        role: 'user',
        content: JSON.stringify({
          dateKey,
          excludedAnswers,
          instructions:
            "Search bravotv.com/the-daily-dish for today's Bravo reality TV news, fetch article details, then generate puzzle candidates.",
        }),
      },
    ],
    max_tokens: 2000,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'generation_response',
        schema: z.toJSONSchema(generationResponseSchema),
        strict: true,
      },
    },
    tools: [
      {
        type: 'openrouter:web_search',
        parameters: {
          allowed_domains: [BRAVO_PRIMARY_SOURCE_DOMAIN],
          engine: 'auto',
          max_results: 10,
          max_total_results: 20,
          search_context_size: 'medium',
        },
      },
      {
        type: 'openrouter:web_fetch',
        parameters: {
          allowed_domains: [BRAVO_PRIMARY_SOURCE_DOMAIN],
          engine: 'openrouter',
          max_content_tokens: 4000,
          max_uses: 8,
        },
      },
    ],
  };

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.data.openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      console.warn('Generation API error', { dateKey, status: response.status });
      return null;
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return null;

    const cleanedContent = content.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    const parsed = generationResponseSchema.parse(JSON.parse(cleanedContent));
    const previousAnswers = new Set(excludedAnswers);

    for (const candidate of parsed.candidates) {
      const result = validateCandidate(candidate, previousAnswers);
      if (result.valid) return candidate;
      console.warn('Rejected candidate', { answer: candidate.answer, reasons: result.reasons });
    }

    return null;
  } catch (err) {
    console.error('Generation failed', { dateKey, err });
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
      console.warn('Generation attempt failed', { attempt: attempt + 1, dateKey });
    }
  }

  if (!candidate) {
    console.warn('Puzzle generation failed after all attempts', { dateKey });
    return null;
  }

  const window = getPuzzleWindow(date);
  const now = new Date();
  const detailFromSummary =
    candidate.sourceSummary && candidate.sourceSummary.length > 0
      ? candidate.sourceSummary.join(' ')
      : candidate.detail;
  const dateValue = parseDate(window.dateKey)?.toISOString().slice(0, 10) ?? window.dateKey;
  console.log('generateScheduledPuzzle INSERT START', { dateKey, answer: candidate.answer });
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
      generationStatus: 'published',
      newsMode: 'current',
      normalizedAnswer: normalizeAnswer(candidate.answer),
      publishAt: window.publishAt,
      role: '',
      scheduledForDateKey: window.dateKey,
      sourceKind: 'current',
      sourcePublishedAt: candidate.sourcePublishedAt ?? [],
      sourceSummary: candidate.sourceSummary ?? [],
      sourceTitles: candidate.sourceTitles ?? [],
      sourceUrls: candidate.sourceUrls,
      status: 'scheduled',
      updatedAt: now,
      validationStatus: 'approved',
    })
    .returning();

  console.log('generateScheduledPuzzle INSERT DONE', { dateKey, id: inserted[0]?.id });
  return normalizePuzzleRecord(inserted[0] as Record<string, unknown>);
}

export async function promoteScheduledPuzzle(now: Date): Promise<PuzzleRecord | null> {
  const window = getPuzzleWindow(now);

  return db.transaction(async (tx) => {
    await markExpiredPuzzles(now, tx);

    const active = await getPublishedPuzzle(now, tx);
    if (active) return active;

    const rows = await tx
      .select()
      .from(rhobhDailyPuzzles)
      .where(
        and(
          eq(rhobhDailyPuzzles.franchise, BRAVO_FRANCHISE),
          eq(rhobhDailyPuzzles.status, 'scheduled'),
          eq(rhobhDailyPuzzles.scheduledForDateKey, window.dateKey),
        ),
      )
      .orderBy(desc(rhobhDailyPuzzles.createdAt))
      .limit(1);

    const scheduled = rows[0] as Record<string, unknown> | undefined;
    if (!scheduled?.id) return null;

    const dateValue = parseDate(window.dateKey)?.toISOString().slice(0, 10) ?? null;
    const updated = await tx
      .update(rhobhDailyPuzzles)
      .set({
        dateUtc: dateValue,
        expireAt: window.expireAt,
        publishAt: window.publishAt,
        status: 'published',
        updatedAt: now,
      })
      .where(eq(rhobhDailyPuzzles.id, Number(scheduled.id)))
      .returning();

    return normalizePuzzleRecord(updated[0] as Record<string, unknown>);
  });
}

function toDailyPuzzle(record: PuzzleRecord): DailyPuzzle {
  return {
    answer: record.answer,
    answerType: record.answerType,
    clue: record.clue,
    dateKey: record.scheduledForDateKey ?? record.dateKey ?? '',
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
    answerLength: normalizeAnswer(record.answer).length,
    answerType: record.answerType,
    clue: record.clue,
    dateKey: record.scheduledForDateKey ?? record.dateKey ?? '',
    detail: record.detail,
    role: record.role,
    sourceUrls: record.sourceUrls,
  };
}

export async function loadActivePublicPuzzle(
  now: Date,
): Promise<{ puzzle: PublicDailyPuzzle } | null> {
  await markExpiredPuzzles(now);
  const published = (await getPublishedPuzzle(now)) ?? (await promoteScheduledPuzzle(now));
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
        inArray(rhobhDailyPuzzles.status, ['published', 'scheduled']),
      ),
    )
    .orderBy(desc(rhobhDailyPuzzles.createdAt))
    .limit(1);
  const row = rows[0] as Record<string, unknown> | undefined;
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
    return { valid: false, word, reason: 'wrong-length' };
  }

  if (previousGuesses.some((guess) => guess.word === word)) {
    return { valid: false, word, reason: 'already-guessed' };
  }

  const puzzle = await loadPuzzleRecordByDateKey(dateKey);
  if (!puzzle) {
    return { valid: false, word, reason: 'not-in-word-list' };
  }

  const inWordList = await isValidWord(word);
  if (!inWordList) {
    return { valid: false, word, reason: 'not-in-word-list' };
  }

  const states = evaluateGuess(puzzle.answer, word);
  const isSolved = isGuessSolved({ word, states });
  const guessCount = previousGuesses.length + 1;
  const isGameOver = isSolved || guessCount >= MAX_GUESSES;
  const status: RealiteaGuessResult['status'] = isSolved
    ? 'solved'
    : guessCount >= MAX_GUESSES
      ? 'failed'
      : 'playing';

  return { valid: true, word, states, isSolved, isGameOver, status };
}
