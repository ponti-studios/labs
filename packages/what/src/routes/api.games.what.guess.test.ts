import { describe, expect, it, vi } from "vitest";

const { getWhatUserMock, evaluateGuessServerMock } = vi.hoisted(() => ({
  getWhatUserMock: vi.fn(),
  evaluateGuessServerMock: vi.fn(),
}));

vi.mock("../server/auth", () => ({
  getWhatUser: getWhatUserMock,
}));

vi.mock("../lib/what/server/puzzle.server", () => ({
  evaluateGuessServer: evaluateGuessServerMock,
}));

async function importAction() {
  const mod = await import("./api.games.what.guess");
  return mod.action;
}

function postRequest(body: unknown) {
  return new Request("https://what.example.com/api/games/what/guess", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("api.games.what.guess action", () => {
  it("rejects non-POST requests", async () => {
    const action = await importAction();
    const response = await action({
      request: new Request("https://what.example.com/api/games/what/guess"),
      params: {},
      context: {} as never,
    } as never);
    expect(response.status).toBe(405);
  });

  it("rejects an invalid payload", async () => {
    const action = await importAction();
    const response = await action({
      request: postRequest({ dateKey: "2026-05-20" }),
      params: {},
      context: {} as never,
    } as never);
    expect(response.status).toBe(400);
    expect(evaluateGuessServerMock).not.toHaveBeenCalled();
  });

  it("forwards a valid payload to evaluateGuessServer and returns its result", async () => {
    getWhatUserMock.mockResolvedValueOnce({ id: "user-1", email: "user@example.com" });
    evaluateGuessServerMock.mockResolvedValueOnce({
      valid: true,
      word: "ERIKA",
      states: ["correct", "correct", "correct", "correct", "correct"],
      isSolved: true,
      isGameOver: true,
      status: "solved",
      remainingGuesses: 5,
    } as never);

    const action = await importAction();
    const response = await action({
      request: postRequest({
        dateKey: "2026-05-20",
        gameSlug: "rhobh",
        previousGuesses: [{ word: "ABABA" }],
        word: "erika",
      } as never),
      params: {},
      context: {} as never,
    } as never);

    expect(evaluateGuessServerMock).toHaveBeenCalledWith(
      "2026-05-20",
      "erika",
      { id: "user-1", email: "user@example.com" },
      1,
      "rhobh",
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ valid: true, word: "ERIKA" });
  });

  it("defaults gameSlug and previousGuesses when omitted", async () => {
    getWhatUserMock.mockResolvedValueOnce(null);
    evaluateGuessServerMock.mockResolvedValueOnce({ valid: false, word: "ABCDE", reason: "wrong-length" });

    const action = await importAction();
    await action({
      request: postRequest({ dateKey: "2026-05-20", word: "abcde" }),
      params: {},
      context: {} as never,
    } as never);

    expect(evaluateGuessServerMock).toHaveBeenCalledWith(
      "2026-05-20",
      "abcde",
      null,
      0,
      "rhobh",
    );
  });
});
