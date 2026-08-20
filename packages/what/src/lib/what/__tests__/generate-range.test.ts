import { describe, expect, it } from "vitest";

import { isLiveDate, liveDateKeys, resolveGenerateRange } from "../generate-range";

describe("generate range", () => {
  it("identifies the UTC and Pacific live dates", () => {
    const now = new Date("2026-08-13T06:00:00Z");
    expect(liveDateKeys(now)).toEqual(new Set(["2026-08-13", "2026-08-12"]));
    expect(isLiveDate("2026-08-12", now)).toBe(true);
    expect(isLiveDate("2026-08-14", now)).toBe(false);
  });

  it("resolves a relative range from tomorrow", () => {
    expect(
      resolveGenerateRange({
        force: true,
        daysAhead: 2,
        todayKey: "2026-08-12",
        now: new Date("2026-08-12T18:00:00Z"),
      }),
    ).toEqual({
      ok: true,
      fromKey: "2026-08-13",
      toKey: "2026-08-14",
      dateKeys: ["2026-08-13", "2026-08-14"],
      force: true,
    });
  });

  it("requires explicit ranges to start after live dates", () => {
    const result = resolveGenerateRange({
      force: true,
      daysAhead: 7,
      from: "2026-08-12",
      to: "2026-08-14",
      todayKey: "2026-08-12",
      now: new Date("2026-08-12T18:00:00Z"),
    });

    expect(result).toEqual({
      ok: false,
      error: "range must start after the live UTC and America/Los_Angeles dates",
    });
  });
});
