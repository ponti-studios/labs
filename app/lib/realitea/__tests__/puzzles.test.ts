import { articles, gamesPuzzles, db, gamesTopics } from "~/lib/server/db";
import { beforeEach, describe, expect, it } from "vitest";
import { cleanAll } from "../../../data/test-db";

beforeEach(async () => {
  await cleanAll();
});

async function seedGame(overrides: Partial<typeof gamesTopics.$inferInsert> = {}) {
  const [game] = await db
    .insert(gamesTopics)
    .values({
      slug: "rhobh",
      name: "RHOBH",
      feedUrl: "https://example.com/feed",
      feedLabel: "Test Feed",
      systemPromptPath: "prompts/rhobh.txt",
      ...overrides,
    })
    .returning();
  return game;
}

async function seedGameWithPuzzles(
  dateKeys: string[],
  overrides: Partial<typeof gamesTopics.$inferInsert> = {},
) {
  const game = await seedGame(overrides);
  for (const dateKey of dateKeys) {
    const [article] = await db
      .insert(articles)
      .values({ gamesTopicId: game.id, url: `https://example.com/${dateKey}`, title: dateKey })
      .returning();
    await db.insert(gamesPuzzles).values({
      gamesTopicId: game.id,
      articleId: article.id,
      dateUtc: dateKey,
      answer: "BRAVO",
      answerType: "storyline",
      normalizedAnswer: "BRAVO",
      clue: `clue for ${dateKey}`,
      detail: `detail for ${dateKey}`,
    });
  }
  return game;
}

describe("loadPuzzleForDate", () => {
  it("joins the puzzle with its source article", async () => {
    const game = await seedGame();
    const [article] = await db
      .insert(articles)
      .values({ gamesTopicId: game.id, url: "https://example.com/a", title: "Article A" })
      .returning();
    const [puzzle] = await db
      .insert(gamesPuzzles)
      .values({
        gamesTopicId: game.id,
        articleId: article.id,
        dateUtc: "2026-06-25",
        answer: "BRAVO",
        answerType: "storyline",
        normalizedAnswer: "BRAVO",
        clue: "Clue text",
        detail: "Detail text",
      })
      .returning();

    const { loadPuzzleForDate } = await import("../server/puzzles.server");
    const result = await loadPuzzleForDate(game.id, "2026-06-25");

    expect(result).toBeDefined();
    expect(result!.id).toBe(puzzle.id);
    expect(result!.answer).toBe("BRAVO");
    expect(result!.article).toBeDefined();
    expect(result!.article.url).toBe("https://example.com/a");
  });

  it("returns null when no puzzle exists for the date", async () => {
    const { loadPuzzleForDate } = await import("../server/puzzles.server");
    const result = await loadPuzzleForDate(999, "2026-06-25");
    expect(result).toBeNull();
  });
});

describe("loadMostRecentPuzzle", () => {
  it("returns the most recently created puzzle, unbounded", async () => {
    const game = await seedGameWithPuzzles(["2026-06-25", "2026-06-26"]);

    const { loadMostRecentPuzzle } = await import("../server/puzzles.server");
    const result = await loadMostRecentPuzzle(game.id);

    expect(result?.dateUtc).toBe("2026-06-26");
  });

  it("bounds to dateUtc <= dateKey when supplied", async () => {
    const game = await seedGameWithPuzzles(["2026-06-25", "2026-06-27"]);

    const { loadMostRecentPuzzle } = await import("../server/puzzles.server");
    const result = await loadMostRecentPuzzle(game.id, "2026-06-26");

    expect(result?.dateUtc).toBe("2026-06-25");
  });
});

describe("getStoredAnswers", () => {
  it("returns a Set of normalizedAnswer values scoped to the game", async () => {
    const game = await seedGame();
    const [a1] = await db
      .insert(articles)
      .values({ gamesTopicId: game.id, url: "https://example.com/1", title: "One" })
      .returning();
    const [a2] = await db
      .insert(articles)
      .values({ gamesTopicId: game.id, url: "https://example.com/2", title: "Two" })
      .returning();
    await db.insert(gamesPuzzles).values({
      gamesTopicId: game.id,
      articleId: a1.id,
      dateUtc: "2026-06-25",
      answer: "BRAVO",
      answerType: "storyline",
      normalizedAnswer: "BRAVO",
      clue: "c1",
      detail: "d1",
    });
    await db.insert(gamesPuzzles).values({
      gamesTopicId: game.id,
      articleId: a2.id,
      dateUtc: "2026-06-26",
      answer: "DISCO",
      answerType: "place",
      normalizedAnswer: "DISCO",
      clue: "c2",
      detail: "d2",
    });

    const { getStoredAnswers } = await import("../server/puzzles.server");
    const result = await getStoredAnswers(game.id);

    expect(result).toBeInstanceOf(Set);
    expect(result.has("BRAVO")).toBe(true);
    expect(result.has("DISCO")).toBe(true);
  });
});

describe("getRecentAnswers", () => {
  it("only includes answers within the game's repeat-cooldown window", async () => {
    const game = await seedGame({ repeatWindowDays: 10 });
    const [a1] = await db
      .insert(articles)
      .values({ gamesTopicId: game.id, url: "https://example.com/1", title: "One" })
      .returning();
    const [a2] = await db
      .insert(articles)
      .values({ gamesTopicId: game.id, url: "https://example.com/2", title: "Two" })
      .returning();
    await db.insert(gamesPuzzles).values({
      gamesTopicId: game.id,
      articleId: a1.id,
      dateUtc: "2026-06-01",
      answer: "STALE",
      answerType: "storyline",
      normalizedAnswer: "STALE",
      clue: "c1",
      detail: "d1",
    });
    await db.insert(gamesPuzzles).values({
      gamesTopicId: game.id,
      articleId: a2.id,
      dateUtc: "2026-06-19",
      answer: "FRESH",
      answerType: "storyline",
      normalizedAnswer: "FRESH",
      clue: "c2",
      detail: "d2",
    });

    const { getRecentAnswers } = await import("../server/puzzles.server");
    const result = await getRecentAnswers(game, new Date("2026-06-25T00:00:00.000Z"));

    expect(result.has("FRESH")).toBe(true);
    expect(result.has("STALE")).toBe(false);
  });
});

describe("countInventoryForRange", () => {
  it("counts puzzles strictly after fromDateKey within the window", async () => {
    const game = await seedGameWithPuzzles(["2026-08-13", "2026-08-14", "2026-08-16"]);

    const { countInventoryForRange } = await import("../server/puzzles.server");
    const result = await countInventoryForRange(game.id, "2026-08-13", 5);

    expect(result).toBe(2);
  });
});

describe("getExistingDateKeys", () => {
  it("returns date strings from rows scoped to the game", async () => {
    const game = await seedGameWithPuzzles(["2026-06-26", "2026-06-27"]);

    const { getExistingDateKeys } = await import("../server/puzzles.server");
    const result = await getExistingDateKeys(game.id, "2026-06-26", "2026-06-27");

    expect(result).toEqual(["2026-06-26", "2026-06-27"]);
  });
});

describe("listAllPuzzleDateKeys", () => {
  it("returns every date for the game, oldest first", async () => {
    const game = await seedGameWithPuzzles(["2026-06-27", "2026-06-25", "2026-06-26"]);

    const { listAllPuzzleDateKeys } = await import("../server/puzzles.server");
    const result = await listAllPuzzleDateKeys(game.id);

    expect(result).toEqual(["2026-06-25", "2026-06-26", "2026-06-27"]);
  });
});

describe("deletePuzzlesInRange", () => {
  it("does not delete a puzzle after the inclusive end of the window", async () => {
    const game = await seedGameWithPuzzles(["2026-08-13", "2026-08-14", "2026-08-15"]);
    const { deletePuzzlesInRange, getExistingDateKeys } = await import("../server/puzzles.server");
    const deleted = await deletePuzzlesInRange(game.id, "2026-08-13", "2026-08-14");
    expect(deleted).toBe(2);
    expect(await getExistingDateKeys(game.id, "2026-08-13", "2026-08-15")).toEqual(["2026-08-15"]);
  });
});

describe("getEarliestPuzzleDateKey", () => {
  it("returns the earliest dateUtc for the game", async () => {
    const game = await seedGameWithPuzzles(["2026-06-26", "2026-06-25", "2026-06-27"]);

    const { getEarliestPuzzleDateKey } = await import("../server/puzzles.server");
    const result = await getEarliestPuzzleDateKey(game.id);

    expect(result).toBe("2026-06-25");
  });

  it("returns null when the game has no puzzles", async () => {
    const game = await seedGame();

    const { getEarliestPuzzleDateKey } = await import("../server/puzzles.server");
    const result = await getEarliestPuzzleDateKey(game.id);

    expect(result).toBeNull();
  });
});

describe("backfillPuzzlePublishedAt", () => {
  it("sets publishedAt to createdAt only for rows where it is null", async () => {
    const game = await seedGameWithPuzzles(["2026-06-25"]);
    const [already] = await db
      .insert(articles)
      .values({ gamesTopicId: game.id, url: "https://example.com/already", title: "Already" })
      .returning();
    const explicitPublishedAt = new Date("2020-01-01T00:00:00.000Z");
    await db.insert(gamesPuzzles).values({
      gamesTopicId: game.id,
      articleId: already.id,
      dateUtc: "2026-06-26",
      answer: "FIXED",
      answerType: "storyline",
      normalizedAnswer: "FIXED",
      clue: "c",
      detail: "d",
      publishedAt: explicitPublishedAt,
    });

    const { backfillPuzzlePublishedAt } = await import("../server/puzzles.server");
    const updated = await backfillPuzzlePublishedAt();

    expect(updated).toBe(1);
    const rows = await db.select().from(gamesPuzzles).orderBy(gamesPuzzles.dateUtc);
    expect(rows[0]?.publishedAt).not.toBeNull();
    expect(rows[1]?.publishedAt?.toISOString()).toBe(explicitPublishedAt.toISOString());
  });
});
