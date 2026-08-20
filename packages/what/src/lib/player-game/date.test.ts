import { describe, expect, it } from "vitest";

import { addDaysToDateKey, getDateKey, isDateKey } from "./date";

describe("game date keys", () => {
  it("formats dates in a requested timezone", () => {
    expect(getDateKey(new Date("2026-08-20T01:00:00.000Z"), "America/Los_Angeles")).toBe("2026-08-19");
  });

  it("validates and shifts date keys", () => {
    expect(isDateKey("2026-08-20")).toBe(true);
    expect(isDateKey("2026-8-20")).toBe(false);
    expect(addDaysToDateKey("2026-08-20", 1)).toBe("2026-08-21");
  });
});
