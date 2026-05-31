import { beforeEach, describe, expect, it, vi } from "vitest";

const { dbMock, safeParseMock, rhobhDailyPuzzlesMock } = vi.hoisted(() => {
  const dbMock = {
    delete: vi.fn(),
    insert: vi.fn(),
    select: vi.fn(),
  };

  const rhobhDailyPuzzlesMock = {
    createdAt: "createdAt",
    dateUtc: "dateUtc",
    franchise: "franchise",
    normalizedAnswer: "normalizedAnswer",
    validationStatus: "validationStatus",
  };

  const safeParseMock = vi.fn();

  return { dbMock, rhobhDailyPuzzlesMock, safeParseMock };
});

vi.mock("@pontistudios/db", () => ({
  and: vi.fn(),
  db: dbMock,
  desc: vi.fn(),
  eq: vi.fn(),
  gte: vi.fn(),
  rhobhDailyPuzzles: rhobhDailyPuzzlesMock,
}));

vi.mock("./server/env", () => ({
  LabyrinthServerEnv: {
    safeParse: safeParseMock,
  },
}));

describe("realitea daily puzzle server helpers", () => {
  beforeEach(() => {
    safeParseMock.mockReset();
    dbMock.delete.mockReset();
    dbMock.insert.mockReset();
    dbMock.select.mockReset();

    safeParseMock.mockReturnValue({ success: false });

    dbMock.select.mockImplementation((selection?: unknown) => {
      if (selection) {
        return {
          from: () => ({
            where: async () => [],
          }),
        };
      }

      return {
        from: () => ({
          where: () => ({
            orderBy: () => ({
              limit: async () => [],
            }),
          }),
        }),
      };
    });

    dbMock.delete.mockReturnValue({
      where: async () => undefined,
    });

    dbMock.insert.mockReturnValue({
      values: (values: Record<string, unknown>) => ({
        returning: async () => [
          {
            ...values,
            createdAt: new Date("2026-05-20T12:00:00.000Z"),
            id: 1,
            updatedAt: new Date("2026-05-20T12:00:00.000Z"),
          },
        ],
      }),
    });
  });

  it("loads a stored puzzle when one exists", async () => {
    dbMock.select.mockImplementation((selection?: unknown) => {
      if (selection) {
        return {
          from: () => ({
            where: async () => [],
          }),
        };
      }

      return {
        from: () => ({
          where: () => ({
            orderBy: () => ({
              limit: async () => [
                {
                  answer: "ERIKA",
                  answerType: "person",
                  clue: "The Pretty Mess performer never misses a sharp confessional.",
                  createdAt: new Date("2026-05-20T12:00:00.000Z"),
                  dateUtc: "2026-05-20",
                  detail:
                    "Erika Jayne keeps the glam, the one-liners, and the pop-star energy turned all the way up.",
                  franchise: "rhobh",
                  generationStatus: "published",
                  id: 1,
                  newsMode: "current",
                  normalizedAnswer: "ERIKA",
                  role: "Pop diva energy",
                  sourcePublishedAt: "[]",
                  sourceSummary: "[]",
                  sourceTitles: "[]",
                  sourceUrls: "[]",
                  updatedAt: new Date("2026-05-20T12:00:00.000Z"),
                  validationStatus: "approved",
                },
              ],
            }),
          }),
        }),
      };
    });

    const { loadPuzzleForDate } = await import("./realitea-daily-puzzle.server");

    const envelope = await loadPuzzleForDate(new Date("2026-05-20T12:00:00.000Z"));

    expect(envelope).not.toBeNull();
    expect(envelope?.puzzle.answer).toBe("ERIKA");
    expect(envelope?.puzzle.source).toBe("database");
  });

  it("returns null when no stored puzzle exists and generation is unavailable", async () => {
    const { loadPuzzleForDate } = await import("./realitea-daily-puzzle.server");

    const envelope = await loadPuzzleForDate(new Date("2026-05-20T12:00:00.000Z"));

    expect(envelope).toBeNull();
  });
});
