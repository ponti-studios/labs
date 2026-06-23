import archiveMoments from "../data/rhobh-archive-moments.json";

import {
  and,
  asc,
  count,
  db,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lte,
  rhobhDailyPuzzles,
} from "@pontistudios/db";
import { z } from "zod";

import { normalizeAnswer, REALITEA_ANSWER_LENGTH } from "./realitea";
import {
  getAllowedSourceDomain,
  getDateKey,
  getPuzzleWindow,
  mapRecordToStoredPuzzle,
  parseDate,
  parseStringArray,
  RHOBH_ANSWER_LENGTH,
  RHOBH_FRANCHISE,
  RHOBH_PRIMARY_SOURCE_DOMAIN,
  RHOBH_REPEAT_WINDOW_DAYS,
  sourceItemListSchema,
  validateCandidate,
  type GeneratedCandidate,
  type InventoryStatus,
  type PuzzleEnvelope,
  type PuzzleRecord,
  type PuzzleSourceKind,
  type SourceItem,
} from "./realitea-daily-puzzle";
import { LabyrinthServerEnv } from "./server/env";
import { writeLlmAnalyticsRecord } from "./server/llm-analytics";
import { readFileSync } from "node:fs";

interface GenerationDependencies {
  generationBatchId?: string;
  now?: Date;
  sourceCollectionNow?: Date;
}

const SYSTEM_PROMPT = readFileSync("./prompts/rhobh-generation-system.md", "utf-8");

const RHOBH_CURRENT_SOURCE_QUERIES = [
  {
    domain: RHOBH_PRIMARY_SOURCE_DOMAIN,
    query: "site:bravotv.com/the-daily-dish",
  },
  { domain: "people.com", query: "site:people.com" },
  { domain: "ew.com", query: "site:ew.com" },
  { domain: "eonline.com", query: "site:eonline.com" },
  { domain: "usmagazine.com", query: "site:usmagazine.com" },
] as const;
const RHOBH_SOURCE_COLLECTION_MAX_ITEMS = 5;
const RHOBH_SOURCE_COLLECTION_MAX_TOKENS = 1200;
const RHOBH_GENERATION_MAX_TOKENS = 1200;

const realiteaCandidateSchema = z.object({
  answer: z
    .string()
    .min(1)
    .meta({
      description: `The RHOBH answer to guess. It must normalize to exactly ${REALITEA_ANSWER_LENGTH} letters.`,
    }),
  answerType: z
    .enum(["moment", "object", "person", "phrase", "place", "storyline"])
    .meta({ description: "The answer taxonomy." }),
  clue: z.string().min(1).meta({ description: "A non-spoiler clue for the final guess only." }),
  detail: z
    .string()
    .min(1)
    .meta({ description: "A spoiler-safe explanation shown after the game ends." }),
  newsMode: z
    .enum(["current"])
    .meta({ description: "Scheduled puzzles must come from fresh RHOBH news." }),
  rationale: z.string().min(1).meta({ description: "Why this puzzle is a strong pick today." }),
  role: z.string().min(1).meta({ description: "Short descriptive label for the answer." }),
  sourceUrls: z.array(z.string()).meta({ description: "Source URLs supporting the candidate." }),
  sourceTitles: z.array(z.string()).meta({ description: "Titles matching the source URLs." }),
  sourcePublishedAt: z
    .array(z.string())
    .meta({ description: "Publication timestamps matching the source URLs." }),
  sourceSummary: z
    .array(z.string())
    .meta({ description: "Short summaries matching the source URLs." }),
});

const rhobhGenerationCandidatesSchema = z.array(realiteaCandidateSchema).min(3).max(5);
const rhobhGenerationResponseSchema = z.object({
  candidates: rhobhGenerationCandidatesSchema,
});
const sourceCollectionResponseSchema = {
  type: "array",
  maxItems: 10,
  items: {
    type: "object",
    additionalProperties: false,
    required: ["publishedAt", "summary", "title", "url"],
    properties: {
      domain: { type: "string", minLength: 1 },
      publishedAt: { type: "string", minLength: 1 },
      source: { type: "string", minLength: 1 },
      summary: { type: "string", minLength: 1 },
      title: { type: "string", minLength: 1 },
      url: { type: "string", format: "uri" },
    },
  },
} as const;

export function buildGenerationBatchId(prefix: string, dateKey: string) {
  return `${prefix}:${dateKey}`;
}

function normalizePuzzleRecord(record: Record<string, unknown>): PuzzleRecord {
  return {
    ...(record as unknown as PuzzleRecord),
    dateUtc:
      record.dateUtc instanceof Date
        ? record.dateUtc.toISOString().slice(0, 10)
        : (record.dateUtc as string | null),
    sourcePublishedAt: Array.isArray(record.sourcePublishedAt)
      ? (record.sourcePublishedAt as string[])
      : parseStringArray(String(record.sourcePublishedAt ?? "[]")),
    sourceSummary: Array.isArray(record.sourceSummary)
      ? (record.sourceSummary as string[])
      : parseStringArray(String(record.sourceSummary ?? "[]")),
    sourceTitles: Array.isArray(record.sourceTitles)
      ? (record.sourceTitles as string[])
      : parseStringArray(String(record.sourceTitles ?? "[]")),
    sourceUrls: Array.isArray(record.sourceUrls)
      ? (record.sourceUrls as string[])
      : parseStringArray(String(record.sourceUrls ?? "[]")),
  };
}

function getStoredDateValue(dateKey: string): string | null {
  return parseDate(dateKey)?.toISOString().slice(0, 10) ?? null;
}

function buildPuzzleInsertValues(
  candidate: GeneratedCandidate,
  options: {
    expireAt?: Date | null;
    generationBatchId?: string | null;
    publishAt?: Date | null;
    scheduledForDateKey?: string | null;
    sourceKind: PuzzleSourceKind;
    status: InventoryStatus;
  },
) {
  return {
    answer: candidate.answer,
    answerType: candidate.answerType,
    clue: candidate.clue,
    createdAt: new Date(),
    dateUtc: options.scheduledForDateKey ? getStoredDateValue(options.scheduledForDateKey) : null,
    detail: candidate.detail,
    expireAt: options.expireAt ?? null,
    franchise: RHOBH_FRANCHISE,
    generationBatchId: options.generationBatchId ?? null,
    generationStatus: "published",
    newsMode: candidate.newsMode,
    normalizedAnswer: normalizeAnswer(candidate.answer),
    publishAt: options.publishAt ?? null,
    role: candidate.role,
    scheduledForDateKey: options.scheduledForDateKey ?? null,
    sourceKind: options.sourceKind,
    sourcePublishedAt: candidate.sourcePublishedAt,
    sourceSummary: candidate.sourceSummary,
    sourceTitles: candidate.sourceTitles,
    sourceUrls: candidate.sourceUrls,
    status: options.status,
    updatedAt: new Date(),
    validationStatus: "approved",
  };
}

export async function collectCurrentSources(
  dependencies: GenerationDependencies = {},
): Promise<SourceItem[]> {
  const env = LabyrinthServerEnv.safeParse(process.env);

  if (!env.success) {
    return [];
  }

  const startedAt = new Date();
  const requestBody = {
    model: env.data.openRouterModel,
    messages: [
      {
        role: "system",
        content:
          "You collect current RHOBH coverage for a daily puzzle generator. Use the provided web tools to search recent RHOBH coverage and fetch the most relevant articles. Return only articles from the allowed domains, deduplicated by URL, with real publication timestamps when available. Each summary must be spoiler-safe, fact-based, and concise.",
      },
      {
        role: "user",
        content: JSON.stringify(
          {
            allowedDomains: RHOBH_CURRENT_SOURCE_QUERIES.map((sourceQuery) => sourceQuery.domain),
            maxItems: RHOBH_SOURCE_COLLECTION_MAX_ITEMS,
            queries: RHOBH_CURRENT_SOURCE_QUERIES.map((sourceQuery) => sourceQuery.query),
            todayUtc: (dependencies.sourceCollectionNow ?? new Date()).toISOString(),
          },
          null,
          2,
        ),
      },
    ],
    max_tokens: RHOBH_SOURCE_COLLECTION_MAX_TOKENS,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "source_items",
        schema: sourceCollectionResponseSchema,
        strict: true,
      },
    },
    tools: [
      {
        type: "openrouter:web_search",
        parameters: {
          allowed_domains: RHOBH_CURRENT_SOURCE_QUERIES.map((sourceQuery) => sourceQuery.domain),
          engine: "auto",
          max_results: 8,
          max_total_results: 20,
          search_context_size: "medium",
        },
      },
      {
        type: "openrouter:web_fetch",
        parameters: {
          allowed_domains: RHOBH_CURRENT_SOURCE_QUERIES.map((sourceQuery) => sourceQuery.domain),
          engine: "openrouter",
          max_content_tokens: 4000,
          max_uses: 8,
        },
      },
    ],
  };

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.data.openRouterApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
      error?: unknown;
      id?: string;
      usage?: {
        completion_tokens?: number;
        prompt_tokens?: number;
        total_tokens?: number;
      };
    };

    await writeLlmAnalyticsRecord({
      durationMs: Date.now() - startedAt.getTime(),
      feature: "realitea",
      httpStatus: response.status,
      metadata: {
        generationBatchId: dependencies.generationBatchId ?? null,
        sourceCollectionNow: dependencies.sourceCollectionNow?.toISOString() ?? null,
      },
      model: env.data.openRouterModel,
      operation: "source-collection",
      provider: "openrouter",
      request: requestBody,
      response: payload,
      status: response.ok ? "success" : "error",
      usage: {
        completionTokens: payload.usage?.completion_tokens ?? null,
        promptTokens: payload.usage?.prompt_tokens ?? null,
        totalTokens: payload.usage?.total_tokens ?? null,
      },
    });

    if (!response.ok) {
      return [];
    }
    const rawContent = payload.choices?.[0]?.message?.content;
    if (typeof rawContent !== "string" || rawContent.length === 0) {
      return [];
    }

    const collected = sourceItemListSchema.parse(JSON.parse(rawContent));

    const sourceItems: SourceItem[] = [];

    for (const item of collected) {
      const domain = getAllowedSourceDomain(item.url);
      if (!domain || sourceItems.some((source) => source.url === item.url)) {
        continue;
      }

      sourceItems.push({
        ...item,
        domain,
      });

      if (sourceItems.length >= RHOBH_SOURCE_COLLECTION_MAX_ITEMS) {
        break;
      }
    }

    return sourceItems;
  } catch (error) {
    await writeLlmAnalyticsRecord({
      durationMs: Date.now() - startedAt.getTime(),
      error,
      feature: "realitea",
      metadata: {
        generationBatchId: dependencies.generationBatchId ?? null,
        sourceCollectionNow: dependencies.sourceCollectionNow?.toISOString() ?? null,
      },
      model: env.data.openRouterModel,
      operation: "source-collection",
      provider: "openrouter",
      request: requestBody,
      status: "error",
    });
    return [];
  }
}

async function generateCandidatesFromSources(
  dateKey: string,
  sources: SourceItem[],
  excludedAnswers: string[] = [],
  dependencies: GenerationDependencies = {},
): Promise<GeneratedCandidate[]> {
  const env = LabyrinthServerEnv.safeParse(process.env);

  if (!env.success) {
    return [];
  }

  const startedAt = new Date();
  const request = {
    model: env.data.openRouterModel,
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT.replaceAll("{{ANSWER_LENGTH}}", String(RHOBH_ANSWER_LENGTH)),
      },
      {
        role: "user",
        content: JSON.stringify(
          {
            dateKey,
            excludedAnswers,
            sources,
          },
          null,
          2,
        ),
      },
    ],
    max_tokens: RHOBH_GENERATION_MAX_TOKENS,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "rhobh_generation_candidates",
        schema: z.toJSONSchema(rhobhGenerationResponseSchema),
        strict: true,
      },
    },
  };

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.data.openRouterApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
      error?: unknown;
      id?: string;
      usage?: {
        completion_tokens?: number;
        prompt_tokens?: number;
        total_tokens?: number;
      };
    };

    await writeLlmAnalyticsRecord({
      durationMs: Date.now() - startedAt.getTime(),
      feature: "realitea",
      httpStatus: response.status,
      metadata: {
        dateKey,
        generationBatchId: dependencies.generationBatchId ?? null,
        sourceCount: sources.length,
      },
      model: env.data.openRouterModel,
      operation: "candidate-generation",
      provider: "openrouter",
      request,
      response: payload,
      status: response.ok ? "success" : "error",
      usage: {
        completionTokens: payload.usage?.completion_tokens ?? null,
        promptTokens: payload.usage?.prompt_tokens ?? null,
        totalTokens: payload.usage?.total_tokens ?? null,
      },
    });

    if (!response.ok) {
      return [];
    }

    const rawContent = payload.choices?.[0]?.message?.content;
    if (typeof rawContent !== "string" || rawContent.length === 0) {
      return [];
    }

    const parsed = rhobhGenerationResponseSchema.parse(JSON.parse(rawContent));

    return parsed.candidates;
  } catch (error) {
    await writeLlmAnalyticsRecord({
      durationMs: Date.now() - startedAt.getTime(),
      error,
      feature: "realitea",
      metadata: {
        dateKey,
        generationBatchId: dependencies.generationBatchId ?? null,
        sourceCount: sources.length,
      },
      model: env.data.openRouterModel,
      operation: "candidate-generation",
      provider: "openrouter",
      request,
      status: "error",
    });
    return [];
  }
}

export async function getRecentAnswers(date: Date): Promise<Set<string>> {
  const cutoff = new Date(date);
  cutoff.setUTCDate(cutoff.getUTCDate() - RHOBH_REPEAT_WINDOW_DAYS);

  const rows = await db
    .select({ normalizedAnswer: rhobhDailyPuzzles.normalizedAnswer })
    .from(rhobhDailyPuzzles)
    .where(
      and(
        eq(rhobhDailyPuzzles.franchise, RHOBH_FRANCHISE),
        eq(rhobhDailyPuzzles.validationStatus, "approved"),
        gte(rhobhDailyPuzzles.dateUtc, getStoredDateValue(getDateKey(cutoff))!),
      ),
    );

  return new Set(rows.map((row) => row.normalizedAnswer));
}

async function getInventoryAnswers(): Promise<Set<string>> {
  const rows = await db
    .select({ normalizedAnswer: rhobhDailyPuzzles.normalizedAnswer })
    .from(rhobhDailyPuzzles)
    .where(
      and(
        eq(rhobhDailyPuzzles.franchise, RHOBH_FRANCHISE),
        inArray(rhobhDailyPuzzles.status, ["published", "reserve", "scheduled"]),
      ),
    );

  return new Set(rows.map((row) => row.normalizedAnswer));
}

async function markExpiredPublishedPuzzles(now: Date, tx: any = db) {
  await tx
    .update(rhobhDailyPuzzles)
    .set({
      status: "consumed",
      updatedAt: now,
    })
    .where(
      and(
        eq(rhobhDailyPuzzles.franchise, RHOBH_FRANCHISE),
        eq(rhobhDailyPuzzles.status, "published"),
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
        eq(rhobhDailyPuzzles.franchise, RHOBH_FRANCHISE),
        eq(rhobhDailyPuzzles.status, "published"),
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
        eq(rhobhDailyPuzzles.franchise, RHOBH_FRANCHISE),
        eq(rhobhDailyPuzzles.scheduledForDateKey, dateKey),
        inArray(rhobhDailyPuzzles.status, ["published", "scheduled"]),
      ),
    )
    .orderBy(desc(rhobhDailyPuzzles.createdAt))
    .limit(1);

  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? normalizePuzzleRecord(row) : null;
}

async function persistInventoryPuzzle(
  candidate: GeneratedCandidate,
  options: {
    expireAt?: Date | null;
    generationBatchId?: string | null;
    publishAt?: Date | null;
    scheduledForDateKey?: string | null;
    sourceKind: PuzzleSourceKind;
    status: InventoryStatus;
  },
) {
  const inserted = await db
    .insert(rhobhDailyPuzzles)
    .values(buildPuzzleInsertValues(candidate, options))
    .returning();

  return normalizePuzzleRecord(inserted[0] as Record<string, unknown>);
}

async function generateCurrentCandidate(
  date: Date,
  dependencies: GenerationDependencies = {},
): Promise<GeneratedCandidate | null> {
  const dateKey = getDateKey(date);
  const previousAnswers = await getRecentAnswers(date);
  const rejectedCandidates = new Set<string>();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const sources = await collectCurrentSources({
      sourceCollectionNow: dependencies.sourceCollectionNow,
    });

    if (sources.length === 0) {
      console.warn("RHOBH scheduled puzzle source collection returned no results", {
        attempt: attempt + 1,
        dateKey,
      });
      continue;
    }

    const candidates = await generateCandidatesFromSources(
      dateKey,
      sources,
      [...previousAnswers, ...rejectedCandidates],
      dependencies,
    );

    if (candidates.length === 0) {
      console.warn("RHOBH scheduled puzzle generation returned no candidates", {
        attempt: attempt + 1,
        dateKey,
        sourceCount: sources.length,
      });
      continue;
    }

    const rankedCandidates = candidates
      .map((candidate) => ({
        candidate,
        validation: validateCandidate(candidate, { previousAnswers, sources }),
      }))
      .sort((left, right) => {
        if (left.validation.valid !== right.validation.valid) {
          return left.validation.valid ? -1 : 1;
        }
        if (left.candidate.answerType !== right.candidate.answerType) {
          if (left.candidate.answerType === "person") {
            return 1;
          }
          if (right.candidate.answerType === "person") {
            return -1;
          }
        }
        return right.candidate.sourceUrls.length - left.candidate.sourceUrls.length;
      });

    for (const entry of rankedCandidates) {
      if (entry.validation.valid && entry.candidate.newsMode === "current") {
        return entry.candidate;
      }

      rejectedCandidates.add(entry.validation.normalizedAnswer);
      console.warn("Rejected RHOBH scheduled candidate", {
        answer: entry.candidate.answer,
        reasons: entry.validation.reasons,
      });
    }
  }

  console.warn("RHOBH scheduled puzzle generation failed", {
    dateKey,
    rejectedCandidates: [...rejectedCandidates],
  });
  return null;
}

function chooseEvergreenCandidates(
  count: number,
  excludedAnswers: Set<string>,
): GeneratedCandidate[] {
  const pool = archiveMoments.map(
    (entry): GeneratedCandidate => ({
      ...entry,
      answerType: entry.answerType as GeneratedCandidate["answerType"],
      newsMode: entry.newsMode as GeneratedCandidate["newsMode"],
      rationale: "Evergreen reserve inventory",
      sourcePublishedAt: [],
      sourceSummary: [],
      sourceTitles: [],
      sourceUrls: [],
    }),
  );
  const selected: GeneratedCandidate[] = [];

  for (const candidate of pool) {
    const normalizedAnswer = normalizeAnswer(candidate.answer);
    if (excludedAnswers.has(normalizedAnswer)) {
      continue;
    }

    const validation = validateCandidate(candidate, {
      allowEvergreen: true,
      previousAnswers: excludedAnswers,
    });

    if (!validation.valid) {
      continue;
    }

    excludedAnswers.add(normalizedAnswer);
    selected.push(candidate);

    if (selected.length >= count) {
      break;
    }
  }

  return selected;
}

export async function generateScheduledPuzzle(
  dateKey: string,
  dependencies: GenerationDependencies = {},
): Promise<PuzzleRecord | null> {
  const existing = await loadScheduledPuzzle(dateKey);
  if (existing) {
    return existing;
  }

  const date = parseDate(dateKey);
  if (!date) {
    throw new Error(`Invalid scheduled puzzle date key: ${dateKey}`);
  }

  const candidate = await generateCurrentCandidate(date, dependencies);
  if (!candidate) {
    return null;
  }

  const window = getPuzzleWindow(date);
  return persistInventoryPuzzle(candidate, {
    expireAt: window.expireAt,
    generationBatchId:
      dependencies.generationBatchId ?? buildGenerationBatchId("scheduled", window.dateKey),
    publishAt: window.publishAt,
    scheduledForDateKey: window.dateKey,
    sourceKind: "current",
    status: "scheduled",
  });
}

export async function generateReservePuzzles(
  countToCreate: number,
  dependencies: GenerationDependencies = {},
): Promise<PuzzleRecord[]> {
  if (countToCreate <= 0) {
    return [];
  }

  const excludedAnswers = await getRecentAnswers(dependencies.now ?? new Date());
  const activeAnswers = await getInventoryAnswers();
  for (const answer of activeAnswers) {
    excludedAnswers.add(answer);
  }

  const candidates = chooseEvergreenCandidates(countToCreate, excludedAnswers);
  const created: PuzzleRecord[] = [];

  for (const candidate of candidates) {
    created.push(
      await persistInventoryPuzzle(candidate, {
        generationBatchId:
          dependencies.generationBatchId ??
          buildGenerationBatchId("reserve", getDateKey(new Date())),
        sourceKind: "evergreen",
        status: "reserve",
      }),
    );
  }

  return created;
}

export async function promoteScheduledOrReservePuzzle(now: Date): Promise<PuzzleRecord | null> {
  const window = getPuzzleWindow(now);

  return db.transaction(async (tx) => {
    await markExpiredPublishedPuzzles(now, tx);

    const active = await getPublishedPuzzle(now, tx);
    if (active) {
      return active;
    }

    const scheduledRows = await tx
      .select()
      .from(rhobhDailyPuzzles)
      .where(
        and(
          eq(rhobhDailyPuzzles.franchise, RHOBH_FRANCHISE),
          eq(rhobhDailyPuzzles.status, "scheduled"),
          eq(rhobhDailyPuzzles.scheduledForDateKey, window.dateKey),
        ),
      )
      .orderBy(desc(rhobhDailyPuzzles.createdAt))
      .limit(1);

    const scheduled = scheduledRows[0] as Record<string, unknown> | undefined;
    if (scheduled?.id) {
      const updated = await tx
        .update(rhobhDailyPuzzles)
        .set({
          dateUtc: getStoredDateValue(window.dateKey),
          expireAt: window.expireAt,
          publishAt: window.publishAt,
          status: "published",
          updatedAt: now,
        })
        .where(eq(rhobhDailyPuzzles.id, Number(scheduled.id)))
        .returning();

      return normalizePuzzleRecord(updated[0] as Record<string, unknown>);
    }

    const reserveRows = await tx
      .select()
      .from(rhobhDailyPuzzles)
      .where(
        and(
          eq(rhobhDailyPuzzles.franchise, RHOBH_FRANCHISE),
          eq(rhobhDailyPuzzles.status, "reserve"),
        ),
      )
      .orderBy(asc(rhobhDailyPuzzles.createdAt))
      .limit(1);

    const reserve = reserveRows[0] as Record<string, unknown> | undefined;
    if (!reserve?.id) {
      return null;
    }

    const promoted = await tx
      .update(rhobhDailyPuzzles)
      .set({
        dateUtc: getStoredDateValue(window.dateKey),
        expireAt: window.expireAt,
        publishAt: window.publishAt,
        scheduledForDateKey: window.dateKey,
        status: "published",
        updatedAt: now,
      })
      .where(eq(rhobhDailyPuzzles.id, Number(reserve.id)))
      .returning();

    return normalizePuzzleRecord(promoted[0] as Record<string, unknown>);
  });
}

export async function loadActivePuzzle(now: Date): Promise<PuzzleEnvelope | null> {
  await markExpiredPublishedPuzzles(now);

  const published = await getPublishedPuzzle(now);
  if (published) {
    return { puzzle: mapRecordToStoredPuzzle(published) };
  }

  const promoted = await promoteScheduledOrReservePuzzle(now);
  if (!promoted) {
    return null;
  }

  return { puzzle: mapRecordToStoredPuzzle(promoted) };
}

export async function loadPuzzleForDate(date: Date): Promise<PuzzleEnvelope | null> {
  return loadActivePuzzle(date);
}

export async function generateDailyPuzzle(date: Date): Promise<PuzzleRecord | null> {
  return generateScheduledPuzzle(getDateKey(date), {
    generationBatchId: buildGenerationBatchId("manual", getDateKey(date)),
    now: date,
    sourceCollectionNow: new Date(),
  });
}

export async function getStoredAnswersForValidation(): Promise<Set<string>> {
  const rows = await db
    .select({ normalizedAnswer: rhobhDailyPuzzles.normalizedAnswer })
    .from(rhobhDailyPuzzles)
    .where(eq(rhobhDailyPuzzles.franchise, RHOBH_FRANCHISE));

  return new Set(rows.map((row) => row.normalizedAnswer));
}
