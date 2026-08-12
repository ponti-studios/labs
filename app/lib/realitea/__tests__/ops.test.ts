import { describe, expect, it } from "vitest";

import {
  computeGaps,
  isLiveDate,
  liveDateKeys,
  resolveGenerateWindow,
} from "../ops";

describe("resolveGenerateWindow", () => {
  it("scopes --force --days-ahead=2 to tomorrow and the next day only", () => {
    const window = resolveGenerateWindow({
      force: true,
      daysAhead: 2,
      todayKey: "2026-08-12",
      now: new Date("2026-08-12T18:00:00Z"),
    });
    expect(window).toMatchObject({
      ok: true,
      fromKey: "2026-08-13",
      toKey: "2026-08-14",
      dateKeys: ["2026-08-13", "2026-08-14"],
      force: true,
    });
    if (window.ok) {
      expect(window.dateKeys).not.toContain("2026-08-15");
    }
  });

  it("accepts an explicit Friday–Sunday range and excludes Monday", () => {
    const window = resolveGenerateWindow({
      force: true,
      daysAhead: 7,
      from: "2026-08-14",
      to: "2026-08-16",
      todayKey: "2026-08-12",
      now: new Date("2026-08-12T18:00:00Z"),
    });
    expect(window).toEqual({
      ok: true,
      fromKey: "2026-08-14",
      toKey: "2026-08-16",
      dateKeys: ["2026-08-14", "2026-08-15", "2026-08-16"],
      force: true,
    });
  });

  it("does not delete when force is false — window is still the same dates", () => {
    const window = resolveGenerateWindow({
      force: false,
      daysAhead: 2,
      todayKey: "2026-08-12",
      now: new Date("2026-08-12T18:00:00Z"),
    });
    expect(window).toMatchObject({ ok: true, force: false, dateKeys: ["2026-08-13", "2026-08-14"] });
  });

  it("rejects a range that includes the live Pacific or UTC date", () => {
    const window = resolveGenerateWindow({
      force: true,
      daysAhead: 7,
      from: "2026-08-12",
      to: "2026-08-14",
      todayKey: "2026-08-12",
      now: new Date("2026-08-12T18:00:00Z"),
    });
    expect(window.ok).toBe(false);
  });

  it("requires from and to together", () => {
    expect(
      resolveGenerateWindow({
        force: true,
        daysAhead: 7,
        from: "2026-08-14",
        todayKey: "2026-08-12",
      }).ok,
    ).toBe(false);
  });
});

describe("computeGaps", () => {
  it("returns only missing dates and ignores extras", () => {
    expect(computeGaps(["2026-08-13", "2026-08-14"], ["2026-08-14", "2026-08-20"])).toEqual([
      "2026-08-13",
    ]);
  });
});

describe("live dates", () => {
  it("treats UTC today and America/Los_Angeles today as live", () => {
    const now = new Date("2026-08-13T06:00:00Z");
    const live = liveDateKeys(now);
    expect(live.has("2026-08-13")).toBe(true);
    expect(live.has("2026-08-12")).toBe(true);
    expect(isLiveDate("2026-08-12", now)).toBe(true);
    expect(isLiveDate("2026-08-14", now)).toBe(false);
  });
});
