import { chatCompletion } from "@pontistudios/ai";
import { db, rhobhDailyPuzzles } from "@pontistudios/db";
import pino from "pino";
import { z } from "zod";

import { normalizeGuess, REALITEA_ANSWER_LENGTH } from "./realitea";
import { getPuzzleWindow, parseDate } from "./realitea-date";
import {
  BRAVO_FRANCHISE,
  BRAVO_PRIMARY_SOURCE_DOMAIN,
  validateCandidate,
} from "./realitea-validation";
import { getInventoryAnswers, getRecentAnswers, loadScheduledPuzzle } from "./realitea-db";
import type { PuzzleAnswerType, PuzzleRecord } from "./realitea.types";

const logger = pino(
  process.env.NODE_ENV === "development"
    ? { transport: { target: "pino-pretty" } }
    : { level: process.env.NODE_ENV === "test" ? "silent" : "info" },
);

const SYSTEM_PROMPT = `You are a puzzle editor for "RealiTea" — a daily Wordle-style game about Bravo reality TV.

Your job is to suggest puzzle candidates for a specific date. Each candidate must follow these rules:

1. The answer must normalize to exactly {{ANSWER_LENGTH}} letters (A-Z only). Strip spaces, punctuation, and diacritics, then uppercase.
2. Choose answer types from: storyline, moment, place, phrase, object. Never use "person".
3. The answer may NOT appear verbatim in the clue or detail text.
4. Each candidate must include at least one source URL from bravotv.com/the-daily-dish.
5. The answer must NOT repeat any answer from the excluded answers list.
6. The answer must be directly related to today's Bravo news and coverage.
7. Source titles should be descriptive and match the article headline.`;

const candidateSchema = z.object({
  answer: z.string().min(1),
  answerType: z.string().min(1),
  clue: z.string().min(1),
  detail: z.string().min(1),
  sourceUrls: z.array(z.string()).min(1),
  sourceSummary: z.array(z.string()).optional(),
  sourceTitles: z.array(z.string()).optional(),
  sourcePublishedAt: z.array(z.string()).optional(),
});

const generationResponseSchema = z.object({
  candidates: z.array(candidateSchema).min(3).max(5),
});

type Candidate = z.infer<typeof candidateSchema>;

async function callGenerationApi(
  dateKey: string,
  excludedAnswers: string[],
): Promise<Candidate | null> {
  const childLogger = logger.child({ operation: "callGenerationApi", dateKey });

  try {
    const response = await chatCompletion({
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

  const inserted = await db
    .insert(rhobhDailyPuzzles)
    .values({
      answer: candidate.answer,
      answerType: candidate.answerType as PuzzleAnswerType,
      clue: candidate.clue,
      createdAt: now,
      dateUtc: window.dateKey,
      detail: detailFromSummary,
      expireAt: window.expireAt,
      franchise: BRAVO_FRANCHISE,
      normalizedAnswer: normalizeGuess(candidate.answer),
      publishAt: window.publishAt,
      role: "",
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
  return inserted[0] as PuzzleRecord;
}
