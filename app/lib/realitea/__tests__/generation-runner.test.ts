import { describe, expect, it, vi } from "vitest";

const { generatePuzzleForGameMock, getExistingDateKeysMock } = vi.hoisted(() => ({
  generatePuzzleForGameMock: vi.fn(),
  getExistingDateKeysMock: vi.fn(),
}));

vi.mock("../generation/generate.server", () => ({
  generatePuzzleForGame: generatePuzzleForGameMock,
}));

vi.mock("../server/repository.server", () => ({
  getExistingDateKeys: getExistingDateKeysMock,
}));

import { gapFillOne, planGapFill } from "../generation-runner";

describe("generation runner", () => {
  it("plans only requested dates that are missing from the inventory", async () => {
    const game = { id: 42 } as Parameters<typeof planGapFill>[0];
    const range = {
      ok: true as const,
      fromKey: "2026-08-13",
      toKey: "2026-08-15",
      dateKeys: ["2026-08-13", "2026-08-14", "2026-08-15"],
      force: false,
    };
    getExistingDateKeysMock.mockResolvedValue(["2026-08-14", "2026-08-20"]);

    await expect(planGapFill(game, range)).resolves.toEqual({
      dateKeys: range.dateKeys,
      existingKeys: ["2026-08-14", "2026-08-20"],
      missingKeys: ["2026-08-13", "2026-08-15"],
    });
    expect(getExistingDateKeysMock).toHaveBeenCalledWith(game.id, range.fromKey, range.toKey);
  });

  it("uses the system actor and default attempt count for one puzzle", async () => {
    const game = { id: 42 } as Parameters<typeof gapFillOne>[0];
    generatePuzzleForGameMock.mockResolvedValue({ id: 7 });

    await expect(gapFillOne(game, "2026-08-14")).resolves.toEqual({ id: 7 });
    expect(generatePuzzleForGameMock).toHaveBeenCalledWith(game, "2026-08-14", {
      maxAttempts: 1,
      actor: "system:generate",
    });
  });
});
