import { describe, expect, it } from "vitest";

import { buildInventoryCells } from "../admin/inventory";

describe("buildInventoryCells", () => {
  it("marks UTC/PT today and missing vs ready vs live", () => {
    const now = new Date("2026-08-13T06:00:00Z");
    const cells = buildInventoryCells({
      now,
      existingKeys: ["2026-08-12", "2026-08-13"],
      attemptCounts: new Map([["2026-08-13", 2]]),
    });
    const byDate = Object.fromEntries(cells.map((cell) => [cell.dateKey, cell]));
    expect(byDate["2026-08-12"]?.state).toBe("live");
    expect(byDate["2026-08-12"]?.isPacificToday).toBe(true);
    expect(byDate["2026-08-13"]?.state).toBe("live");
    expect(byDate["2026-08-13"]?.isUtcToday).toBe(true);
    expect(byDate["2026-08-13"]?.attemptCount).toBe(2);
    expect(byDate["2026-08-14"]?.state).toBe("missing");
  });
});
