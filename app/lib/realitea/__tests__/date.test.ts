import { describe, expect, it } from "vitest";
import { daysBetweenDateKeys } from "../core/date";

describe("daysBetweenDateKeys", () => {
  it("returns 0 for the same date", () => {
    expect(daysBetweenDateKeys("2026-07-01", "2026-07-01")).toBe(0);
  });

  it("returns the positive day count from an earlier to a later date", () => {
    expect(daysBetweenDateKeys("2026-07-01", "2026-07-08")).toBe(7);
  });

  it("returns a negative count when toKey precedes fromKey", () => {
    expect(daysBetweenDateKeys("2026-07-08", "2026-07-01")).toBe(-7);
  });

  it("returns null for a malformed key", () => {
    expect(daysBetweenDateKeys("not-a-date", "2026-07-01")).toBeNull();
  });
});
