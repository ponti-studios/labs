import { describe, expect, it } from "vitest";

import {
  calculateTheaterEconomics,
  DEFAULT_SCREEN_ALLOCATION,
  getAllocatedScreens,
  rebalanceAllocationForCategory,
  rebalanceAllocationForScreens,
} from "./theatre-model";

const BASE_CONFIG = {
  screens: 10,
  marketBaseline: 3_250,
  season: "SHOULDER" as const,
  ticketPrice: 13,
  concessionPerCap: 7,
  screenAllocation: DEFAULT_SCREEN_ALLOCATION,
};

describe("theatre model", () => {
  it("keeps the roster full when the screen count changes", () => {
    const next = rebalanceAllocationForScreens(DEFAULT_SCREEN_ALLOCATION, 12);

    expect(getAllocatedScreens(next)).toBe(12);
    expect(Math.max(...Object.values(next))).toBeLessThanOrEqual(12);
    expect(Object.values(next).every((value) => value >= 0)).toBe(true);
  });

  it("rebalances the line when one category changes", () => {
    const next = rebalanceAllocationForCategory(DEFAULT_SCREEN_ALLOCATION, 10, "TENTPOLE", 5);

    expect(getAllocatedScreens(next)).toBe(10);
    expect(next.TENTPOLE).toBe(5);
    expect(next.INDIE_HOLDOVER).toBeLessThan(DEFAULT_SCREEN_ALLOCATION.INDIE_HOLDOVER);
  });

  it("moves weekly attendance with market size and season", () => {
    const base = calculateTheaterEconomics(BASE_CONFIG);
    const biggerMarket = calculateTheaterEconomics({
      ...BASE_CONFIG,
      marketBaseline: 4_000,
    });
    const summer = calculateTheaterEconomics({
      ...BASE_CONFIG,
      season: "SUMMER",
    });

    expect(biggerMarket.weeklyAttendance).toBeGreaterThan(base.weeklyAttendance);
    expect(summer.weeklyAttendance).toBeGreaterThan(base.weeklyAttendance);
  });

  it("moves studio cut, concession profit, and margin when the lineup changes", () => {
    const base = calculateTheaterEconomics(BASE_CONFIG);
    const tentpoleHeavy = calculateTheaterEconomics({
      ...BASE_CONFIG,
      screenAllocation: rebalanceAllocationForCategory(
        DEFAULT_SCREEN_ALLOCATION,
        10,
        "TENTPOLE",
        6,
      ),
    });

    expect(tentpoleHeavy.studioCutAmount).not.toBe(base.studioCutAmount);
    expect(tentpoleHeavy.concessionProfit).not.toBe(base.concessionProfit);
    expect(tentpoleHeavy.margin).not.toBe(base.margin);
  });
});
