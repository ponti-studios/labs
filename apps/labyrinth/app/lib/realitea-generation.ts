import { chatCompletion } from "@pontistudios/ai";
import { db, rhobhDailyPuzzles } from "@pontistudios/db";
import { XMLParser } from "fast-xml-parser";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import pino from "pino";
import { z } from "zod";

import { normalizeGuess, REALITEA_ANSWER_LENGTH } from "./realitea";
import { getPuzzleWindow, parseDate } from "./realitea-date";
import { getInventoryAnswers, getRecentAnswers, loadScheduledPuzzle } from "./realitea-db";
import type {
  CandidatePreview,
  FeedItem,
  GenerationPreviewResult,
  PreviewCandidatesOptions,
  PuzzleAnswerType,
  PuzzleRecord,
} from "./realitea.types";
import { validateCandidate } from "./realitea-validation";

const REALITY_BLURB_FEED_URL = "https://realityblurb.com/feed";

async function fetchFeedItems(feedUrl?: string): Promise<FeedItem[]> {
  const url = feedUrl ?? REALITY_BLURB_FEED_URL;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch RSS feed: ${res.status}`);
  const xml = await res.text();
  const parser = new XMLParser({ ignoreAttributes: false });
  const parsed = parser.parse(xml);
  const items: unknown[] = parsed?.rss?.channel?.item ?? [];
  return items.map((item: unknown) => {
    const i = item as Record<string, unknown>;
    const description = String(i["description"] ?? "")
      .replace(/<[^>]+>/g, "")
      .slice(0, 300);
    return {
      title: String(i["title"] ?? ""),
      link: String(i["link"] ?? ""),
      pubDate: String(i["pubDate"] ?? ""),
      description,
    };
  });
}

const logger = pino(
  process.env.NODE_ENV === "development"
    ? { transport: { target: "pino-pretty" } }
    : { level: process.env.NODE_ENV === "test" ? "silent" : "info" },
);

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const SYSTEM_PROMPT = readFileSync(
  join(__dirname, "prompts/bravo-generation-system.md"),
  "utf-8",
);

const candidateSchema = z.object({
  answer: z.string().min(1),
  answerType: z.string().min(1),
  clue: z.string().min(1),
  detail: z.string().min(1),
  sources: z.array(z.object({ url: z.string(), title: z.string(), publishedAt: z.string() })).min(1),
});

const generationResponseSchema = z.object({
  candidates: z.array(candidateSchema).min(3).max(5),
});

type Candidate = z.infer<typeof candidateSchema>;

function buildMessages(
  dateKey: string,
  excludedAnswers: string[],
  feedItems: FeedItem[],
  systemPrompt: string,
) {
  return [
    {
      role: "system" as const,
      content: systemPrompt.replaceAll("{{ANSWER_LENGTH}}", String(REALITEA_ANSWER_LENGTH)),
    },
    {
      role: "user" as const,
      content: JSON.stringify({
        dateKey,
        excludedAnswers,
        articles: feedItems,
        instructions:
          "Use the provided articles from realityblurb.com to generate puzzle candidates. Every sourceUrl must be from realityblurb.com.",
      }),
    },
  ];
}

async function callGenerationApi(
  dateKey: string,
  excludedAnswers: string[],
  feedItems: FeedItem[],
): Promise<Candidate | null> {
  const childLogger = logger.child({ operation: "callGenerationApi", dateKey });

  try {
    const response = await chatCompletion({
      messages: buildMessages(dateKey, excludedAnswers, feedItems, SYSTEM_PROMPT),
      maxTokens: 2000,
      responseFormat: {
        type: "json_schema",
        jsonSchema: {
          name: "generation_response",
          schema: z.toJSONSchema(generationResponseSchema),
          strict: true,
        },
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

async function callGenerationApiForPreview(
  dateKey: string,
  excludedAnswers: string[],
  feedItems: FeedItem[],
  systemPrompt?: string,
): Promise<{ candidates: CandidatePreview[]; llmError: string | null }> {
  try {
    const response = await chatCompletion({
      messages: buildMessages(dateKey, excludedAnswers, feedItems, systemPrompt ?? SYSTEM_PROMPT),
      maxTokens: 2000,
      responseFormat: {
        type: "json_schema",
        jsonSchema: {
          name: "generation_response",
          schema: z.toJSONSchema(generationResponseSchema),
          strict: true,
        },
      },
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return { candidates: [], llmError: "LLM returned empty content" };
    }

    const cleanedContent = content.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const parsed = generationResponseSchema.parse(JSON.parse(cleanedContent));
    const previousAnswers = new Set(excludedAnswers);

    const candidates: CandidatePreview[] = parsed.candidates.map((candidate) => ({
      candidate,
      validation: validateCandidate(candidate, previousAnswers),
    }));

    return { candidates, llmError: null };
  } catch (err) {
    return {
      candidates: [],
      llmError: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function previewCandidates(
  dateKey: string,
  options: PreviewCandidatesOptions = {},
): Promise<GenerationPreviewResult> {
  const feedUrl = options.feedUrl ?? REALITY_BLURB_FEED_URL;
  let feedItems: FeedItem[] = [];
  let feedError: string | null = null;

  try {
    feedItems = await fetchFeedItems(feedUrl);
  } catch (err) {
    feedError = err instanceof Error ? err.message : String(err);
  }

  const { candidates, llmError } = await callGenerationApiForPreview(
    dateKey,
    options.excludedAnswers ?? [],
    feedItems,
    options.systemPrompt,
  );

  const selectedIndex = candidates.findIndex((c) => c.validation.valid);

  return {
    dateKey,
    feedUrl,
    feedItemCount: feedItems.length,
    feedItems,
    candidates,
    selectedIndex: selectedIndex === -1 ? null : selectedIndex,
    llmError: feedError ?? llmError,
  };
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

  const [recentAnswers, inventoryAnswers, feedItems] = await Promise.all([
    getRecentAnswers(date),
    getInventoryAnswers(),
    fetchFeedItems().catch((err) => {
      childLogger.error(
        { event: "[FEED_FETCH_ERROR]", error: err instanceof Error ? err.message : String(err) },
        "failed to fetch realityblurb.com feed",
      );
      return [] as FeedItem[];
    }),
  ]);
  const excludedAnswers = [...new Set([...recentAnswers, ...inventoryAnswers])];

  if (feedItems.length === 0) {
    childLogger.error({ event: "[FEED_EMPTY]" }, "no feed items retrieved, cannot generate puzzle");
    return null;
  }

  let candidate: Candidate | null = null;
  for (let attempt = 0; attempt < 3 && !candidate; attempt++) {
    candidate = await callGenerationApi(dateKey, excludedAnswers, feedItems);
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

  const inserted = await db
    .insert(rhobhDailyPuzzles)
    .values({
      answer: candidate.answer,
      answerType: candidate.answerType as PuzzleAnswerType,
      clue: candidate.clue,
      createdAt: now,
      dateUtc: window.dateKey,
      detail: candidate.detail,
      expireAt: window.expireAt,
      normalizedAnswer: normalizeGuess(candidate.answer),
      publishAt: window.publishAt,
      sources: candidate.sources,
      status: "scheduled",
      updatedAt: now,
    })
    .returning();

  childLogger.info(
    { event: "[PUZZLE_GENERATED]", puzzle_id: inserted[0]?.id, answer: candidate.answer },
    "puzzle generated and scheduled",
  );
  return inserted[0] as PuzzleRecord;
}
