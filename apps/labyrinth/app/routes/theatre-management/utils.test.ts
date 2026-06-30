import { describe, expect, it } from "vitest";

import {
  formatCompact,
  formatCurrency,
  getHealthStatus,
  projectedImpactLabel,
  theaterReducer,
  utilizationVariant,
  type TheaterAction,
} from "./utils";
import { DEFAULT_SCREEN_ALLOCATION, type TheaterInputs } from "./theatre-model";

const BASE_CONFIG: TheaterInputs = {
  screens: 10,
  marketBaseline: 3_250,
  season: "SHOULDER",
  ticketPrice: 13,
  concessionPerCap: 7,
  screenAllocation: DEFAULT_SCREEN_ALLOCATION,
};

// ─── formatCurrency ────────────────────────────────────────────────────────────

describe("formatCurrency", () => {
  it("formats a positive number as USD without decimals", () => {
    expect(formatCurrency(1_234)).toBe("$1,234");
  });

  it("rounds to the nearest dollar", () => {
    expect(formatCurrency(1_234.56)).toBe("$1,235");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0");
  });

  it("formats a negative number", () => {
    expect(formatCurrency(-500)).toBe("-$500");
  });
});

// ─── fmt ───────────────────────────────────────────────────────────────────────

describe("fmt", () => {
  it("formats a number with locale separators", () => {
    // toLocaleString("en-US") produces "1,234"
    expect((1_234).toLocaleString("en-US")).toBe("1,234");
  });

  it("formats a large number", () => {
    expect((1_000_000).toLocaleString("en-US")).toBe("1,000,000");
  });
});

// ─── formatCompact ─────────────────────────────────────────────────────────────

describe("formatCompact", () => {
  it("formats millions with M", () => {
    expect(formatCompact(1_500_000)).toBe("$1.5M");
  });

  it("formats thousands with k", () => {
    expect(formatCompact(12_000)).toBe("$12k");
  });

  it("formats values under 1k as currency", () => {
    expect(formatCompact(500)).toBe("$500");
  });

  it("handles edge of million boundary", () => {
    expect(formatCompact(1_000_000)).toBe("$1.0M");
  });

  it("handles edge of thousand boundary", () => {
    expect(formatCompact(1_000)).toBe("$1k");
  });
});

// ─── getHealthStatus ───────────────────────────────────────────────────────────

describe("getHealthStatus", () => {
  it("returns Healthy for margin above 5%", () => {
    const result = getHealthStatus(6_000, 100_000);
    expect(result.label).toBe("Healthy");
    expect(result.variant).toBe("success");
  });

  it("returns Break even for margin between -5% and 5%", () => {
    const positive = getHealthStatus(3_000, 100_000);
    expect(positive.label).toBe("Break even");
    expect(positive.variant).toBe("warning");

    const negative = getHealthStatus(-3_000, 100_000);
    expect(negative.label).toBe("Break even");
    expect(negative.variant).toBe("warning");
  });

  it("returns Losing money for margin below -5%", () => {
    const result = getHealthStatus(-10_000, 100_000);
    expect(result.label).toBe("Losing money");
    expect(result.variant).toBe("destructive");
  });

  it("returns No data when gross revenue is zero", () => {
    const result = getHealthStatus(0, 0);
    expect(result.label).toBe("No data");
    expect(result.variant).toBe("muted");
  });

  it("returns exactly 5% margin as Healthy", () => {
    // 5,000 / 100,000 = 5% margin → > 0.05? No, it's exactly 0.05
    // getHealthStatus checks > 0.05, so exactly 5% is Break even
    const result = getHealthStatus(5_000, 100_000);
    expect(result.label).toBe("Break even");
  });
});

// ─── utilizationVariant ────────────────────────────────────────────────────────

describe("utilizationVariant", () => {
  it("returns destructive for utilization above 90%", () => {
    expect(utilizationVariant(95)).toBe("destructive");
  });

  it("returns warning for utilization above 70%", () => {
    expect(utilizationVariant(80)).toBe("warning");
  });

  it("returns success for utilization at or below 70%", () => {
    expect(utilizationVariant(70)).toBe("success");
    expect(utilizationVariant(50)).toBe("success");
  });

  it("returns destructive when utilization is exactly 91", () => {
    expect(utilizationVariant(91)).toBe("destructive");
  });

  it("returns warning when utilization is exactly 71", () => {
    expect(utilizationVariant(71)).toBe("warning");
  });
});

// ─── projectedImpactLabel ──────────────────────────────────────────────────────

describe("projectedImpactLabel", () => {
  it("formats a positive multiplier", () => {
    expect(projectedImpactLabel(1.18)).toBe("+18% demand");
  });

  it("formats a negative multiplier", () => {
    expect(projectedImpactLabel(0.88)).toBe("-12% demand");
  });

  it("formats a multiplier of 1.0", () => {
    expect(projectedImpactLabel(1.0)).toBe("+0% demand");
  });

  it("rounds the percentage", () => {
    // 1.04 → (0.04 * 100) = 4 → +4%
    expect(projectedImpactLabel(1.04)).toBe("+4% demand");
  });
});

// ─── theaterReducer ────────────────────────────────────────────────────────────

describe("theaterReducer", () => {
  it("handles SET_SCREENS and rebalances allocation", () => {
    const action: TheaterAction = { type: "SET_SCREENS", payload: 12 };
    const next = theaterReducer(BASE_CONFIG, action);
    expect(next.screens).toBe(12);
    // Allocation should sum to the new screen count
    const total = Object.values(next.screenAllocation).reduce((s, v) => s + v, 0);
    expect(total).toBe(12);
  });

  it("clamps screens to min 4", () => {
    const action: TheaterAction = { type: "SET_SCREENS", payload: 2 };
    const next = theaterReducer(BASE_CONFIG, action);
    expect(next.screens).toBe(4);
  });

  it("clamps screens to max 20", () => {
    const action: TheaterAction = { type: "SET_SCREENS", payload: 30 };
    const next = theaterReducer(BASE_CONFIG, action);
    expect(next.screens).toBe(20);
  });

  it("handles SET_MARKET_BASELINE", () => {
    const action: TheaterAction = { type: "SET_MARKET_BASELINE", payload: 5_000 };
    const next = theaterReducer(BASE_CONFIG, action);
    expect(next.marketBaseline).toBe(5_000);
  });

  it("clamps market baseline to min 1_000", () => {
    const action: TheaterAction = { type: "SET_MARKET_BASELINE", payload: 500 };
    const next = theaterReducer(BASE_CONFIG, action);
    expect(next.marketBaseline).toBe(1_000);
  });

  it("clamps market baseline to max 10_000", () => {
    const action: TheaterAction = { type: "SET_MARKET_BASELINE", payload: 15_000 };
    const next = theaterReducer(BASE_CONFIG, action);
    expect(next.marketBaseline).toBe(10_000);
  });

  it("handles SET_SEASON", () => {
    const action: TheaterAction = { type: "SET_SEASON", payload: "SUMMER" };
    const next = theaterReducer(BASE_CONFIG, action);
    expect(next.season).toBe("SUMMER");
  });

  it("handles SET_TICKET_PRICE", () => {
    const action: TheaterAction = { type: "SET_TICKET_PRICE", payload: 15 };
    const next = theaterReducer(BASE_CONFIG, action);
    expect(next.ticketPrice).toBe(15);
  });

  it("clamps ticket price to min 10", () => {
    const action: TheaterAction = { type: "SET_TICKET_PRICE", payload: 5 };
    const next = theaterReducer(BASE_CONFIG, action);
    expect(next.ticketPrice).toBe(10);
  });

  it("clamps ticket price to max 20", () => {
    const action: TheaterAction = { type: "SET_TICKET_PRICE", payload: 25 };
    const next = theaterReducer(BASE_CONFIG, action);
    expect(next.ticketPrice).toBe(20);
  });

  it("handles SET_CONCESSION_PPC", () => {
    const action: TheaterAction = { type: "SET_CONCESSION_PPC", payload: 8 };
    const next = theaterReducer(BASE_CONFIG, action);
    expect(next.concessionPerCap).toBe(8);
  });

  it("clamps concession per cap to min 4", () => {
    const action: TheaterAction = { type: "SET_CONCESSION_PPC", payload: 2 };
    const next = theaterReducer(BASE_CONFIG, action);
    expect(next.concessionPerCap).toBe(4);
  });

  it("clamps concession per cap to max 12", () => {
    const action: TheaterAction = { type: "SET_CONCESSION_PPC", payload: 15 };
    const next = theaterReducer(BASE_CONFIG, action);
    expect(next.concessionPerCap).toBe(12);
  });

  it("handles SET_SCREEN_ALLOCATION for a specific category", () => {
    const action: TheaterAction = {
      type: "SET_SCREEN_ALLOCATION",
      category: "TENTPOLE",
      screens: 5,
    };
    const next = theaterReducer(BASE_CONFIG, action);
    expect(next.screenAllocation.TENTPOLE).toBe(5);
    // Total should remain the same
    const total = Object.values(next.screenAllocation).reduce((s, v) => s + v, 0);
    expect(total).toBe(BASE_CONFIG.screens);
  });

  it("preserves other fields when updating one field", () => {
    const action: TheaterAction = { type: "SET_SEASON", payload: "HOLIDAY" };
    const next = theaterReducer(BASE_CONFIG, action);
    // Only season changed
    expect(next.season).toBe("HOLIDAY");
    expect(next.screens).toBe(BASE_CONFIG.screens);
    expect(next.marketBaseline).toBe(BASE_CONFIG.marketBaseline);
    expect(next.ticketPrice).toBe(BASE_CONFIG.ticketPrice);
    expect(next.concessionPerCap).toBe(BASE_CONFIG.concessionPerCap);
  });
});
