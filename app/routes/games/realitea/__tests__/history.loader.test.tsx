import type { LoaderFunctionArgs } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getHominemUserMock, loadPuzzleHistoryMock } = vi.hoisted(() => ({
  getHominemUserMock: vi.fn(),
  loadPuzzleHistoryMock: vi.fn(),
}));

vi.mock("~/lib/server/hominem-auth", () => ({
  getHominemUser: getHominemUserMock,
  buildHominemLoginUrl: (returnTo: string) => `https://api.ponti.io/login?next=${encodeURIComponent(returnTo)}`,
}));

vi.mock("~/lib/realitea/history.server", () => ({
  loadPuzzleHistory: loadPuzzleHistoryMock,
}));

function createLoaderArgs(url: string): LoaderFunctionArgs {
  const request = new Request(url);
  return { context: {}, params: {}, pattern: "", request, url: new URL(request.url) } as LoaderFunctionArgs;
}

describe("RealiTea history route loader", () => {
  beforeEach(() => {
    getHominemUserMock.mockReset();
    loadPuzzleHistoryMock.mockReset();
  });

  it("returns signedIn: false with a loginUrl when there's no session, without querying history", async () => {
    getHominemUserMock.mockResolvedValue(null);

    const { loader } = await import("../history");
    const response = await loader(createLoaderArgs("https://labs.ponti.io/games/realitea/history"));
    const payload = await response.json();

    expect(payload.signedIn).toBe(false);
    expect(payload.loginUrl).toContain("labs.ponti.io%2Fgames%2Frealitea%2Fhistory");
    expect(loadPuzzleHistoryMock).not.toHaveBeenCalled();
  });

  it("loads history for the signed-in user, defaulting to page 1", async () => {
    getHominemUserMock.mockResolvedValue({ id: "user-1", email: "a@b.com" });
    loadPuzzleHistoryMock.mockResolvedValue({
      rows: [],
      page: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
      weekStartKey: "2026-07-23",
      weekEndKey: "2026-07-29",
      stats: { gamesPlayed: 0, gamesSolved: 0, winRate: 0, currentStreak: 0, maxStreak: 0, guessDistribution: {} },
      playableUnplayedDateKeys: [],
    });

    const { loader } = await import("../history");
    const response = await loader(createLoaderArgs("https://labs.ponti.io/games/realitea/history"));
    const payload = await response.json();

    expect(payload.signedIn).toBe(true);
    expect(loadPuzzleHistoryMock).toHaveBeenCalledWith("user-1", { page: 1 });
  });

  it("parses the page search param", async () => {
    getHominemUserMock.mockResolvedValue({ id: "user-1", email: "a@b.com" });
    loadPuzzleHistoryMock.mockResolvedValue({
      rows: [],
      page: 3,
      totalPages: 3,
      hasNext: false,
      hasPrev: true,
      weekStartKey: "2026-07-09",
      weekEndKey: "2026-07-15",
      stats: { gamesPlayed: 0, gamesSolved: 0, winRate: 0, currentStreak: 0, maxStreak: 0, guessDistribution: {} },
      playableUnplayedDateKeys: [],
    });

    const { loader } = await import("../history");
    await loader(createLoaderArgs("https://labs.ponti.io/games/realitea/history?page=3"));

    expect(loadPuzzleHistoryMock).toHaveBeenCalledWith("user-1", { page: 3 });
  });

  it("falls back to page 1 for an invalid page param", async () => {
    getHominemUserMock.mockResolvedValue({ id: "user-1", email: "a@b.com" });
    loadPuzzleHistoryMock.mockResolvedValue({
      rows: [],
      page: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
      weekStartKey: "2026-07-23",
      weekEndKey: "2026-07-29",
      stats: { gamesPlayed: 0, gamesSolved: 0, winRate: 0, currentStreak: 0, maxStreak: 0, guessDistribution: {} },
      playableUnplayedDateKeys: [],
    });

    const { loader } = await import("../history");
    await loader(createLoaderArgs("https://labs.ponti.io/games/realitea/history?page=not-a-number"));

    expect(loadPuzzleHistoryMock).toHaveBeenCalledWith("user-1", { page: 1 });
  });
});
