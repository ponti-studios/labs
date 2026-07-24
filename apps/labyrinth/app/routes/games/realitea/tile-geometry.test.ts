import { describe, expect, it } from "vitest";

import { getRoundedPerimeterPoints } from "./tile-geometry";

describe("getRoundedPerimeterPoints", () => {
  it("places a stable number of bulbs at equal perimeter intervals", () => {
    const points = getRoundedPerimeterPoints(82, 82, 17, 20);
    expect(points.length).toBe(15);

    const distances = points.map((point, index) => {
      const next = points[(index + 1) % points.length];
      return Math.hypot(next.x - point.x, next.y - point.y);
    });

    expect(Math.max(...distances) - Math.min(...distances)).toBeLessThan(8);
  });

  it("keeps bulbs away from rounded-corner seams", () => {
    const points = getRoundedPerimeterPoints(54, 54, 11, 15);

    expect(points.every(({ x, y }) => !(x === 11 && y === 0))).toBe(true);
    expect(points.every(({ x, y }) => !(x === 43 && y === 0))).toBe(true);
    expect(points.every(({ x, y }) => !(x === 54 && y === 11))).toBe(true);
  });

  it("recalculates the bulb count when the tile grows", () => {
    const mobile = getRoundedPerimeterPoints(54, 54, 11, 15);
    const desktop = getRoundedPerimeterPoints(82, 82, 17, 20);

    expect(desktop.length).toBeGreaterThan(mobile.length);
  });
});
