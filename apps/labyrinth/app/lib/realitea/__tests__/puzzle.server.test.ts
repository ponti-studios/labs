import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@pontistudios/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@pontistudios/db")>();
  const { createTestDb, cleanAll } = await import("../../../../test-utils/test-db");
  const tables = {
    articles: actual.articles,
    caseUpdates: actual.caseUpdates,
    covidData: actual.covidData,
    dailyPuzzles: actual.dailyPuzzles,
    feedGames: actual.feedGames,
    feeds: actual.feeds,
    games: actual.games,
    searchDocuments: actual.searchDocuments,
    relationshipCases: actual.relationshipCases,
    relationshipVerdicts: actual.relationshipVerdicts,
    tflCameras: actual.tflCameras,
  };
  return { ...actual, db: createTestDb(tables), __cleanAll: cleanAll };
});

const isValidWordMock = vi.fn();

vi.mock("../../word-list.server", () => ({
  isValidWord: isValidWordMock,
}));

import { db, __cleanAll, dailyPuzzles, feedGames, articles, feeds, games } from "@pontistudios/db";

let gameId: number;
let feedId: number;

beforeEach(async () => {
  vi.clearAllMocks();

  await __cleanAll();

  const [game] = await db
    .insert(games)
    .values({ slug: "rhobh", name: "RHOBH", systemPromptPath: "prompts/rhobh.txt" })
    .returning();
  gameId = game.id;

  const [feed] = await db
    .insert(feeds)
    .values({ url: "https://example.com/feed", label: "Test Feed" })
    .returning();
  feedId = feed.id;

  await db.insert(feedGames).values({ feedId: feed.id, gameId: game.id });
});

async function seedPuzzle(overrides: Partial<{
  dateUtc: string;
  answer: string;
  normalizedAnswer: string;
  answerType: string;
  clue: string;
  detail: string;
}> = {}) {
  const [article] = await db
    .insert(articles)
    .values({
      feedId,
      url: `https://example.com/${overrides.answer ?? "erika"}`,
      title: `${overrides.answer ?? "Erika"} story`,
      publishedAt: new Date("2026-05-19T12:00:00.000Z"),
    })
    .returning();

  const [puzzle] = await db
    .insert(dailyPuzzles)
    .values({
      gameId,
      articleId: article.id,
      dateUtc: overrides.dateUtc ?? "2026-05-20",
      answer: overrides.answer ?? "ERIKA",
      answerType: (overrides.answerType as any) ?? "storyline",
      normalizedAnswer: overrides.normalizedAnswer ?? "ERIKA",
      clue: overrides.clue ?? "The Pretty Mess performer never misses a sharp confessional.",
      detail: overrides.detail ?? "Erika Jayne keeps the glam and pop-star energy turned all the way up.",
    })
    .returning();

  return { puzzle, article };
}

describe("loadActivePublicPuzzle", () => {
  it("loads today's puzzle when one exists", async () => {
    await seedPuzzle({ dateUtc: "2026-05-20", answer: "ERIKA" });

    const { loadActivePublicPuzzle } = await import("../puzzle.server");
    const envelope = await loadActivePublicPuzzle(new Date("2026-05-20T12:00:00.000Z"));

    expect(envelope).not.toBeNull();
    expect(envelope!.puzzle.dateKey).toBe("2026-05-20");
    expect(envelope!.puzzle.answerType).toBe("storyline");
    expect(envelope!.puzzle.clue).toBe(
      "The Pretty Mess performer never misses a sharp confessional.",
    );
  });

  it("falls back to the most recent puzzle when today's puzzle doesn't exist", async () => {
    await seedPuzzle({ dateUtc: "2026-05-19", answer: "DRAMA", answerType: "moment", clue: "A clash that keeps the whole cast spinning." });

    const { loadActivePublicPuzzle } = await import("../puzzle.server");
    const envelope = await loadActivePublicPuzzle(new Date("2026-05-20T12:00:00.000Z"));

    expect(envelope?.puzzle.dateKey).toBe("2026-05-19");
    expect(envelope?.puzzle.answerType).toBe("moment");
  });

  it("returns null when no puzzle exists at all", async () => {
    const { loadActivePublicPuzzle } = await import("../puzzle.server");
    const envelope = await loadActivePublicPuzzle(new Date("2026-05-20T12:00:00.000Z"));

    expect(envelope).toBeNull();
  });
});

describe("evaluateGuessServer", () => {
  it("rejects a word that is not the answer length", async () => {
    const { evaluateGuessServer } = await import("../puzzle.server");
    const result = await evaluateGuessServer("2026-05-20", "ABC", []);

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("wrong-length");
    expect(result.word).toBe("ABC");
  });

  it("rejects an already-guessed word before touching the database", async () => {
    isValidWordMock.mockResolvedValue(true);
    const { evaluateGuessServer } = await import("../puzzle.server");
    const result = await evaluateGuessServer("2026-05-20", "ERIKA", [{ word: "ERIKA" }]);

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("already-guessed");
  });

  it("returns not-in-word-list when the word is missing", async () => {
    isValidWordMock.mockResolvedValue(false);
    await seedPuzzle({ dateUtc: "2026-05-20", answer: "ERIKA" });

    const { evaluateGuessServer } = await import("../puzzle.server");
    const result = await evaluateGuessServer("2026-05-20", "ZZZZZ", []);

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("not-in-word-list");
  });

  it("returns not-in-word-list when no puzzle exists for the date", async () => {
    isValidWordMock.mockResolvedValue(true);

    const { evaluateGuessServer } = await import("../puzzle.server");
    const result = await evaluateGuessServer("2026-05-20", "ERIKA", []);

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("not-in-word-list");
  });

  it("evaluates a valid guess and returns per-letter states without the answer", async () => {
    isValidWordMock.mockResolvedValue(true);
    await seedPuzzle({ dateUtc: "2026-05-20", answer: "ERIKA", normalizedAnswer: "ERIKA" });

    const { evaluateGuessServer } = await import("../puzzle.server");
    const result = await evaluateGuessServer("2026-05-20", "ERIKA", []);

    expect(result.valid).toBe(true);
    expect(result.word).toBe("ERIKA");
    expect(result.states).toEqual(["correct", "correct", "correct", "correct", "correct"]);
    expect(result.isSolved).toBe(true);
    expect(result.isGameOver).toBe(true);
    expect(result.status).toBe("solved");
    expect((result as { answer?: string }).answer).toBeUndefined();
  });

  it("marks the game failed on the sixth valid guess that is not the answer", async () => {
    isValidWordMock.mockResolvedValue(true);
    await seedPuzzle({ dateUtc: "2026-05-20", answer: "ERIKA", normalizedAnswer: "ERIKA" });

    const { evaluateGuessServer } = await import("../puzzle.server");
    const previous = ["DORIT", "SUTTON", "KATHY", "ERIKA", "TILLY"].map((word) => ({ word }));
    const result = await evaluateGuessServer("2026-05-20", "KYLEE", previous);

    expect(result.valid).toBe(true);
    expect(result.isSolved).toBe(false);
    expect(result.isGameOver).toBe(true);
    expect(result.status).toBe("failed");
  });

  it("keeps the game playing while guesses remain", async () => {
    isValidWordMock.mockResolvedValue(true);
    await seedPuzzle({ dateUtc: "2026-05-20", answer: "ERIKA", normalizedAnswer: "ERIKA" });

    const { evaluateGuessServer } = await import("../puzzle.server");
    const result = await evaluateGuessServer("2026-05-20", "DORIT", []);

    expect(result.valid).toBe(true);
    expect(result.isSolved).toBe(false);
    expect(result.isGameOver).toBe(false);
    expect(result.status).toBe("playing");
  });
});
