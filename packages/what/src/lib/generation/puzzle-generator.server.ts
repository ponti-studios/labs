import { getConfiguredTextModel } from "@pontistudios/ai";
import { and, db, eq, gamesPuzzles, generationRuns } from "@pontistudios/db";
import type { Article, GamesTopic, ReasoningEffort } from "@pontistudios/db";
import { randomUUID } from "node:crypto";

import { getErrorMessage } from "../errors";
import { createLogger } from "../logger.server";
import { normalizeGuess, GAME_ANSWER_LENGTH } from "../puzzle/rules";
import { getDateKey, parseDate } from "../puzzle/date";
import { recordAdminAction } from "../data/admin-actions.server";
import {
  expireStaleArticles,
  getPendingArticlesForGame,
  markArticleUsed,
  recordArticleRejection,
} from "../data/articles.server";
import { getRecentAnswers, getStoredAnswers, loadPuzzleForDate } from "../data/puzzles.server";
import type { PuzzleAnswerType } from "../puzzle/types";
import type { PuzzleRecord } from "../data/types";
import type { GenerationUsage } from "./types";
import {
  articleToFeedItem,
  callGenerationApiForCandidates,
  detectRunEnvironment,
  getConfiguredMaxTokens,
  getConfiguredReasoningEffort,
  getSourceDomains,
  getSystemPromptForGame,
  matchArticle,
} from "./candidate-generator.server";

const GENERATION_BATCH_SIZE = 8;
const MAX_ARTICLE_REJECTIONS = 3;
const logger = createLogger();

async function recordGenerateFailure(
  gamesTopicId: number,
  dateKey: string,
  actor: string,
  code: string,
  extra: Record<string, unknown> = {},
) {
  await recordAdminAction({
    hominemUserId: actor,
    kind: "gap_fill_one",
    gamesTopicId,
    dateUtc: dateKey,
    payload: { code, ...extra },
  });
}

type GenerationAttempt = {
  candidate: Parameters<typeof matchArticle>[0] | null;
  article: Article | null;
  llmError: string | null;
  usage: GenerationUsage;
};

async function requestPuzzleCandidate(
  game: GamesTopic,
  dateKey: string,
  actor: string,
  excludedAnswers: string[],
  pendingArticles: Article[],
  systemPrompt: string,
  maxTokens: number,
  reasoningEffort: string | undefined,
): Promise<GenerationAttempt> {
  const childLogger = logger.child({
    operation: "requestPuzzleCandidate",
    game: game.slug,
    dateKey,
  });
  const sourceDomains = getSourceDomains(pendingArticles.map((article) => article.url));
  const { candidates, llmError, usage } = await callGenerationApiForCandidates(
    dateKey,
    excludedAnswers,
    pendingArticles.map(articleToFeedItem),
    systemPrompt,
    GAME_ANSWER_LENGTH,
    sourceDomains,
    getConfiguredTextModel(),
    maxTokens,
    reasoningEffort,
  );

  if (llmError) {
    childLogger.error(
      { event: "[GENERATION_API_ERROR]", error: llmError },
      "generation API call failed",
    );
    await recordGenerateFailure(game.id, dateKey, actor, "GENERATION_API_ERROR", {
      error: llmError,
    });
    return { candidate: null, article: null, llmError, usage };
  }

  try {
    for (const { candidate, validation } of candidates) {
      const article = matchArticle(candidate, pendingArticles);
      if (!article) {
        childLogger.warn(
          { event: "[GENERATION_CANDIDATE_UNMATCHED]", answer: candidate.answer },
          "candidate cited a source outside the offered article batch; skipping",
        );
        continue;
      }
      if (validation.valid) return { candidate, article, llmError: null, usage };

      childLogger.warn(
        {
          event: "[GENERATION_CANDIDATE_REJECTED]",
          answer: candidate.answer,
          articleId: article.id,
          reasons: validation.reasons,
        },
        "candidate rejected",
      );
      await recordArticleRejection(
        article.id,
        validation.reasons.join("; "),
        MAX_ARTICLE_REJECTIONS,
      );
    }
  } catch (err) {
    const matchError = getErrorMessage(err);
    childLogger.error(
      { event: "[GENERATION_MATCH_ERROR]", error: matchError },
      "candidate matching/scoring failed",
    );
    await recordGenerateFailure(game.id, dateKey, actor, "GENERATION_MATCH_ERROR", {
      error: matchError,
    });
    return { candidate: null, article: null, llmError: matchError, usage };
  }

  return { candidate: null, article: null, llmError: null, usage };
}

export type GeneratePuzzleForGameOptions = {
  maxAttempts?: number;
  actor?: string;
  maxTokens?: number;
  reasoningEffort?: string;
};

export async function generatePuzzleForGame(
  game: GamesTopic,
  dateKey: string,
  options: GeneratePuzzleForGameOptions = {},
): Promise<PuzzleRecord | null> {
  const maxAttempts = options.maxAttempts ?? 3;
  const actor = options.actor ?? "system:generate";
  const maxTokens = options.maxTokens ?? getConfiguredMaxTokens();
  const reasoningEffort = options.reasoningEffort ?? getConfiguredReasoningEffort();
  const compareGroupId = randomUUID();
  const runEnvironment = detectRunEnvironment();
  const childLogger = logger.child({
    operation: "generatePuzzleForGame",
    game: game.slug,
    dateKey,
  });

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
    await recordGenerateFailure(game.id, dateKey, actor, "ERROR_INVALID_DATEKEY");
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
    await recordGenerateFailure(game.id, dateKey, actor, "ARTICLE_BACKLOG_EMPTY");
    return null;
  }

  const systemPrompt = getSystemPromptForGame(game);
  childLogger.info(
    {
      event: "[GENERATION_CONFIG]",
      model: getConfiguredTextModel(),
      promptPath: game.systemPromptPath,
      articleTextCount: pendingArticles.filter((article) => Boolean(article.articleText)).length,
    },
    "using game generation configuration",
  );

  let result: { candidate: NonNullable<GenerationAttempt["candidate"]>; article: Article } | null =
    null;
  let winningRunId: number | null = null;
  for (let attempt = 0; attempt < maxAttempts && !result; attempt++) {
    const [run] = await db
      .insert(generationRuns)
      .values({
        gamesTopicId: game.id,
        dateKey,
        status: "running",
        sourceMode: "inventory",
        articleIds: pendingArticles.map((article) => article.id),
        promptSource: "file",
        promptPath: game.systemPromptPath,
        promptText: systemPrompt,
        model: getConfiguredTextModel(),
        excludedAnswerCount: excludedAnswers.length,
        feedItemCount: pendingArticles.length,
        publishable: true,
        compareGroupId,
        requestedMaxTokens: maxTokens,
        reasoningEffort: (reasoningEffort ?? "default") as ReasoningEffort,
        trigger: "cron",
        environment: runEnvironment,
        createdByHominemUserId: actor,
      })
      .returning();

    const attemptResult = await requestPuzzleCandidate(
      game,
      dateKey,
      actor,
      excludedAnswers,
      pendingArticles,
      systemPrompt,
      maxTokens,
      reasoningEffort,
    );

    if (run) {
      await db
        .update(generationRuns)
        .set({
          status: attemptResult.candidate ? "succeeded" : "failed",
          llmError: attemptResult.llmError,
          promptTokens: attemptResult.usage.promptTokens,
          completionTokens: attemptResult.usage.completionTokens,
          reasoningTokens: attemptResult.usage.reasoningTokens,
          totalTokens: attemptResult.usage.totalTokens,
          costUsd: attemptResult.usage.costUsd,
          finishedAt: new Date(),
        })
        .where(and(eq(generationRuns.id, run.id), eq(generationRuns.status, "running")));
    }

    if (attemptResult.candidate && attemptResult.article) {
      result = { candidate: attemptResult.candidate, article: attemptResult.article };
      winningRunId = run?.id ?? null;
      break;
    }
    if (attempt < maxAttempts - 1)
      await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 1000));
  }

  if (!result) {
    childLogger.error(
      { event: "[GENERATION_EXHAUSTED]" },
      "puzzle generation failed after all attempts",
    );
    await recordGenerateFailure(game.id, dateKey, actor, "GENERATION_EXHAUSTED", { maxAttempts });
    return null;
  }

  const { candidate, article } = result;
  const now = new Date();
  const [inserted] = await db
    .insert(gamesPuzzles)
    .values({
      gamesTopicId: game.id,
      articleId: article.id,
      answer: normalizeGuess(candidate.answer),
      answerType: candidate.answerType as PuzzleAnswerType,
      clue: candidate.clue,
      createdAt: now,
      dateUtc: getDateKey(date),
      detail: candidate.detail,
      normalizedAnswer: normalizeGuess(candidate.answer),
      promptPath: game.systemPromptPath,
      model: getConfiguredTextModel(),
      generationRunId: winningRunId,
      publishedAt: now,
      updatedAt: now,
    })
    .returning();

  await markArticleUsed(article.id);
  childLogger.info(
    { event: "[PUZZLE_GENERATED]", puzzle_id: inserted.id, answer: candidate.answer },
    "puzzle generated",
  );
  return { ...inserted, article } as PuzzleRecord;
}
