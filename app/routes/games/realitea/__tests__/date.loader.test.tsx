import type { LoaderFunctionArgs } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getHominemUserMock, loadPuzzleForSpecificDateMock } = vi.hoisted(() => ({
  getHominemUserMock: vi.fn(),
  loadPuzzleForSpecificDateMock: vi.fn(),
}));

vi.mock("~/lib/server/hominem-auth", () => ({
  getHominemUser: getHominemUserMock,
  buildHominemLoginUrl: (returnTo: string) =>
    `https://api.ponti.io/login?next=${encodeURIComponent(returnTo)}`,
}));

vi.mock("~/lib/realitea/puzzle.server", () => ({
  loadPuzzleForSpecificDate: loadPuzzleForSpecificDateMock,
}));

function createLoaderArgs(url: string, date?: string): LoaderFunctionArgs {
  const request = new Request(url);
  return {
    context: {},
    params: date !== undefined ? { date } : {},
    pattern: "",
    request,
    url: new URL(request.url),
  } as LoaderFunctionArgs;
}

const PUZZLE = {
  answerType: "storyline",
  clue: "A clash that keeps the whole cast spinning.",
  dateKey: "2026-05-20",
  detail: "The full story.",
  sources: [],
};

describe("RealiTea date route loader", () => {
  beforeEach(() => {
    getHominemUserMock.mockReset();
    loadPuzzleForSpecificDateMock.mockReset();
  });

  it("400s on a malformed date param without touching the puzzle lookup", async () => {
    const { loader } = await import("../date.$date");

    await expect(
      loader(createLoaderArgs("https://labs.ponti.io/games/realitea/not-a-date", "not-a-date")),
    ).rejects.toMatchObject({ status: 400 });
    expect(loadPuzzleForSpecificDateMock).not.toHaveBeenCalled();
  });

  it("400s when the date param is missing entirely", async () => {
    const { loader } = await import("../date.$date");

    await expect(
      loader(createLoaderArgs("https://labs.ponti.io/games/realitea/")),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("404s when no puzzle exists for that date", async () => {
    getHominemUserMock.mockResolvedValue(null);
    loadPuzzleForSpecificDateMock.mockResolvedValue(null);

    const { loader } = await import("../date.$date");

    await expect(
      loader(createLoaderArgs("https://labs.ponti.io/games/realitea/2026-05-20", "2026-05-20")),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("returns signedIn: false for an anonymous visitor, with the puzzle and no attempt", async () => {
    getHominemUserMock.mockResolvedValue(null);
    loadPuzzleForSpecificDateMock.mockResolvedValue({ puzzle: PUZZLE, attempt: null });

    const { loader } = await import("../date.$date");
    const response = await loader(
      createLoaderArgs("https://labs.ponti.io/games/realitea/2026-05-20", "2026-05-20"),
    );
    const payload = await response.json();

    expect(payload.signedIn).toBe(false);
    expect(payload.puzzle.dateKey).toBe("2026-05-20");
    expect(payload.attempt).toBeNull();
    expect(loadPuzzleForSpecificDateMock).toHaveBeenCalledWith("2026-05-20", null);
  });

  it("returns signedIn: true with the persisted attempt for a signed-in visitor", async () => {
    const user = { id: "user-1", email: "a@b.com" };
    getHominemUserMock.mockResolvedValue(user);
    loadPuzzleForSpecificDateMock.mockResolvedValue({
      puzzle: PUZZLE,
      attempt: { guesses: [{ word: "DORIT", states: ["absent"] }], status: "playing" },
    });

    const { loader } = await import("../date.$date");
    const response = await loader(
      createLoaderArgs("https://labs.ponti.io/games/realitea/2026-05-20", "2026-05-20"),
    );
    const payload = await response.json();

    expect(payload.signedIn).toBe(true);
    expect(payload.attempt.status).toBe("playing");
    expect(loadPuzzleForSpecificDateMock).toHaveBeenCalledWith("2026-05-20", user);
  });
});
