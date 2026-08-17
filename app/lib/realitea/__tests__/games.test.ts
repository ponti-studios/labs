import { db, gamesTopics } from "~/lib/server/db";
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

describe("getGameBySlug", () => {
  it("returns the game row when one exists", async () => {
    const game = await seedGame();
    const { getGameBySlug } = await import("../server/games.server");
    const result = await getGameBySlug("rhobh");
    expect(result).toEqual(game);
  });

  it("returns null when no game exists", async () => {
    const { getGameBySlug } = await import("../server/games.server");
    const result = await getGameBySlug("missing");
    expect(result).toBeNull();
  });
});

describe("getActiveGames", () => {
  it("returns only active games, alphabetized by name", async () => {
    await seedGame({ slug: "sports", name: "Sports", feedUrl: "https://example.com/sports" });
    await seedGame({ slug: "rhobh", name: "RHOBH", feedUrl: "https://example.com/rhobh" });
    await seedGame({
      slug: "retired",
      name: "Retired",
      feedUrl: "https://example.com/retired",
      active: false,
    });

    const { getActiveGames } = await import("../server/games.server");
    const result = await getActiveGames();

    expect(result.map((g) => g.slug)).toEqual(["rhobh", "sports"]);
  });
});

describe("listTopicFeedHosts", () => {
  it("returns deduped, www-stripped hostnames for active games only", async () => {
    await seedGame({ slug: "rhobh", name: "RHOBH", feedUrl: "https://www.realityblurb.com/feed" });
    await seedGame({ slug: "sports", name: "Sports", feedUrl: "https://realityblurb.com/sports" });
    await seedGame({
      slug: "retired",
      name: "Retired",
      feedUrl: "https://example.com/retired",
      active: false,
    });

    const { listTopicFeedHosts } = await import("../server/games.server");
    const result = await listTopicFeedHosts();

    expect(result).toEqual(["realityblurb.com", "realityblurb.com"]);
  });

  it("skips a feed URL that fails to parse instead of throwing", async () => {
    await seedGame({ slug: "rhobh", name: "RHOBH", feedUrl: "not-a-valid-url" });

    const { listTopicFeedHosts } = await import("../server/games.server");
    const result = await listTopicFeedHosts();

    expect(result).toEqual([]);
  });
});
