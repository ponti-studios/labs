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

  it("moves weekly attendance with season and lineup", () => {
    const base = calculateTheaterEconomics(BASE_CONFIG);
    const summer = calculateTheaterEconomics({
      ...BASE_CONFIG,
      season: "SUMMER",
    });
    const tentpoleHeavy = calculateTheaterEconomics({
      ...BASE_CONFIG,
      screenAllocation: rebalanceAllocationForCategory(
        DEFAULT_SCREEN_ALLOCATION,
        10,
        "TENTPOLE",
        6,
      ),
    });

    expect(summer.weeklyAttendance).toBeGreaterThan(base.weeklyAttendance);
    expect(tentpoleHeavy.weeklyAttendance).toBeGreaterThan(base.weeklyAttendance);
  });

  it("derives attendance from the same inputs deterministically (no freeform market input)", () => {
    const first = calculateTheaterEconomics(BASE_CONFIG);
    const second = calculateTheaterEconomics({ ...BASE_CONFIG });

    expect(second.weeklyAttendance).toBe(first.weeklyAttendance);
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
