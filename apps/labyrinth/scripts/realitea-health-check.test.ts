import { describe, expect, it, vi } from "vitest";

// Mock heavy dependencies to prevent top-level side-effects when importing the script
vi.mock("../app/lib/realitea-db", () => ({
  countInventoryForRange: vi.fn(),
  loadPuzzleForDate: vi.fn(),
}));
vi.mock("../app/lib/realitea-scripts", () => ({
  withDbCleanup: vi.fn((fn: () => Promise<unknown>) => fn()),
  createScriptLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    child: vi.fn(() => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn() })),
  })),
}));
vi.mock("@pontistudios/db", () => ({
  closeDb: vi.fn(),
}));

const READY_DAYS = 7; // mirrors REALITEA_READY_INVENTORY_DAYS

describe("computeHealthStatus", () => {
  it("returns OK when everything is healthy", async () => {
    const { computeHealthStatus } = await import("./realitea-health-check");
    const result = computeHealthStatus(READY_DAYS, true, true);
    expect(result.status).toBe("OK");
    expect(result.issues).toHaveLength(0);
  });

  it("returns DEGRADED when inventory is zero", async () => {
    const { computeHealthStatus } = await import("./realitea-health-check");
    const result = computeHealthStatus(0, true, true);
    expect(result.status).toBe("DEGRADED");
    expect(result.issues.some((i) => i.includes("no puzzles scheduled"))).toBe(true);
  });

  it("returns DEGRADED when inventory is below threshold", async () => {
    const { computeHealthStatus } = await import("./realitea-health-check");
    const result = computeHealthStatus(2, true, true);
    expect(result.status).toBe("DEGRADED");
    expect(result.issues.some((i) => i.includes("low inventory"))).toBe(true);
  });

  it("returns OK when inventory is exactly at threshold", async () => {
    const { computeHealthStatus } = await import("./realitea-health-check");
    const result = computeHealthStatus(READY_DAYS, true, true);
    expect(result.status).toBe("OK");
  });

  it("returns DEGRADED when no puzzle for today", async () => {
    const { computeHealthStatus } = await import("./realitea-health-check");
    const result = computeHealthStatus(READY_DAYS, false, true);
    expect(result.status).toBe("DEGRADED");
    expect(result.issues.some((i) => i.includes("no puzzle for today"))).toBe(true);
  });

  it("returns DEGRADED when no puzzles in database", async () => {
    const { computeHealthStatus } = await import("./realitea-health-check");
    const result = computeHealthStatus(0, false, false);
    expect(result.status).toBe("DEGRADED");
    expect(result.issues.some((i) => i.includes("no puzzles in database"))).toBe(true);
  });

  it("accumulates multiple issues", async () => {
    const { computeHealthStatus } = await import("./realitea-health-check");
    const result = computeHealthStatus(0, false, false);
    expect(result.issues.length).toBeGreaterThan(1);
  });
});
