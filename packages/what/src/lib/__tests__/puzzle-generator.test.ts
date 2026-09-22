import { describe, expect, it, vi } from "vitest";

const {
  callGenerationApiForCandidatesMock,
  getPendingArticlesForGameMock,
  loadPuzzleForDateMock,
  markArticleUsedMock,
  recordArticleRejectionMock,
  recordGenerateFailureMock,
} = vi.hoisted(() => ({
  callGenerationApiForCandidatesMock: vi.fn(),
  getPendingArticlesForGameMock: vi.fn(),
  loadPuzzleForDateMock: vi.fn(),
  markArticleUsedMock: vi.fn(),
  recordArticleRejectionMock: vi.fn(),
  recordGenerateFailureMock: vi.fn(),
}));

vi.mock("../data/puzzles.server", () => ({
  loadPuzzleForDate: loadPuzzleForDateMock,
  getRecentAnswers: vi.fn().mockResolvedValue(new Set()),
  getStoredAnswers: vi.fn().mockResolvedValue(new Set()),
}));

vi.mock("../data/articles.server", () => ({
  expireStaleArticles: vi.fn().mockResolvedValue(0),
  getPendingArticlesForGame: getPendingArticlesForGameMock,
  markArticleUsed: markArticleUsedMock,
  recordArticleRejection: recordArticleRejectionMock,
}));

vi.mock("../data/admin-actions.server", () => ({
  recordAdminAction: recordGenerateFailureMock,
}));

vi.mock("../generation/candidate-generator.server", async () => {
  const actual = await vi.importActual<typeof import("../generation/candidate-generator.server")>(
    "../generation/candidate-generator.server",
  );
  return {
    ...actual,
    callGenerationApiForCandidates: callGenerationApiForCandidatesMock,
  };
});

vi.mock("@pontistudios/db", async () => {
  const actual = await vi.importActual<typeof import("@pontistudios/db")>("@pontistudios/db");
  return {
    ...actual,
    db: {
      ...actual.db,
      insert: vi.fn().mockImplementation((table) => ({
        values: vi.fn().mockImplementation((values) => {
          if (table === actual.gamesPuzzles) {
            const row = Array.isArray(values) ? values[0] : values;
            return {
              returning: vi.fn().mockResolvedValue([
                {
                  id: 1,
                  gamesTopicId: row.gamesTopicId,
                  articleId: row.articleId,
                  dateUtc: row.dateUtc,
                  answer: row.answer,
                  normalizedAnswer: row.normalizedAnswer,
                  answerType: row.answerType,
                  clue: row.clue,
                  detail: row.detail,
                  promptPath: row.promptPath,
                  model: row.model,
                  generationRunId: row.generationRunId,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  publishedAt: new Date(),
                },
              ]),
            };
          }
          return { returning: vi.fn().mockResolvedValue([{ id: 1 }]) };
        }),
      })),
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn().mockResolvedValue(undefined),
        })),
      })),
    },
  };
});

import { generatePuzzleForGame } from "../generation/puzzle-generator.server";

function makeArticle(id: number, url: string) {
  return {
    id,
    gamesTopicId: 1,
    url,
    title: `Article ${id}`,
    description: null,
    articleText: null,
    imageUrl: null,
    publishedAt: new Date(),
    status: "pending" as const,
    rejectionCount: 0,
    rejectionReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function makeCandidate(answer: string, url: string) {
  return {
    answer,
    answerType: "storyline",
    articleAbout: "about",
    concept: "concept",
    answerMeaning: "meaning",
    relationship: "direct-summary" as const,
    clue: "A one-sentence clue.",
    detail: "A concrete post-solve synopsis supported by the source.",
    sources: [{ url, title: "Article", publishedAt: "2026-09-23T00:00:00Z" }],
  };
}

function makeAttemptResult(
  candidates: {
    candidate: ReturnType<typeof makeCandidate>;
    validation: { answer: string; reasons: string[]; valid: boolean };
  }[],
) {
  return {
    candidates,
    llmError: null,
    usage: {
      requestedMaxTokens: 4000,
      reasoningEffort: null,
      promptTokens: null,
      completionTokens: null,
      reasoningTokens: null,
      totalTokens: null,
      costUsd: null,
    },
  };
}

const GAME = {
  id: 1,
  slug: "reality",
  name: "Reality",
  systemPromptPath: "src/prompts/game-generation.md",
  repeatWindowDays: 30,
  articleExpiryDays: 30,
} as Parameters<typeof generatePuzzleForGame>[0];

describe("generatePuzzleForGame", () => {
  it("refreshes the article batch between failed attempts", async () => {
    const firstBatch = [makeArticle(1, "https://example.com/1")];
    const secondBatch = [makeArticle(2, "https://example.com/2")];

    loadPuzzleForDateMock.mockResolvedValue(null);
    getPendingArticlesForGameMock
      .mockResolvedValueOnce(firstBatch)
      .mockResolvedValueOnce(secondBatch);

    callGenerationApiForCandidatesMock
      .mockResolvedValueOnce(
        makeAttemptResult([
          {
            candidate: makeCandidate("ABCDE", "https://example.com/1"),
            validation: { answer: "ABCDE", reasons: ["not-letters"], valid: false },
          },
        ]),
      )
      .mockResolvedValueOnce(
        makeAttemptResult([
          {
            candidate: makeCandidate("VALID", "https://example.com/2"),
            validation: { answer: "VALID", reasons: [], valid: true },
          },
        ]),
      );

    const puzzle = await generatePuzzleForGame(GAME, "2026-09-23", { maxAttempts: 2 });

    expect(puzzle).not.toBeNull();
    expect(getPendingArticlesForGameMock).toHaveBeenCalledTimes(2);
    expect(callGenerationApiForCandidatesMock).toHaveBeenCalledTimes(2);
  });

  it("falls back to the original batch when no refreshed articles are available", async () => {
    const firstBatch = [makeArticle(1, "https://example.com/1")];

    loadPuzzleForDateMock.mockResolvedValue(null);
    getPendingArticlesForGameMock
      .mockResolvedValueOnce(firstBatch)
      .mockResolvedValueOnce([]);

    callGenerationApiForCandidatesMock
      .mockResolvedValueOnce(
        makeAttemptResult([
          {
            candidate: makeCandidate("ABCDE", "https://example.com/1"),
            validation: { answer: "ABCDE", reasons: ["not-letters"], valid: false },
          },
        ]),
      )
      .mockResolvedValueOnce(
        makeAttemptResult([
          {
            candidate: makeCandidate("VALID", "https://example.com/1"),
            validation: { answer: "VALID", reasons: [], valid: true },
          },
        ]),
      );

    const puzzle = await generatePuzzleForGame(GAME, "2026-09-23", { maxAttempts: 2 });

    expect(puzzle).not.toBeNull();
    expect(getPendingArticlesForGameMock).toHaveBeenCalledTimes(2);
  });
});
