import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ActionFunctionArgs } from "react-router";

const generateDailyPuzzle = vi.fn();
const originalEnv = process.env;

vi.mock("../../lib/realitea-daily-puzzle.server", () => ({
  generateDailyPuzzle,
}));

describe("RealiTea daily puzzle generation action", () => {
  beforeEach(() => {
    generateDailyPuzzle.mockReset();
    process.env = {
      ...originalEnv,
      RHOBH_DAILY_PUZZLE_TOKEN: "test-token",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  function createActionArgs(request: Request): ActionFunctionArgs {
    return {
      context: {},
      params: {},
      request,
      unstable_pattern: "",
      unstable_url: new URL(request.url),
    } as ActionFunctionArgs;
  }

  it("returns 405 for non-post requests", async () => {
    const { action } = await import("../api.games.realitea.generate");
    const response = await action(
      createActionArgs(
        new Request("http://localhost/api/games/realitea/generate", {
          method: "GET",
        }),
      ),
    );

    expect(response.status).toBe(405);
  });

  it("returns 401 when the scheduler token is missing or invalid", async () => {
    const { action } = await import("../api.games.realitea.generate");
    const response = await action(
      createActionArgs(
        new Request("http://localhost/api/games/realitea/generate", {
          body: JSON.stringify({ dateUtc: "2026-05-27" }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        }),
      ),
    );

    expect(response.status).toBe(401);
    expect(generateDailyPuzzle).not.toHaveBeenCalled();
  });

  it("returns a published puzzle when generation succeeds", async () => {
    generateDailyPuzzle.mockResolvedValue({
      answer: "PUPPYGATE",
      answerType: "storyline",
      clue: "A rescue-dog scandal with long-lasting fallout.",
      createdAt: new Date("2026-05-27T00:00:00.000Z"),
      dateUtc: "2026-05-27",
      detail: "The fallout became one of RHOBH's defining storylines.",
      franchise: "rhobh",
      generationStatus: "published",
      id: 1,
      newsMode: "archive",
      normalizedAnswer: "PUPPYGATE",
      role: "Infamous feud",
      sourcePublishedAt: "[]",
      sourceSummary: "[]",
      sourceTitles: "[]",
      sourceUrls: "[]",
      updatedAt: new Date("2026-05-27T00:00:00.000Z"),
      validationStatus: "approved",
    });

    const { action } = await import("../api.games.realitea.generate");
    const response = await action(
      createActionArgs(
        new Request("http://localhost/api/games/realitea/generate", {
          body: JSON.stringify({ dateUtc: "2026-05-27" }),
          headers: {
            Authorization: "Bearer test-token",
            "Content-Type": "application/json",
          },
          method: "POST",
        }),
      ),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.status).toBe("published");
    expect(payload.puzzle.answer).toBe("PUPPYGATE");
  });

  it("returns fallback status when generation publishes nothing", async () => {
    generateDailyPuzzle.mockResolvedValue(null);

    const { action } = await import("../api.games.realitea.generate");
    const response = await action(
      createActionArgs(
        new Request("http://localhost/api/games/realitea/generate", {
          body: JSON.stringify({ dateUtc: "2026-05-27" }),
          headers: {
            Authorization: "Bearer test-token",
            "Content-Type": "application/json",
          },
          method: "POST",
        }),
      ),
    );
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.status).toBe("fallback");
  });
});
