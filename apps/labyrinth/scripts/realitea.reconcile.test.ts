import { describe, expect, it, vi } from "vitest";

// Mock heavy dependencies that fail in jsdom or run top-level side-effects
vi.mock("../app/lib/realitea/generation", () => ({
  generateScheduledPuzzle: vi.fn(),
}));
vi.mock("../app/lib/realitea/repository", () => ({
  countInventoryForRange: vi.fn(),
  deletePuzzlesFromDate: vi.fn(),
  getExistingDateKeys: vi.fn(),
}));
vi.mock("../app/lib/server/env", () => ({
  LabyrinthServerEnv: { parse: vi.fn() },
}));
vi.mock("@pontistudios/db", () => ({
  closeDb: vi.fn(),
}));

describe("computeGaps", () => {
  it("returns empty array when all dates are present", async () => {
    const { computeGaps } = await import("./realitea.reconcile");
    const range = ["2026-06-26", "2026-06-27", "2026-06-28"];
    expect(computeGaps(range, range)).toEqual([]);
  });

  it("returns only the missing dates", async () => {
    const { computeGaps } = await import("./realitea.reconcile");
    const range = ["2026-06-26", "2026-06-27", "2026-06-28"];
    expect(computeGaps(range, ["2026-06-27"])).toEqual(["2026-06-26", "2026-06-28"]);
  });

  it("returns the full range when nothing exists", async () => {
    const { computeGaps } = await import("./realitea.reconcile");
    const range = ["2026-06-26", "2026-06-27", "2026-06-28"];
    expect(computeGaps(range, [])).toEqual(range);
  });

  it("ignores existing keys outside the range", async () => {
    const { computeGaps } = await import("./realitea.reconcile");
    const range = ["2026-06-26", "2026-06-27"];
    expect(computeGaps(range, ["2026-06-25", "2026-06-28"])).toEqual(range);
  });
});
