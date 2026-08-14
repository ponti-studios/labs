import { articles, gamesPuzzles, db, gamesTopics, gamesAttempts } from "~/lib/server/db";
import { beforeEach, describe, expect, it } from "vitest";
import { cleanAll } from "../../../data/test-db";

beforeEach(async () => {
  await cleanAll();
});

describe("getGameBySlug", () => {
  it("returns the game row when one exists", async () => {
    const [game] = await db
      .insert(gamesTopics)
      .values({ slug: "rhobh", name: "RHOBH", feedUrl: "https://example.com/feed", feedLabel: "Test Feed", systemPromptPath: "prompts/rhobh.txt" })
      .returning();
    const { getGameBySlug } = await import("../server/repository.server");
    const result = await getGameBySlug("rhobh");
    expect(result).toEqual(game);
  });

  it("returns null when no game exists", async () => {
    const { getGameBySlug } = await import("../server/repository.server");
    const result = await getGameBySlug("missing");
    expect(result).toBeNull();
  });
});

describe("loadPuzzleForDate", () => {
  it("joins the puzzle with its source article", async () => {
    const [game] = await db
      .insert(gamesTopics)
      .values({ slug: "rhobh", name: "RHOBH", feedUrl: "https://example.com/feed", feedLabel: "Test Feed", systemPromptPath: "prompts/rhobh.txt" })
      .returning();
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

    const { loadPuzzleForDate } = await import("../server/repository.server");
    const result = await loadPuzzleForDate(game.id, "2026-06-25");

    expect(result).toBeDefined();
    expect(result!.id).toBe(puzzle.id);
    expect(result!.answer).toBe("BRAVO");
    expect(result!.article).toBeDefined();
    expect(result!.article.url).toBe("https://example.com/a");
  });

  it("returns null when no puzzle exists for the date", async () => {
    const { loadPuzzleForDate } = await import("../server/repository.server");
    const result = await loadPuzzleForDate(999, "2026-06-25");
    expect(result).toBeNull();
  });
});

describe("getStoredAnswers", () => {
  it("returns a Set of normalizedAnswer values scoped to the game", async () => {
    const [game] = await db
      .insert(gamesTopics)
      .values({ slug: "rhobh", name: "RHOBH", feedUrl: "https://example.com/feed", feedLabel: "Test Feed", systemPromptPath: "prompts/rhobh.txt" })
      .returning();
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

    const { getStoredAnswers } = await import("../server/repository.server");
    const result = await getStoredAnswers(game.id);

    expect(result).toBeInstanceOf(Set);
    expect(result.has("BRAVO")).toBe(true);
    expect(result.has("DISCO")).toBe(true);
  });
});

describe("upsertArticles", () => {
  it("dedupes on url via onConflictDoNothing and returns the inserted count", async () => {
    const [game] = await db
      .insert(gamesTopics)
      .values({
        slug: "rhobh",
        name: "RHOBH",
        feedUrl: "https://example.com/feed",
        feedLabel: "Test Feed",
        systemPromptPath: "prompts/rhobh.txt",
      })
      .returning();

    const { upsertArticles } = await import("../server/repository.server");
    const result = await upsertArticles(game.id, [
      { url: "https://example.com/a", title: "A" },
      { url: "https://example.com/a", title: "A duplicate" },
    ]);

    expect(result).toBe(1);
  });

  it("returns 0 without querying when given no items", async () => {
    const { upsertArticles } = await import("../server/repository.server");
    const result = await upsertArticles(1, []);
    expect(result).toBe(0);
  });
});

describe("getExistingDateKeys", () => {
  it("returns date strings from rows scoped to the game", async () => {
    const [game] = await db
      .insert(gamesTopics)
      .values({ slug: "rhobh", name: "RHOBH", feedUrl: "https://example.com/feed", feedLabel: "Test Feed", systemPromptPath: "prompts/rhobh.txt" })
      .returning();
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
      dateUtc: "2026-06-26",
      answer: "BRAVO",
      answerType: "storyline",
      normalizedAnswer: "BRAVO",
      clue: "c1",
      detail: "d1",
    });
    await db.insert(gamesPuzzles).values({
      gamesTopicId: game.id,
      articleId: a2.id,
      dateUtc: "2026-06-27",
      answer: "DISCO",
      answerType: "place",
      normalizedAnswer: "DISCO",
      clue: "c2",
      detail: "d2",
    });

    const { getExistingDateKeys } = await import("../server/repository.server");
    const result = await getExistingDateKeys(game.id, "2026-06-26", "2026-06-27");

    expect(result).toEqual(["2026-06-26", "2026-06-27"]);
  });
});

describe("deletePuzzlesInRange", () => {
  it("does not delete a puzzle after the inclusive end of the window", async () => {
    const game = await seedGameWithPuzzles(["2026-08-13", "2026-08-14", "2026-08-15"]);
    const { deletePuzzlesInRange, getExistingDateKeys } = await import("../server/repository.server");
    const deleted = await deletePuzzlesInRange(game.id, "2026-08-13", "2026-08-14");
    expect(deleted).toBe(2);
    expect(await getExistingDateKeys(game.id, "2026-08-13", "2026-08-15")).toEqual(["2026-08-15"]);
  });
});

async function seedGameWithPuzzles(dateKeys: string[]) {
  const [game] = await db
    .insert(gamesTopics)
    .values({ slug: "rhobh", name: "RHOBH", feedUrl: "https://example.com/feed", feedLabel: "Test Feed", systemPromptPath: "prompts/rhobh.txt" })
    .returning();

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

describe("listAttemptsForUserInRange", () => {
  it("returns attempts within the range, newest date first, joined with their puzzle", async () => {
    const game = await seedGameWithPuzzles(["2026-06-25", "2026-06-26", "2026-06-27"]);
    await db.insert(gamesAttempts).values([
      { hominemUserId: "user-1", gamesTopicId: game.id, dateUtc: "2026-06-25", status: "solved" },
      { hominemUserId: "user-1", gamesTopicId: game.id, dateUtc: "2026-06-26", status: "failed" },
      { hominemUserId: "user-1", gamesTopicId: game.id, dateUtc: "2026-06-27", status: "playing" },
    ]);

    const { listAttemptsForUserInRange } = await import("../server/repository.server");
    const result = await listAttemptsForUserInRange("user-1", game.id, {
      fromKey: "2026-06-25",
      toKey: "2026-06-27",
    });

    expect(result.map((r) => r.attempt.dateUtc)).toEqual([
      "2026-06-27",
      "2026-06-26",
      "2026-06-25",
    ]);
    expect(result[0].puzzle.clue).toBe("clue for 2026-06-27");
  });

  it("excludes attempts outside the requested date window", async () => {
    const game = await seedGameWithPuzzles(["2026-06-25", "2026-06-26", "2026-06-27"]);
    await db.insert(gamesAttempts).values([
      { hominemUserId: "user-1", gamesTopicId: game.id, dateUtc: "2026-06-25", status: "solved" },
      { hominemUserId: "user-1", gamesTopicId: game.id, dateUtc: "2026-06-26", status: "solved" },
      { hominemUserId: "user-1", gamesTopicId: game.id, dateUtc: "2026-06-27", status: "solved" },
    ]);

    const { listAttemptsForUserInRange } = await import("../server/repository.server");
    const week1 = await listAttemptsForUserInRange("user-1", game.id, {
      fromKey: "2026-06-27",
      toKey: "2026-06-27",
    });
    const week2 = await listAttemptsForUserInRange("user-1", game.id, {
      fromKey: "2026-06-25",
      toKey: "2026-06-26",
    });

    expect(week1.map((r) => r.attempt.dateUtc)).toEqual(["2026-06-27"]);
    expect(week2.map((r) => r.attempt.dateUtc)).toEqual(["2026-06-26", "2026-06-25"]);
  });

  it("never leaks another user's attempts", async () => {
    const game = await seedGameWithPuzzles(["2026-06-25"]);
    await db.insert(gamesAttempts).values([
      { hominemUserId: "user-1", gamesTopicId: game.id, dateUtc: "2026-06-25", status: "solved" },
      { hominemUserId: "user-2", gamesTopicId: game.id, dateUtc: "2026-06-25", status: "solved" },
    ]);

    const { listAttemptsForUserInRange } = await import("../server/repository.server");
    const result = await listAttemptsForUserInRange("user-1", game.id, {
      fromKey: "2026-06-25",
      toKey: "2026-06-25",
    });

    expect(result).toHaveLength(1);
    expect(result[0].attempt.hominemUserId).toBe("user-1");
  });
});

describe("getEarliestPuzzleDateKey", () => {
  it("returns the earliest dateUtc for the game", async () => {
    const game = await seedGameWithPuzzles(["2026-06-26", "2026-06-25", "2026-06-27"]);

    const { getEarliestPuzzleDateKey } = await import("../server/repository.server");
    const result = await getEarliestPuzzleDateKey(game.id);

    expect(result).toBe("2026-06-25");
  });

  it("returns null when the game has no puzzles", async () => {
    const [game] = await db
      .insert(gamesTopics)
      .values({ slug: "rhobh", name: "RHOBH", feedUrl: "https://example.com/feed", feedLabel: "Test Feed", systemPromptPath: "prompts/rhobh.txt" })
      .returning();

    const { getEarliestPuzzleDateKey } = await import("../server/repository.server");
    const result = await getEarliestPuzzleDateKey(game.id);

    expect(result).toBeNull();
  });
});

describe("loadAllAttemptsForUser", () => {
  it("returns every attempt for the user, unpaginated, newest date first", async () => {
    const game = await seedGameWithPuzzles(["2026-06-25", "2026-06-26", "2026-06-27"]);
    await db.insert(gamesAttempts).values([
      { hominemUserId: "user-1", gamesTopicId: game.id, dateUtc: "2026-06-25", status: "solved" },
      { hominemUserId: "user-1", gamesTopicId: game.id, dateUtc: "2026-06-26", status: "failed" },
      { hominemUserId: "user-1", gamesTopicId: game.id, dateUtc: "2026-06-27", status: "playing" },
    ]);

    const { loadAllAttemptsForUser } = await import("../server/repository.server");
    const result = await loadAllAttemptsForUser("user-1", game.id);

    expect(result.map((r) => r.dateUtc)).toEqual(["2026-06-27", "2026-06-26", "2026-06-25"]);
  });

  it("returns an empty array when the user has no attempts", async () => {
    const game = await seedGameWithPuzzles([]);

    const { loadAllAttemptsForUser } = await import("../server/repository.server");
    const result = await loadAllAttemptsForUser("user-1", game.id);

    expect(result).toEqual([]);
  });
});

