import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock heavy dependencies that fail in jsdom or execute side-effects at import time
vi.mock("../app/lib/realitea-generation", () => ({
  generateScheduledPuzzle: vi.fn(),
}));
vi.mock("../app/lib/realitea-scripts", () => ({
  withDbCleanup: vi.fn((fn: () => Promise<unknown>) => fn()),
  createScriptLogger: vi.fn(() => ({ info: vi.fn(), error: vi.fn(), child: vi.fn(() => ({ info: vi.fn(), error: vi.fn() })) })),
}));
vi.mock("../app/lib/server/env", () => ({
  LabyrinthServerEnv: { parse: vi.fn() },
}));
vi.mock("@pontistudios/db", () => ({
  closeDb: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("parseGenerateArgs", () => {
  it("parses --date-key", async () => {
    const { parseGenerateArgs } = await import("./generate-realitea-scheduled-puzzle");
    expect(parseGenerateArgs(["--date-key=2026-06-25"])).toEqual({ dateKey: "2026-06-25" });
  });

  it("parses --from and --to", async () => {
    const { parseGenerateArgs } = await import("./generate-realitea-scheduled-puzzle");
    expect(parseGenerateArgs(["--from=2026-06-25", "--to=2026-06-27"])).toEqual({
      from: "2026-06-25",
      to: "2026-06-27",
    });
  });

  it("parses --days-ahead", async () => {
    const { parseGenerateArgs } = await import("./generate-realitea-scheduled-puzzle");
    expect(parseGenerateArgs(["--days-ahead=3"])).toEqual({ daysAhead: 3 });
  });

  it("throws on unknown flags", async () => {
    const { parseGenerateArgs } = await import("./generate-realitea-scheduled-puzzle");
    expect(() => parseGenerateArgs(["--unknown=foo"])).toThrow();
  });

  it("returns empty opts with no args", async () => {
    const { parseGenerateArgs } = await import("./generate-realitea-scheduled-puzzle");
    expect(parseGenerateArgs([])).toEqual({});
  });
});

describe("buildGenerateRange", () => {
  it("returns a single date for --date-key", async () => {
    const { buildGenerateRange } = await import("./generate-realitea-scheduled-puzzle");
    const range = buildGenerateRange({ dateKey: "2026-06-25" });
    expect(range).toEqual(["2026-06-25"]);
  });

  it("returns a range for --from and --to", async () => {
    const { buildGenerateRange } = await import("./generate-realitea-scheduled-puzzle");
    const range = buildGenerateRange({ from: "2026-06-25", to: "2026-06-27" });
    expect(range).toEqual(["2026-06-25", "2026-06-26", "2026-06-27"]);
  });

  it("returns N dates for --days-ahead", async () => {
    const { buildGenerateRange } = await import("./generate-realitea-scheduled-puzzle");
    const range = buildGenerateRange({ from: "2026-06-25", daysAhead: 3 });
    expect(range).toHaveLength(3);
    expect(range[0]).toBe("2026-06-25");
  });

  it("throws on invalid start date", async () => {
    const { buildGenerateRange } = await import("./generate-realitea-scheduled-puzzle");
    expect(() => buildGenerateRange({ from: "not-a-date" })).toThrow("Invalid start date");
  });

  it("throws on invalid end date", async () => {
    const { buildGenerateRange } = await import("./generate-realitea-scheduled-puzzle");
    expect(() => buildGenerateRange({ from: "2026-06-25", to: "bad" })).toThrow("Invalid end date");
  });
});
