import { beforeEach, describe, expect, it, vi } from "vitest";

const { dbMock, safeParseMock, rhobhDailyPuzzlesMock } = vi.hoisted(() => {
  const dbMock = {
    delete: vi.fn(),
    insert: vi.fn(),
    select: vi.fn(),
    transaction: vi.fn(),
    update: vi.fn(),
  };

  const rhobhDailyPuzzlesMock = {
    createdAt: "createdAt",
    dateUtc: "dateUtc",
    expireAt: "expireAt",
    franchise: "franchise",
    id: "id",
    normalizedAnswer: "normalizedAnswer",
    publishAt: "publishAt",
    scheduledForDateKey: "scheduledForDateKey",
    status: "status",
    validationStatus: "validationStatus",
  };

  const safeParseMock = vi.fn();

  return { dbMock, rhobhDailyPuzzlesMock, safeParseMock };
});

vi.mock("@pontistudios/db", () => ({
  and: vi.fn(),
  asc: vi.fn(),
  count: vi.fn(),
  db: dbMock,
  desc: vi.fn(),
  eq: vi.fn(),
  gt: vi.fn(),
  gte: vi.fn(),
  inArray: vi.fn(),
  isNull: vi.fn(),
  lte: vi.fn(),
  or: vi.fn(),
  rhobhDailyPuzzles: rhobhDailyPuzzlesMock,
  sql: vi.fn(),
}));

vi.mock("./server/env", () => ({
  LabyrinthServerEnv: {
    safeParse: safeParseMock,
  },
}));

function createSelectResponder(queue: unknown[][]) {
  return vi.fn(() => ({
    from: () => ({
      where: () => {
        const result = queue.shift() ?? [];

        return {
          orderBy: () => ({
            limit: async () => result,
          }),
          then: (resolve: (value: unknown[]) => unknown, reject?: (reason: unknown) => unknown) =>
            Promise.resolve(result).then(resolve, reject),
        };
      },
    }),
  }));
}

function createUpdateResponder(queue: unknown[][] = []) {
  return vi.fn(() => ({
    set: () => ({
      where: () => ({
        returning: async () => queue.shift() ?? [],
      }),
    }),
  }));
}

describe("realitea daily puzzle server helpers", () => {
  beforeEach(() => {
    safeParseMock.mockReset();
    safeParseMock.mockReturnValue({ success: false });
    dbMock.delete.mockReset();
    dbMock.insert.mockReset();
    dbMock.select.mockReset();
    dbMock.transaction.mockReset();
    dbMock.update.mockReset();
  });

  it("loads the active published puzzle when one exists", async () => {
    dbMock.select.mockImplementation(
      createSelectResponder([
        [
          {
            answer: "ERIKA",
            answerType: "person",
            clue: "The Pretty Mess performer never misses a sharp confessional.",
            createdAt: new Date("2026-05-20T12:00:00.000Z"),
            dateUtc: "2026-05-20",
            detail:
              "Erika Jayne keeps the glam, the one-liners, and the pop-star energy turned all the way up.",
            expireAt: new Date("2026-05-21T07:00:00.000Z"),
            franchise: "rhobh",
            generationBatchId: "legacy",
            generationStatus: "published",
            id: 1,
            newsMode: "current",
            normalizedAnswer: "ERIKA",
            publishAt: new Date("2026-05-20T07:00:00.000Z"),
            role: "Pop diva energy",
            scheduledForDateKey: "2026-05-20",
            sourceKind: "current",
            sourcePublishedAt: [],
            sourceSummary: [],
            sourceTitles: [],
            sourceUrls: [],
            status: "published",
            updatedAt: new Date("2026-05-20T12:00:00.000Z"),
            validationStatus: "approved",
          },
        ],
      ]),
    );
    dbMock.update.mockImplementation(createUpdateResponder());

    const { loadActivePuzzle } = await import("./realitea-daily-puzzle.server");
    const envelope = await loadActivePuzzle(new Date("2026-05-20T12:00:00.000Z"));

    expect(envelope?.puzzle.answer).toBe("ERIKA");
    expect(envelope?.puzzle.source).toBe("database");
  });

  it("promotes the scheduled puzzle when no published puzzle exists", async () => {
    dbMock.select.mockImplementation(createSelectResponder([[]]));
    dbMock.update.mockImplementation(createUpdateResponder());

    const txSelect = createSelectResponder([
      [],
      [
        {
          answer: "DRAMA",
          answerType: "moment",
          clue: "A clash that keeps the whole cast spinning.",
          createdAt: new Date("2026-05-20T12:00:00.000Z"),
          dateUtc: "2026-05-20",
          detail: "A single RHOBH conflict can dominate the full episode and aftermath.",
          expireAt: new Date("2026-05-21T07:00:00.000Z"),
          franchise: "rhobh",
          generationBatchId: "scheduled:2026-05-20",
          generationStatus: "published",
          id: 7,
          newsMode: "current",
          normalizedAnswer: "DRAMA",
          publishAt: new Date("2026-05-20T07:00:00.000Z"),
          role: "Escalating conflict",
          scheduledForDateKey: "2026-05-20",
          sourceKind: "current",
          sourcePublishedAt: [],
          sourceSummary: [],
          sourceTitles: [],
          sourceUrls: [],
          status: "scheduled",
          updatedAt: new Date("2026-05-20T12:00:00.000Z"),
          validationStatus: "approved",
        },
      ],
    ]);
    const txUpdate = createUpdateResponder([
      [
        {
          answer: "DRAMA",
          answerType: "moment",
          clue: "A clash that keeps the whole cast spinning.",
          createdAt: new Date("2026-05-20T12:00:00.000Z"),
          dateUtc: "2026-05-20",
          detail: "A single RHOBH conflict can dominate the full episode and aftermath.",
          expireAt: new Date("2026-05-21T07:00:00.000Z"),
          franchise: "rhobh",
          generationBatchId: "scheduled:2026-05-20",
          generationStatus: "published",
          id: 7,
          newsMode: "current",
          normalizedAnswer: "DRAMA",
          publishAt: new Date("2026-05-20T07:00:00.000Z"),
          role: "Escalating conflict",
          scheduledForDateKey: "2026-05-20",
          sourceKind: "current",
          sourcePublishedAt: [],
          sourceSummary: [],
          sourceTitles: [],
          sourceUrls: [],
          status: "published",
          updatedAt: new Date("2026-05-20T12:00:00.000Z"),
          validationStatus: "approved",
        },
      ],
    ]);

    dbMock.transaction.mockImplementation(async (callback: (tx: unknown) => unknown) =>
      callback({
        select: txSelect,
        update: txUpdate,
      }),
    );

    const { loadActivePuzzle } = await import("./realitea-daily-puzzle.server");
    const envelope = await loadActivePuzzle(new Date("2026-05-20T12:00:00.000Z"));

    expect(envelope?.puzzle.answer).toBe("DRAMA");
    expect(envelope?.puzzle.newsMode).toBe("current");
  });

  it("promotes an evergreen reserve when no scheduled puzzle exists", async () => {
    dbMock.select.mockImplementation(createSelectResponder([[]]));
    dbMock.update.mockImplementation(createUpdateResponder());

    const txSelect = createSelectResponder([
      [],
      [],
      [
        {
          answer: "SWANS",
          answerType: "object",
          clue: "These elegant birds are inseparable from one iconic Beverly Hills estate.",
          createdAt: new Date("2026-05-20T12:00:00.000Z"),
          dateUtc: null,
          detail: "The estate's swans became one of the most recognizable bits of RHOBH visual lore.",
          expireAt: null,
          franchise: "rhobh",
          generationBatchId: "reserve:seed",
          generationStatus: "published",
          id: 9,
          newsMode: "archive",
          normalizedAnswer: "SWANS",
          publishAt: null,
          role: "Estate mascots",
          scheduledForDateKey: null,
          sourceKind: "evergreen",
          sourcePublishedAt: [],
          sourceSummary: [],
          sourceTitles: [],
          sourceUrls: [],
          status: "reserve",
          updatedAt: new Date("2026-05-20T12:00:00.000Z"),
          validationStatus: "approved",
        },
      ],
    ]);
    const txUpdate = createUpdateResponder([
      [
        {
          answer: "SWANS",
          answerType: "object",
          clue: "These elegant birds are inseparable from one iconic Beverly Hills estate.",
          createdAt: new Date("2026-05-20T12:00:00.000Z"),
          dateUtc: "2026-05-20",
          detail: "The estate's swans became one of the most recognizable bits of RHOBH visual lore.",
          expireAt: new Date("2026-05-21T07:00:00.000Z"),
          franchise: "rhobh",
          generationBatchId: "reserve:seed",
          generationStatus: "published",
          id: 9,
          newsMode: "archive",
          normalizedAnswer: "SWANS",
          publishAt: new Date("2026-05-20T07:00:00.000Z"),
          role: "Estate mascots",
          scheduledForDateKey: "2026-05-20",
          sourceKind: "evergreen",
          sourcePublishedAt: [],
          sourceSummary: [],
          sourceTitles: [],
          sourceUrls: [],
          status: "published",
          updatedAt: new Date("2026-05-20T12:00:00.000Z"),
          validationStatus: "approved",
        },
      ],
    ]);

    dbMock.transaction.mockImplementation(async (callback: (tx: unknown) => unknown) =>
      callback({
        select: txSelect,
        update: txUpdate,
      }),
    );

    const { loadActivePuzzle } = await import("./realitea-daily-puzzle.server");
    const envelope = await loadActivePuzzle(new Date("2026-05-20T12:00:00.000Z"));

    expect(envelope?.puzzle.answer).toBe("SWANS");
    expect(envelope?.puzzle.newsMode).toBe("archive");
  });
});
