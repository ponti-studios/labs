import { describe, expect, it } from "vitest";
import { fixtureBank } from "./fixtures";
import {
  daysBetween,
  DIFFICULTY_ORDER,
  groupsCollide,
  isOffCooldown,
  pickDailyGroups,
  toGrid,
} from "./picker";

/** Deterministic PRNG (mulberry32) so picks are reproducible across runs. */
function seededRng(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("daysBetween", () => {
  it("computes whole-day gaps", () => {
    expect(daysBetween("2026-01-01", "2026-01-31")).toBe(30);
    expect(daysBetween("2026-01-01", "2026-01-01")).toBe(0);
  });
});

describe("groupsCollide", () => {
  const byId = new Map(fixtureBank.map((g) => [g.id, g]));

  it("flags a literal shared word across tiers", () => {
    const g1 = byId.get("g1");
    const b1 = byId.get("b1");
    expect(g1).toBeDefined();
    expect(b1).toBeDefined();
    if (!g1 || !b1) throw new Error("fixture missing");
    expect(groupsCollide(g1, b1)).toBe(true); // both contain "Stack"
  });

  it("flags a risk-word collision in either direction", () => {
    const y1 = byId.get("y1");
    const y5 = byId.get("y5");
    const y6 = byId.get("y6");
    if (!y1 || !y5 || !y6) throw new Error("fixture missing");
    expect(groupsCollide(y1, y5)).toBe(true); // y1 risks "Java", y5 contains it
    expect(groupsCollide(y1, y6)).toBe(true); // y1 risks "Swift", y6 contains it
  });

  it("flags risk-word collisions defined on the other group", () => {
    const p1 = byId.get("p1");
    const p3 = byId.get("p3");
    if (!p1 || !p3) throw new Error("fixture missing");
    expect(groupsCollide(p1, p3)).toBe(true); // p1 risks "Root", p3 contains it
  });

  it("does not flag unrelated groups", () => {
    const y2 = byId.get("y2");
    const g3 = byId.get("g3");
    if (!y2 || !g3) throw new Error("fixture missing");
    expect(groupsCollide(y2, g3)).toBe(false);
  });
});

describe("pickDailyGroups", () => {
  it("returns one collision-free group per tier", () => {
    const result = pickDailyGroups(fixtureBank, "2026-08-13", new Map(), { rng: seededRng(1) });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.reason);

    expect(result.groups).toHaveLength(4);
    expect(result.groups.map((g) => g.difficulty).sort()).toEqual([...DIFFICULTY_ORDER].sort());

    for (let i = 0; i < result.groups.length; i++) {
      for (let j = i + 1; j < result.groups.length; j++) {
        const a = result.groups[i];
        const b = result.groups[j];
        if (!a || !b) throw new Error("unreachable");
        expect(groupsCollide(a, b)).toBe(false);
      }
    }
  });

  it("is reproducible for a fixed seed", () => {
    const a = pickDailyGroups(fixtureBank, "2026-08-13", new Map(), { rng: seededRng(42) });
    const b = pickDailyGroups(fixtureBank, "2026-08-13", new Map(), { rng: seededRng(42) });
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) throw new Error("expected both picks to succeed");
    expect(a.groups.map((g) => g.id)).toEqual(b.groups.map((g) => g.id));
  });

  it("never picks a group that is still on cooldown", () => {
    const usage = new Map<string, string>([["y1", "2026-08-01"]]); // 12 days before asOf
    const result = pickDailyGroups(fixtureBank, "2026-08-13", usage, {
      cooldownDays: 180,
      rng: seededRng(7),
    });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.reason);
    expect(result.groups.some((g) => g.id === "y1")).toBe(false);
  });

  it("allows a group again once the cooldown has fully elapsed", () => {
    const usage = new Map<string, string>([["y7", "2026-01-01"]]); // > 180 days before asOf
    expect(isOffCooldown(fixtureBank.find((g) => g.id === "y7")!, "2026-08-13", usage, 180)).toBe(true);
  });

  it("fails clearly when a tier has zero eligible groups", () => {
    const yellowOnly = fixtureBank.filter((g) => g.difficulty === "yellow");
    const usage = new Map(yellowOnly.map((g) => [g.id, "2026-08-01"] as const));
    const result = pickDailyGroups(yellowOnly, "2026-08-13", usage, { cooldownDays: 180 });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.reason).toContain("yellow");
  });
});

describe("toGrid", () => {
  it("flattens the 4 groups into 16 words", () => {
    const result = pickDailyGroups(fixtureBank, "2026-08-13", new Map(), { rng: seededRng(3) });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.reason);
    const grid = toGrid(result.groups, seededRng(4));
    expect(grid).toHaveLength(16);
    const expectedWords = result.groups.flatMap((g) => g.words).sort();
    expect([...grid].sort()).toEqual(expectedWords);
  });
});
