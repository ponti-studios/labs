import { chat, createOpenRouterTextAdapter, webFetchTool, webSearchTool } from "@pontistudios/ai";
import { and, db, desc, eq, gte, rhobhDailyPuzzles } from "@pontistudios/db";
import { z } from "zod";

import { normalizeAnswer } from "./realitea";
import {
  getAllowedSourceDomain,
  getDateKey,
  mapRecordToStoredPuzzle,
  RHOBH_FRANCHISE,
  RHOBH_PRIMARY_SOURCE_DOMAIN,
  RHOBH_REPEAT_WINDOW_DAYS,
  sourceItemListSchema,
  validateCandidate,
  type GeneratedCandidate,
  type PuzzleEnvelope,
  type PuzzleRecord,
  type SourceItem,
} from "./realitea-daily-puzzle";
import { LabyrinthServerEnv } from "./server/env";

interface GenerationDependencies {
  now?: Date;
}

const RHOBH_CURRENT_SOURCE_QUERIES = [
  {
    domain: RHOBH_PRIMARY_SOURCE_DOMAIN,
    query: 'site:bravotv.com/the-daily-dish RHOBH OR "Real Housewives of Beverly Hills"',
  },
  { domain: "people.com", query: 'site:people.com RHOBH OR "Real Housewives of Beverly Hills"' },
  { domain: "ew.com", query: 'site:ew.com RHOBH OR "Real Housewives of Beverly Hills"' },
  { domain: "eonline.com", query: 'site:eonline.com RHOBH OR "Real Housewives of Beverly Hills"' },
  {
    domain: "usmagazine.com",
    query: 'site:usmagazine.com RHOBH OR "Real Housewives of Beverly Hills"',
  },
] as const;
const RHOBH_SOURCE_COLLECTION_MAX_ITEMS = 5;

const rhobhGenerationCandidateSchema = z.object({
  answer: z.string().min(1).meta({ description: "The RHOBH answer to guess." }),
  answerType: z
    .enum(["moment", "object", "person", "phrase", "place", "storyline"])
    .meta({ description: "The answer taxonomy." }),
  clue: z.string().min(1).meta({ description: "A non-spoiler clue for the final guess only." }),
  detail: z
    .string()
    .min(1)
    .meta({ description: "A spoiler-safe explanation shown after the game ends." }),
  newsMode: z
    .enum(["archive", "current"])
    .meta({ description: "Whether this comes from fresh RHOBH news or the curated archive." }),
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

const rhobhGenerationCandidatesSchema = z.array(rhobhGenerationCandidateSchema).min(3).max(5);
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

function getOpenRouterAdapter(env: LabyrinthServerEnv) {
  return createOpenRouterTextAdapter({
    model: env.openRouterModel as "openai/gpt-5.1",
    apiKey: env.openRouterApiKey,
  });
}

export async function collectCurrentSources(
  dependencies: GenerationDependencies = {},
): Promise<SourceItem[]> {
  const env = LabyrinthServerEnv.safeParse(process.env);

  if (!env.success) {
    return [];
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.data.openRouterApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
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
                allowedDomains: RHOBH_CURRENT_SOURCE_QUERIES.map(
                  (sourceQuery) => sourceQuery.domain,
                ),
                maxItems: RHOBH_SOURCE_COLLECTION_MAX_ITEMS,
                queries: RHOBH_CURRENT_SOURCE_QUERIES.map((sourceQuery) => sourceQuery.query),
                todayUtc: (dependencies.now ?? new Date()).toISOString(),
              },
              null,
              2,
            ),
          },
        ],
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
              allowed_domains: RHOBH_CURRENT_SOURCE_QUERIES.map(
                (sourceQuery) => sourceQuery.domain,
              ),
              engine: "auto",
              max_results: 8,
              max_total_results: 20,
              search_context_size: "medium",
            },
          },
          {
            type: "openrouter:web_fetch",
            parameters: {
              allowed_domains: RHOBH_CURRENT_SOURCE_QUERIES.map(
                (sourceQuery) => sourceQuery.domain,
              ),
              engine: "openrouter",
              max_content_tokens: 4000,
              max_uses: 8,
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };
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
  } catch {
    return [];
  }
}

async function generateCandidatesFromSources(
  dateKey: string,
  sources: SourceItem[],
  excludedAnswers: string[] = [],
): Promise<GeneratedCandidate[]> {
  const env = LabyrinthServerEnv.safeParse(process.env);

  if (!env.success) {
    return [];
  }

  try {
    const response = await chat({
      adapter: getOpenRouterAdapter(env.data),
      systemPrompts: [
        "You create daily RealiTea puzzles for RHOBH.",
        "Prefer current RHOBH news when source support is strong.",
        "Return 3 to 5 candidates inside the schema field exactly.",
        "For current candidates, every answer must be supported by at least two distinct allowed-source domains, and one of them must be bravotv.com.",
        "For current candidates, do not use a cast member's name as the answer. Prefer the underlying storyline, object, place, phrase, or moment instead.",
        "Choose answers that normalize to only letters and stay between 4 and 10 letters after removing spaces and punctuation.",
        "Prefer concise single-word or two-word answers like a place, object, event, or short franchise term.",
        "Never leak the exact answer text in the clue or detail. Before returning, self-check that neither field contains the answer or a trivial restatement of it.",
        "If a candidate cannot satisfy all of those rules, do not include it.",
      ],
      messages: [
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
      outputSchema: rhobhGenerationResponseSchema,
    });
    return response.candidates;
  } catch {
    return [];
  }
}

export async function getRecentAnswers(date: Date): Promise<Set<string>> {
  const cutoff = new Date(date);
  cutoff.setDate(cutoff.getDate() - RHOBH_REPEAT_WINDOW_DAYS);

  const rows = await db
    .select({ normalizedAnswer: rhobhDailyPuzzles.normalizedAnswer })
    .from(rhobhDailyPuzzles)
    .where(
      and(
        eq(rhobhDailyPuzzles.franchise, RHOBH_FRANCHISE),
        eq(rhobhDailyPuzzles.validationStatus, "approved"),
        gte(rhobhDailyPuzzles.dateUtc, getDateKey(cutoff)),
      ),
    );

  return new Set(rows.map((row) => row.normalizedAnswer));
}

export async function getStoredPuzzleForDate(date: Date): Promise<PuzzleRecord | null> {
  const dateKey = getDateKey(date);
  const row = await db
    .select()
    .from(rhobhDailyPuzzles)
    .where(
      and(
        eq(rhobhDailyPuzzles.franchise, RHOBH_FRANCHISE),
        eq(rhobhDailyPuzzles.dateUtc, dateKey),
        eq(rhobhDailyPuzzles.validationStatus, "approved"),
      ),
    )
    .orderBy(desc(rhobhDailyPuzzles.createdAt))
    .limit(1);

  return (row[0] as PuzzleRecord | undefined) ?? null;
}

export async function getAllStoredAnswers(): Promise<Set<string>> {
  const rows = await db
    .select({ normalizedAnswer: rhobhDailyPuzzles.normalizedAnswer })
    .from(rhobhDailyPuzzles)
    .where(eq(rhobhDailyPuzzles.franchise, RHOBH_FRANCHISE));

  return new Set(rows.map((row) => row.normalizedAnswer));
}

export async function loadPuzzleForDate(date: Date): Promise<PuzzleEnvelope | null> {
  const stored = await getStoredPuzzleForDate(date);

  if (stored) {
    return {
      puzzle: mapRecordToStoredPuzzle(stored),
    };
  }

  const generated = await generateDailyPuzzle(date);

  if (!generated) {
    return null;
  }

  return {
    puzzle: mapRecordToStoredPuzzle(generated),
  };
}

export async function persistPuzzle(
  date: Date,
  candidate: GeneratedCandidate,
): Promise<PuzzleRecord> {
  const dateKey = getDateKey(date);
  const normalizedAnswer = normalizeAnswer(candidate.answer);

  await db
    .delete(rhobhDailyPuzzles)
    .where(
      and(eq(rhobhDailyPuzzles.franchise, RHOBH_FRANCHISE), eq(rhobhDailyPuzzles.dateUtc, dateKey)),
    );

  const inserted = await db
    .insert(rhobhDailyPuzzles)
    .values({
      answer: candidate.answer,
      answerType: candidate.answerType,
      clue: candidate.clue,
      createdAt: new Date(),
      dateUtc: dateKey,
      detail: candidate.detail,
      franchise: RHOBH_FRANCHISE,
      generationStatus: "published",
      newsMode: candidate.newsMode,
      normalizedAnswer,
      role: candidate.role,
      sourcePublishedAt: candidate.sourcePublishedAt,
      sourceSummary: candidate.sourceSummary,
      sourceTitles: candidate.sourceTitles,
      sourceUrls: candidate.sourceUrls,
      updatedAt: new Date(),
      validationStatus: "approved",
    })
    .returning();

  return inserted[0] as PuzzleRecord;
}

export async function generateDailyPuzzle(
  date: Date,
  dependencies: GenerationDependencies = {},
): Promise<PuzzleRecord | null> {
  const dateKey = getDateKey(date);
  const previousAnswers = await getRecentAnswers(date);
  const sources = await collectCurrentSources({ now: dependencies.now });

  const rejectedCandidates = new Set<string>();

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const candidates = await generateCandidatesFromSources(dateKey, sources, [
      ...previousAnswers,
      ...rejectedCandidates,
    ]);

    if (candidates.length === 0) {
      break;
    }

    const validCurrent = candidates
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

    for (const entry of validCurrent) {
      if (entry.validation.valid && entry.candidate.newsMode === "current") {
        return persistPuzzle(date, entry.candidate);
      }

      rejectedCandidates.add(entry.validation.normalizedAnswer);
      console.warn("Rejected RHOBH candidate", {
        answer: entry.candidate.answer,
        reasons: entry.validation.reasons,
      });
    }
  }

  console.warn("RHOBH daily puzzle generation failed; using database fallback", {
    dateKey,
    rejectedCandidates: [...rejectedCandidates],
  });

  return null;
}

export async function getStoredAnswersForValidation(): Promise<Set<string>> {
  return getAllStoredAnswers();
}
