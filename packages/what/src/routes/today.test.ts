import { describe, expect, it, vi } from "vitest";

const { getWhatUserMock, getGameBySlugMock, getActiveGamesMock, loadActivePublicPuzzleWithAttemptMock } =
  vi.hoisted(() => ({
    getWhatUserMock: vi.fn(),
    getGameBySlugMock: vi.fn(),
    getActiveGamesMock: vi.fn(),
    loadActivePublicPuzzleWithAttemptMock: vi.fn(),
  }));

vi.mock("../server/auth", () => ({
  getWhatUser: getWhatUserMock,
  loginUrl: () => "https://api.ponti.io/login?next=https://what.example.com/",
}));

vi.mock("../lib/what/server/games.server", () => ({
  getGameBySlug: getGameBySlugMock,
  getActiveGames: getActiveGamesMock,
}));

vi.mock("../lib/what/server/puzzle.server", () => ({
  loadActivePublicPuzzleWithAttempt: loadActivePublicPuzzleWithAttemptMock,
}));

const PUZZLE = {
  answerType: "storyline" as const,
  clue: "clue",
  dateKey: "2026-05-20",
  detail: "detail",
  isFallback: false,
  sources: [{ url: "https://example.com", title: "Example", publishedAt: "2026-05-19T00:00:00.000Z" }],
};

async function importLoader() {
  const mod = await import("./today");
  return mod.loader;
}

function request(url: string) {
  return new Request(url);
}

describe("today route loader", () => {
  it("404s for a topic that isn't an active game", async () => {
    getGameBySlugMock.mockResolvedValueOnce(null);
    const loader = await importLoader();
    await expect(
      loader({
        request: request("https://what.example.com/rhobh"),
        params: { topic: "rhobh" },
        context: {} as never,
      } as never),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("returns the active puzzle with attempt and topic list for a signed-in user", async () => {
    getGameBySlugMock.mockResolvedValueOnce({ id: 1, slug: "rhobh", active: true });
    getWhatUserMock.mockResolvedValueOnce({ id: "user-1", email: null });
    getActiveGamesMock.mockResolvedValueOnce([{ slug: "rhobh", name: "Reality" }]);
    loadActivePublicPuzzleWithAttemptMock.mockResolvedValueOnce({
      puzzle: PUZZLE,
      attempt: { guesses: [], status: "playing" },
    } as never);

    const loader = await importLoader();
    const result = await loader({
      request: request("https://what.example.com/rhobh?tz=America/New_York"),
      params: { topic: "rhobh" },
      context: {} as never,
    } as never);

    expect(loadActivePublicPuzzleWithAttemptMock).toHaveBeenCalledWith(
      expect.any(Date),
      "America/New_York",
      { id: "user-1", email: null },
      "rhobh",
    );
    expect(result).toMatchObject({
      puzzle: PUZZLE,
      attempt: { guesses: [], status: "playing" },
      gameSlug: "rhobh",
      games: [{ slug: "rhobh", name: "Reality" }],
    } as never);
  });

  it("returns a null-puzzle empty state (not a 404) when no puzzle is available", async () => {
    getGameBySlugMock.mockResolvedValueOnce({ id: 1, slug: "rhobh", active: true });
    getWhatUserMock.mockResolvedValueOnce(null);
    getActiveGamesMock.mockResolvedValueOnce([]);
    loadActivePublicPuzzleWithAttemptMock.mockResolvedValueOnce(null);

    const loader = await importLoader();
    const result = await loader({
      request: request("https://what.example.com/rhobh"),
      params: { topic: "rhobh" },
      context: {} as never,
    } as never);

    expect(result).toMatchObject({ puzzle: null, gameSlug: "rhobh" });
  });

  it("defaults the time zone to UTC when no ?tz= param is present", async () => {
    getGameBySlugMock.mockResolvedValueOnce({ id: 1, slug: "rhobh", active: true });
    getWhatUserMock.mockResolvedValueOnce(null);
    getActiveGamesMock.mockResolvedValueOnce([]);
    loadActivePublicPuzzleWithAttemptMock.mockResolvedValueOnce({ puzzle: PUZZLE, attempt: null });

    const loader = await importLoader();
    await loader({
      request: request("https://what.example.com/rhobh"),
      params: { topic: "rhobh" },
      context: {} as never,
    } as never);

    expect(loadActivePublicPuzzleWithAttemptMock).toHaveBeenCalledWith(
      expect.any(Date),
      "UTC",
      null,
      "rhobh",
    );
  });
});
