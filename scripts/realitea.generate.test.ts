import { describe, expect, it } from "vitest";

describe("computeGaps", () => {
  it("returns empty array when all dates are present", async () => {
    const { computeGaps } = await import("./realitea.generate");
    const range = ["2026-06-26", "2026-06-27", "2026-06-28"];
    expect(computeGaps(range, range)).toEqual([]);
  });

  it("returns only the missing dates", async () => {
    const { computeGaps } = await import("./realitea.generate");
    const range = ["2026-06-26", "2026-06-27", "2026-06-28"];
    expect(computeGaps(range, ["2026-06-27"])).toEqual(["2026-06-26", "2026-06-28"]);
  });

  it("returns the full range when nothing exists", async () => {
    const { computeGaps } = await import("./realitea.generate");
    const range = ["2026-06-26", "2026-06-27", "2026-06-28"];
    expect(computeGaps(range, [])).toEqual(range);
  });

  it("ignores existing keys outside the range", async () => {
    const { computeGaps } = await import("./realitea.generate");
    const range = ["2026-06-26", "2026-06-27"];
    expect(computeGaps(range, ["2026-06-25", "2026-06-28"])).toEqual(range);
  });
});
