import { describe, expect, it, vi } from "vitest";

const { getWhatUserMock, getGameBySlugMock, loadPuzzleHistoryMock } = vi.hoisted(() => ({
  getWhatUserMock: vi.fn(),
  getGameBySlugMock: vi.fn(),
  loadPuzzleHistoryMock: vi.fn(),
}));

vi.mock("../server/auth", () => ({
  getWhatUser: getWhatUserMock,
  loginUrl: () => "https://api.ponti.io/login?next=https://what.example.com/rhobh/history",
}));

vi.mock("../lib/what/server/games.server", () => ({
  getGameBySlug: getGameBySlugMock,
}));

vi.mock("../lib/what/server/history.server", () => ({
  loadPuzzleHistory: loadPuzzleHistoryMock,
}));

async function importLoader() {
  const mod = await import("./history");
  return mod.loader;
}

function request(url: string) {
  return new Request(url);
}

describe("history route loader", () => {
  it("404s for an unknown topic", async () => {
    getGameBySlugMock.mockResolvedValueOnce(null);
    const loader = await importLoader();
    await expect(
      loader({
        request: request("https://what.example.com/rhobh/history"),
        params: { topic: "rhobh" },
        context: {} as never,
      } as never),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("returns signedIn false with a login URL for anonymous visitors", async () => {
    getGameBySlugMock.mockResolvedValueOnce({ id: 1, slug: "rhobh", active: true });
    getWhatUserMock.mockResolvedValueOnce(null);
    const loader = await importLoader();
    const result = await loader({
      request: request("https://what.example.com/rhobh/history"),
      params: { topic: "rhobh" },
      context: {} as never,
    } as never);
    expect(result).toMatchObject({ signedIn: false });
    expect(loadPuzzleHistoryMock).not.toHaveBeenCalled();
  });

  it("paginates via ?page= for a signed-in user", async () => {
    getGameBySlugMock.mockResolvedValueOnce({ id: 1, slug: "rhobh", active: true });
    getWhatUserMock.mockResolvedValueOnce({ id: "user-1", email: null });
    loadPuzzleHistoryMock.mockResolvedValueOnce({
      rows: [],
      page: 2,
      totalPages: 3,
      hasNext: true,
      hasPrev: true,
      weekStartKey: "2026-05-08",
      weekEndKey: "2026-05-14",
      stats: {
        gamesPlayed: 0,
        gamesSolved: 0,
        winRate: 0,
        currentStreak: 0,
        maxStreak: 0,
        guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
      },
      playableUnplayedDateKeys: [],
    } as never);

    const loader = await importLoader();
    const result = await loader({
      request: request("https://what.example.com/rhobh/history?page=2"),
      params: { topic: "rhobh" },
      context: {} as never,
    } as never);

    expect(loadPuzzleHistoryMock).toHaveBeenCalledWith("user-1", { page: 2 }, "rhobh");
    expect(result).toMatchObject({ signedIn: true, gameSlug: "rhobh" });
  });

  it("falls back to page 1 for an invalid ?page= value", async () => {
    getGameBySlugMock.mockResolvedValueOnce({ id: 1, slug: "rhobh", active: true });
    getWhatUserMock.mockResolvedValueOnce({ id: "user-1", email: null });
    loadPuzzleHistoryMock.mockResolvedValueOnce({
      rows: [],
      page: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
      weekStartKey: "2026-05-14",
      weekEndKey: "2026-05-20",
      stats: {
        gamesPlayed: 0,
        gamesSolved: 0,
        winRate: 0,
        currentStreak: 0,
        maxStreak: 0,
        guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
      },
      playableUnplayedDateKeys: [],
    } as never);

    const loader = await importLoader();
    await loader({
      request: request("https://what.example.com/rhobh/history?page=not-a-number"),
      params: { topic: "rhobh" },
      context: {} as never,
    } as never);

    expect(loadPuzzleHistoryMock).toHaveBeenCalledWith("user-1", { page: 1 }, "rhobh");
  });
});
