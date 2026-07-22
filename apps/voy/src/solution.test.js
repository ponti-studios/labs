const { calculatePenDuration } = require("./solution");

describe("calculatePenDuration", () => {

  test("should calculate partial weeks when medication runs out mid-week", () => {
    expect(calculatePenDuration([25, 25, 25, 25], 100)).toBe(4);
    const result = calculatePenDuration([30, 30, 30, 30], 100);
    expect(result).toBeCloseTo(3.333, 2);
  });

  test("should calculate exact usage correctly", () => {
    expect(calculatePenDuration([50, 50], 100)).toBe(2);
    expect(calculatePenDuration([10, 20, 30, 15], 100)).toBe(4);
  });

  test("should stop counting once the pen runs out, ignoring later dosages", () => {
    const result = calculatePenDuration([30, 30, 30, 30, 30], 100);
    expect(result).toBeCloseTo(3.333, 2);
  });
});
