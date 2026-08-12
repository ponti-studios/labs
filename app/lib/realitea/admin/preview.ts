import { DEFAULT_TEXT_MODEL, getConfiguredTextModel } from "~/lib/server/ai";
import { and, db, eq, generationCandidates, generationRuns, lt } from "~/lib/server/db";
import type { Article, GamesTopic } from "~/lib/server/db";
import type { HominemUser } from "~/lib/server/hominem-auth";

import { isDateKey, parseDate } from "../core/date";
import { PROMPT_TEST_FIXTURES } from "../fixtures/prompt-test-fixtures";
import {
  articleToFeedItem,
  getSystemPromptForGame,
  matchArticle,
  previewCandidates,
} from "../generation/generate.server";
import { fetchFeedItems } from "../generation/ingest.server";
import type { FeedItem } from "../generation/types";
import {
  countRecentPreviewActions,
  getPendingArticlesByIds,
  getPendingArticlesForGame,
  getPendingArticlesForTopics,
  getRecentAnswers,
  getStoredAnswers,
  listTopicFeedHosts,
  recordAdminAction,
} from "../server/repository.server";

const PREVIEW_RATE_LIMIT = 20;
const PREVIEW_ARTICLE_CAP = 12;
const GENERATION_BATCH_SIZE = 8;
const RUN_TTL_DAYS = 30;
const REAP_AFTER_MS = 10 * 60 * 1000;

export const PREVIEW_PROMPT_FILES = [
  "app/lib/prompts/realitea-generation.md",
  "app/lib/prompts/realitea-generation-v2.md",
] as const;

export function studioModelAllowlist(): string[] {
  return [...new Set([DEFAULT_TEXT_MODEL, getConfiguredTextModel()])];
}

export type PreviewSourceMode = "inventory" | "feeds" | "articles" | "rss" | "fixtures";

export type PreviewRequest = {
  dateKey: string;
  sourceMode: PreviewSourceMode;
  feedIds?: number[];
  articleIds?: number[];
  feedUrl?: string;
  fixtureId?: string;
  promptSource: "file" | "paste";
  promptPath?: string;
  promptText?: string;
  model?: string;
  compareGroupId?: string;
};

export type PreviewFeedUrlResult =
  | { ok: true; href: string }
  | { ok: false; code: "INVALID_URL" | "HTTP_NOT_ALLOWED" | "PRIVATE_HOST" | "HOST_NOT_ALLOWED" };

const PRIVATE_V4 = [
  /^127\./,
  /^10\./,
  /^0\./,
  /^169\.254\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
];

function isBlockedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (host === "localhost" || host.endsWith(".localhost") || host === "metadata.google.internal") {
    return true;
  }
  if (PRIVATE_V4.some((pattern) => pattern.test(host))) return true;
  if (host === "::1" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80:")) {
    return true;
  }
  return false;
}

function productionLock() {
  return process.env.NODE_ENV === "production" || Boolean(process.env.RAILWAY_ENVIRONMENT);
}

export async function assertPreviewFeedUrl(raw: string): Promise<PreviewFeedUrlResult> {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { ok: false, code: "INVALID_URL" };
  }
  if (parsed.protocol !== "https:") return { ok: false, code: "HTTP_NOT_ALLOWED" };
  if (isBlockedHostname(parsed.hostname)) return { ok: false, code: "PRIVATE_HOST" };
  if (productionLock()) {
    const allowed = new Set(await listTopicFeedHosts());
    const host = parsed.hostname.replace(/^www\./, "");
    if (!allowed.has(host) && !allowed.has(parsed.hostname)) {
      return { ok: false, code: "HOST_NOT_ALLOWED" };
    }
  }
  return { ok: true, href: parsed.href };
}

export async function expireGenerationRuns(olderThanDays = RUN_TTL_DAYS): Promise<number> {
  const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
  const deleted = await db
    .delete(generationRuns)
    .where(lt(generationRuns.createdAt, cutoff))
    .returning({ id: generationRuns.id });
  return deleted.length;
}

export async function reapStaleGenerationRuns(): Promise<number> {
  const cutoff = new Date(Date.now() - REAP_AFTER_MS);
  const updated = await db
    .update(generationRuns)
    .set({
      status: "failed",
      llmError: "reaped",
      finishedAt: new Date(),
    })
    .where(and(eq(generationRuns.status, "running"), lt(generationRuns.createdAt, cutoff)))
    .returning({ id: generationRuns.id });
  return updated.length;
}

export type PreviewStage = "prepare" | "articles" | "model" | "score" | "done";

export type PreviewProgressEvent = {
  type: "stage";
  stage: PreviewStage;
  label: string;
  detail: string;
};

export type PreviewCandidateView = {
  id: number;
  ordinal: number;
  valid: boolean;
  reasons: string[];
  articleId: number | null;
  articleTitle: string | null;
  articleUrl: string | null;
  candidate: {
    answer: string;
    answerType: string;
    clue: string;
    detail: string;
    sources: Array<{ url: string; title: string; publishedAt: string }>;
  };
};

export type PreviewOk = {
  ok: true;
  runId: number;
  publishable: boolean;
  model: string;
  promptSource: "file" | "paste";
  selectedIndex: number | null;
  feedError: string | null;
  llmError: string | null;
  articleCount: number;
  candidates: PreviewCandidateView[];
};

export type PreviewErr = {
  ok: false;
  code:
    | "INVALID_DATE"
    | "INVALID_PROMPT"
    | "INVALID_MODEL"
    | "RATE_LIMITED"
    | "INVALID_SOURCE"
    | "INVALID_URL"
    | "HTTP_NOT_ALLOWED"
    | "PRIVATE_HOST"
    | "HOST_NOT_ALLOWED";
  error: string;
};

export async function runPreview(
  game: GamesTopic,
  input: PreviewRequest,
  actor: HominemUser,
  onProgress?: (event: PreviewProgressEvent) => void,
): Promise<PreviewOk | PreviewErr> {
  const progress = onProgress ?? (() => {});
  progress({
    type: "stage",
    stage: "prepare",
    label: "Checking the request",
    detail: "Validating the date, prompt, and model.",
  });

  if (!isDateKey(input.dateKey)) {
    return { ok: false, code: "INVALID_DATE", error: "dateKey must be YYYY-MM-DD" };
  }

  const model = input.model ?? getConfiguredTextModel();
  if (!studioModelAllowlist().includes(model)) {
    return { ok: false, code: "INVALID_MODEL", error: `model is not on the studio allowlist` };
  }

  const prompt = resolvePrompt(game, input);
  if (!prompt.ok) return prompt;

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await countRecentPreviewActions(actor.id, hourAgo);
  if (recent >= PREVIEW_RATE_LIMIT) {
    return { ok: false, code: "RATE_LIMITED", error: "preview rate limit is 20 per hour" };
  }

  await reapStaleGenerationRuns();
  await expireGenerationRuns();

  progress({
    type: "stage",
    stage: "articles",
    label: "Gathering stories",
    detail:
      input.sourceMode === "rss"
        ? "Fetching the live feed."
        : input.sourceMode === "fixtures"
          ? "Loading the saved fixture."
          : "Pulling pending articles for this topic.",
  });

  const source = await resolveSource(game, input);
  if (!source.ok) return source;

  progress({
    type: "stage",
    stage: "articles",
    label: "Gathering stories",
    detail: `${source.feedItems.length} stor${source.feedItems.length === 1 ? "y" : "ies"} ready.`,
  });

  const date = parseDate(input.dateKey);
  const [recentAnswers, storedAnswers] = date
    ? await Promise.all([getRecentAnswers(game, date), getStoredAnswers(game.id)])
    : [new Set<string>(), await getStoredAnswers(game.id)];
  const excludedAnswers = [...new Set([...recentAnswers, ...storedAnswers])];

  const [run] = await db
    .insert(generationRuns)
    .values({
      gamesTopicId: game.id,
      dateKey: input.dateKey,
      status: "running",
      sourceMode: input.sourceMode,
      feedIds: input.feedIds ?? [],
      articleIds: input.articleIds ?? [],
      feedUrl: source.feedUrl,
      promptSource: prompt.promptSource,
      promptPath: prompt.promptPath,
      promptText: prompt.promptText,
      model,
      excludedAnswerCount: excludedAnswers.length,
      feedItemCount: source.feedItems.length,
      publishable: source.publishable,
      compareGroupId: input.compareGroupId,
      createdByHominemUserId: actor.id,
      createdByEmail: actor.email ?? null,
    })
    .returning();
  if (!run) return { ok: false, code: "INVALID_SOURCE", error: "failed to create preview run" };

  progress({
    type: "stage",
    stage: "model",
    label: "Asking the model",
    detail: `One completion on ${model}. This can take up to a minute.`,
  });

  const preview = await previewCandidates(input.dateKey, {
    feedItems: source.feedItems,
    feedUrl: source.feedUrl,
    systemPrompt: prompt.promptText,
    excludedAnswers,
    model,
  });

  progress({
    type: "stage",
    stage: "score",
    label: "Checking each word",
    detail: "Five letters, dictionary, leaks, and a matching story.",
  });

  const storedCandidates = preview.candidates.map((entry, ordinal) => {
    const article = source.publishable ? matchArticle(entry.candidate, source.articles) : null;
    const reasons = [...entry.validation.reasons];
    if (source.publishable && !article) reasons.push("unmatched-article");
    const valid = source.publishable
      ? entry.validation.valid && article !== null
      : entry.validation.valid;
    return {
      ordinal,
      payload: entry.candidate,
      normalizedAnswer: entry.validation.normalizedAnswer,
      valid,
      reasons,
      articleId: article?.id ?? null,
      articleTitle: article?.title ?? entry.candidate.sources[0]?.title ?? null,
      articleUrl: article?.url ?? entry.candidate.sources[0]?.url ?? null,
      candidate: entry.candidate,
    };
  });

  const inserted =
    storedCandidates.length === 0
      ? []
      : await db
          .insert(generationCandidates)
          .values(
            storedCandidates.map((candidate) => ({
              runId: run.id,
              ordinal: candidate.ordinal,
              payload: candidate.payload,
              normalizedAnswer: candidate.normalizedAnswer,
              valid: candidate.valid,
              reasons: candidate.reasons,
              articleId: candidate.articleId,
            })),
          )
          .returning();

  const selectedIndex = storedCandidates.findIndex((candidate) => candidate.valid);
  const failed = Boolean(preview.llmError || preview.feedError);
  await db
    .update(generationRuns)
    .set({
      status: failed ? "failed" : "succeeded",
      selectedIndex: selectedIndex === -1 ? null : selectedIndex,
      feedError: preview.feedError,
      llmError: preview.llmError,
      feedItemCount: preview.feedItemCount,
      finishedAt: new Date(),
    })
    .where(eq(generationRuns.id, run.id));

  await recordAdminAction({
    hominemUserId: actor.id,
    email: actor.email,
    kind: "preview",
    gamesTopicId: game.id,
    dateUtc: input.dateKey,
    payload: { sourceMode: input.sourceMode, model, runId: run.id },
    result: { candidateCount: storedCandidates.length, selectedIndex, failed },
  });

  progress({
    type: "stage",
    stage: "done",
    label: "Ready to review",
    detail: `${storedCandidates.filter((candidate) => candidate.valid).length} of ${storedCandidates.length} could become a puzzle.`,
  });

  return {
    ok: true,
    runId: run.id,
    publishable: source.publishable,
    model,
    promptSource: prompt.promptSource,
    selectedIndex: selectedIndex === -1 ? null : selectedIndex,
    feedError: preview.feedError,
    llmError: preview.llmError,
    articleCount: source.feedItems.length,
    candidates: inserted.map((row, index) => ({
      id: row.id,
      ordinal: row.ordinal,
      valid: row.valid,
      reasons: row.reasons,
      articleId: row.articleId,
      articleTitle: storedCandidates[index]?.articleTitle ?? null,
      articleUrl: storedCandidates[index]?.articleUrl ?? null,
      candidate: row.payload as PreviewOk["candidates"][number]["candidate"],
    })),
  };
}

function resolvePrompt(game: GamesTopic, input: PreviewRequest):
  | { ok: true; promptSource: "file" | "paste"; promptPath: string | null; promptText: string }
  | PreviewErr {
  if (input.promptSource === "paste") {
    const promptText = input.promptText?.trim() ?? "";
    if (promptText.length < 20) {
      return { ok: false, code: "INVALID_PROMPT", error: "pasted prompt is empty" };
    }
    return { ok: true, promptSource: "paste", promptPath: null, promptText };
  }
  const promptPath = input.promptPath ?? game.systemPromptPath;
  if (!PREVIEW_PROMPT_FILES.includes(promptPath as (typeof PREVIEW_PROMPT_FILES)[number])
    && promptPath !== game.systemPromptPath) {
    return { ok: false, code: "INVALID_PROMPT", error: "prompt file is not allowed" };
  }
  return {
    ok: true,
    promptSource: "file",
    promptPath,
    promptText: getSystemPromptForGame({ systemPromptPath: promptPath }),
  };
}

async function resolveSource(
  game: GamesTopic,
  input: PreviewRequest,
): Promise<
  | { ok: true; feedItems: FeedItem[]; articles: Article[]; feedUrl: string; publishable: boolean }
  | PreviewErr
> {
  if (input.sourceMode === "rss") {
    if (!input.feedUrl) return { ok: false, code: "INVALID_SOURCE", error: "feedUrl is required" };
    const allowed = await assertPreviewFeedUrl(input.feedUrl);
    if (!allowed.ok) return { ok: false, code: allowed.code, error: allowed.code };
    try {
      const feedItems = await fetchFeedItems(allowed.href);
      return { ok: true, feedItems, articles: [], feedUrl: allowed.href, publishable: false };
    } catch {
      return { ok: false, code: "INVALID_SOURCE", error: "failed to fetch RSS feed" };
    }
  }

  if (input.sourceMode === "fixtures") {
    const fixture = PROMPT_TEST_FIXTURES.find((entry) => entry.id === input.fixtureId);
    if (!fixture) return { ok: false, code: "INVALID_SOURCE", error: "unknown fixture id" };
    return {
      ok: true,
      feedItems: fixture.feedItems,
      articles: [],
      feedUrl: `fixture:${fixture.id}`,
      publishable: false,
    };
  }

  let articles: Article[] = [];
  if (input.sourceMode === "articles") {
    articles = await getPendingArticlesByIds(input.articleIds ?? [], PREVIEW_ARTICLE_CAP);
  } else if (input.sourceMode === "feeds") {
    articles = await getPendingArticlesForTopics(input.feedIds ?? [game.id], GENERATION_BATCH_SIZE);
  } else {
    articles = await getPendingArticlesForGame(game, GENERATION_BATCH_SIZE);
  }

  return {
    ok: true,
    feedItems: articles.map(articleToFeedItem),
    articles,
    feedUrl: game.feedUrl,
    publishable: true,
  };
}

