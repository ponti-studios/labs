import { chatCompletion } from "@pontistudios/ai";
import { dailyPuzzles, db } from "@pontistudios/db";
import type { Article, Game } from "@pontistudios/db";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

import { getErrorMessage } from "../errors";
import { createLogger } from "../logger.server";

import { normalizeGuess, REALITEA_ANSWER_LENGTH } from "./index";
import { getDateKey, parseDate } from "./date";
import { fetchFeedItems } from "./ingest";
import {
  expireStaleArticles,
  getPendingArticlesForGame,
  getRecentAnswers,
  getStoredAnswers,
  loadPuzzleForDate,
  markArticleUsed,
  recordArticleRejection,
} from "./repository";
import type {
  CandidatePreview,
  FeedItem,
  GenerationPreviewResult,
  PreviewCandidatesOptions,
  PuzzleAnswerType,
  PuzzleRecord,
} from "./types";
import { validateCandidate } from "./validation";

const REALITY_BLURB_FEED_URL = "https://realityblurb.com/feed";
const GENERATION_BATCH_SIZE = 8;
const MAX_ARTICLE_REJECTIONS = 3;

const logger = createLogger();

const promptCache = new Map<string, string>();

function readSystemPrompt(promptPath: string): string {
  const cached = promptCache.get(promptPath);
  if (cached) return cached;
  const prompt = (() => {
    try {
      const __dirname = fileURLToPath(new URL(".", import.meta.url));
      return readFileSync(join(__dirname, "..", "..", promptPath), "utf-8");
    } catch {
      return readFileSync(join(process.cwd(), promptPath), "utf-8");
    }
  })();
  promptCache.set(promptPath, prompt);
  return prompt;
}

const candidateSchema = z.object({
  answer: z.string().min(1),
  answerType: z.string().min(1),
  clue: z.string().min(1),
  detail: z.string().min(1),
  sources: z
    .array(z.object({ url: z.string(), title: z.string(), publishedAt: z.string() }))
    .min(1),
});

const generationResponseSchema = z.object({
  candidates: z.array(candidateSchema).min(3).max(5),
});

type Candidate = z.infer<typeof candidateSchema>;

function articleToFeedItem(article: Article): FeedItem {
  return {
    title: article.title,
    link: article.url,
    pubDate: article.publishedAt?.toISOString() ?? "",
    description: article.description ?? "",
    ...(article.imageUrl ? { imageUrl: article.imageUrl } : {}),
  };
}

function buildMessages(
  dateKey: string,
  excludedAnswers: string[],
  feedItems: FeedItem[],
  systemPrompt: string,
  answerLength: number,
) {
  return [
    {
      role: "system" as const,
      content: systemPrompt.replaceAll("{{ANSWER_LENGTH}}", String(answerLength)),
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

/** Find the pending article a candidate's sources point at, if any. */
function matchArticle(candidate: Candidate, pendingArticles: Article[]): Article | null {
  const candidateUrls = new Set(candidate.sources.map((s) => s.url));
  return pendingArticles.find((article) => candidateUrls.has(article.url)) ?? null;
}

async function callGenerationApi(
  game: Game,
  dateKey: string,
  excludedAnswers: string[],
  pendingArticles: Article[],
  systemPrompt: string,
): Promise<{ candidate: Candidate; article: Article } | null> {
  const childLogger = logger.child({ operation: "callGenerationApi", game: game.slug, dateKey });

  try {
    const response = await chatCompletion({
      messages: buildMessages(
        dateKey,
        excludedAnswers,
        pendingArticles.map(articleToFeedItem),
        systemPrompt,
        game.answerLength,
      ),
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
      const article = matchArticle(candidate, pendingArticles);
      const result = validateCandidate(candidate, previousAnswers);

      if (!article) {
        childLogger.warn(
          { event: "[GENERATION_CANDIDATE_UNMATCHED]", answer: candidate.answer },
          "candidate cited a source outside the offered article batch; skipping",
        );
        continue;
      }

      if (result.valid) return { candidate, article };

      childLogger.warn(
        {
          event: "[GENERATION_CANDIDATE_REJECTED]",
          answer: candidate.answer,
          articleId: article.id,
          reasons: result.reasons,
        },
        "candidate rejected",
      );
      await recordArticleRejection(article.id, result.reasons.join("; "), MAX_ARTICLE_REJECTIONS);
    }

    return null;
  } catch (err) {
    childLogger.error(
      { event: "[GENERATION_API_ERROR]", error: getErrorMessage(err) },
      "generation API call failed",
    );
    return null;
  }
}

async function callGenerationApiForPreview(
  dateKey: string,
  excludedAnswers: string[],
  feedItems: FeedItem[],
  systemPrompt: string,
  answerLength: number,
): Promise<{ candidates: CandidatePreview[]; llmError: string | null }> {
  try {
    const response = await chatCompletion({
      messages: buildMessages(dateKey, excludedAnswers, feedItems, systemPrompt, answerLength),
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
      llmError: getErrorMessage(err),
    };
  }
}

/** Preview generation against a live feed pull, bypassing the article inventory entirely. Used for prompt/tuning iteration only. */
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
    feedError = getErrorMessage(err);
  }

  const { candidates, llmError } = await callGenerationApiForPreview(
    dateKey,
    options.excludedAnswers ?? [],
    feedItems,
    options.systemPrompt ?? readSystemPrompt("app/lib/prompts/realitea-generation.md"),
    REALITEA_ANSWER_LENGTH,
  );

  const selectedIndex = candidates.findIndex((c) => c.validation.valid);

  return {
    dateKey,
    feedUrl,
    feedItemCount: feedItems.length,
    feedItems,
    candidates,
    selectedIndex: selectedIndex === -1 ? null : selectedIndex,
    feedError,
    llmError,
  };
}

/**
 * Generate (or return the existing) puzzle for `game` on `dateKey`, drawing
 * from that game's pending article backlog instead of a live feed pull.
 */
export async function generatePuzzleForGame(
  game: Game,
  dateKey: string,
): Promise<PuzzleRecord | null> {
  const childLogger = logger.child({ operation: "generatePuzzleForGame", game: game.slug, dateKey });

  const existing = await loadPuzzleForDate(game.id, dateKey);
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

  await expireStaleArticles(game, date);

  const [recentAnswers, inventoryAnswers, pendingArticles] = await Promise.all([
    getRecentAnswers(game, date),
    getStoredAnswers(game.id),
    getPendingArticlesForGame(game, GENERATION_BATCH_SIZE),
  ]);
  const excludedAnswers = [...new Set([...recentAnswers, ...inventoryAnswers])];

  if (pendingArticles.length === 0) {
    childLogger.error(
      { event: "[ARTICLE_BACKLOG_EMPTY]" },
      "no pending articles available, cannot generate puzzle",
    );
    return null;
  }

  const systemPrompt = readSystemPrompt(game.systemPromptPath);

  let result: { candidate: Candidate; article: Article } | null = null;
  for (let attempt = 0; attempt < 3 && !result; attempt++) {
    result = await callGenerationApi(game, dateKey, excludedAnswers, pendingArticles, systemPrompt);
    if (!result && attempt < 2) {
      const delayMs = Math.pow(2, attempt) * 1000;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  if (!result) {
    childLogger.error(
      { event: "[GENERATION_EXHAUSTED]" },
      "puzzle generation failed after all attempts",
    );
    return null;
  }

  const { candidate, article } = result;
  const now = new Date();

  const inserted = await db
    .insert(dailyPuzzles)
    .values({
      gameId: game.id,
      articleId: article.id,
      answer: candidate.answer,
      answerType: candidate.answerType as PuzzleAnswerType,
      clue: candidate.clue,
      createdAt: now,
      dateUtc: getDateKey(date),
      detail: candidate.detail,
      normalizedAnswer: normalizeGuess(candidate.answer),
      updatedAt: now,
    })
    .returning();

  await markArticleUsed(article.id);

  childLogger.info(
    { event: "[PUZZLE_GENERATED]", puzzle_id: inserted[0]?.id, answer: candidate.answer },
    "puzzle generated",
  );
  return { ...inserted[0], article } as PuzzleRecord;
}
