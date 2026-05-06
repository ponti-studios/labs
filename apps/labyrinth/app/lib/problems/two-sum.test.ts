import { describe, expect, test } from "vitest";
import { twoSum } from "./two-sum";

describe("twoSum", () => {
  test("should find indexes of addends", () => {
    expect(twoSum([2, 7, 11, 15], 9)).toEqual([0, 1]);
  });

  test("should return 'No two sum solution' when no solution exists", () => {
    expect(twoSum([1, 2, 3], 10)).toBe("No two sum solution");
  });

  test("should work with negative numbers", () => {
    expect(twoSum([-1, 0, 1, 2, -1, -4], 0)).toEqual([0, 2]);
  });
});
