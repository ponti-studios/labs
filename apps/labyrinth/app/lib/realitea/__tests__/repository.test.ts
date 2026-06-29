import { beforeEach, describe, expect, it, vi } from "vitest";

const { dbMock, findFirstMock, rhobhDailyPuzzlesMock } = vi.hoisted(() => {
  const findFirstMock = vi.fn();
  const selectMock = vi.fn();

  const dbMock = {
    query: { rhobhDailyPuzzles: { findFirst: findFirstMock } },
    select: selectMock,
    delete: vi.fn(),
  };

  const rhobhDailyPuzzlesMock = {
    createdAt: "createdAt",
    dateUtc: "dateUtc",
    id: "id",
    normalizedAnswer: "normalizedAnswer",
  };

  return { dbMock, findFirstMock, rhobhDailyPuzzlesMock };
});

vi.mock("@pontistudios/db", () => ({
  and: vi.fn((...args) => ({ type: "and", args })),
  count: vi.fn(() => "count()"),
  db: dbMock,
  desc: vi.fn((col) => ({ type: "desc", col })),
  eq: vi.fn((col, val) => ({ type: "eq", col, val })),
  gte: vi.fn((col, val) => ({ type: "gte", col, val })),
  inArray: vi.fn((col, vals) => ({ type: "inArray", col, vals })),
  lte: vi.fn((col, val) => ({ type: "lte", col, val })),
  rhobhDailyPuzzles: rhobhDailyPuzzlesMock,
}));

vi.mock("../validation", () => ({
  BRAVO_REPEAT_WINDOW_DAYS: 90,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("loadPuzzleForDate", () => {
  it("returns the row when one exists", async () => {
    const row = { id: 1, dateUtc: "2026-06-25", answer: "BRAVO" };
    findFirstMock.mockResolvedValue(row);
    const { loadPuzzleForDate } = await import("../repository");
    const result = await loadPuzzleForDate("2026-06-25");
    expect(result).toEqual(row);
  });

  it("returns null when no row exists", async () => {
    findFirstMock.mockResolvedValue(undefined);
    const { loadPuzzleForDate } = await import("../repository");
    const result = await loadPuzzleForDate("2026-06-25");
    expect(result).toBeNull();
  });
});

describe("getStoredAnswers", () => {
  it("returns a Set of all normalizedAnswer values", async () => {
    const rows = [{ normalizedAnswer: "BRAVO" }, { normalizedAnswer: "DISCO" }];
    dbMock.select.mockReturnValue({
      from: () => Promise.resolve(rows),
    });
    const { getStoredAnswers } = await import("../repository");
    const result = await getStoredAnswers();
    expect(result).toBeInstanceOf(Set);
    expect(result.has("BRAVO")).toBe(true);
    expect(result.has("DISCO")).toBe(true);
  });
});

describe("getExistingDateKeys", () => {
  it("returns date strings from rows", async () => {
    const rows = [{ dateUtc: "2026-06-26" }, { dateUtc: "2026-06-27" }];
    dbMock.select.mockReturnValue({
      from: () => ({
        where: () => Promise.resolve(rows),
      }),
    });
    const { getExistingDateKeys } = await import("../repository");
    const result = await getExistingDateKeys("2026-06-26", "2026-06-27");
    expect(result).toEqual(["2026-06-26", "2026-06-27"]);
  });

  it("filters out null dateUtc values", async () => {
    const rows = [{ dateUtc: "2026-06-26" }, { dateUtc: null }];
    dbMock.select.mockReturnValue({
      from: () => ({
        where: () => Promise.resolve(rows),
      }),
    });
    const { getExistingDateKeys } = await import("../repository");
    const result = await getExistingDateKeys("2026-06-26", "2026-06-27");
    expect(result).toEqual(["2026-06-26"]);
  });
});
