import { describe, expect, test } from "vitest";
import { swap, functionalSwap } from "./swap";

describe("swap", () => {
  test("should swap two elements in array", () => {
    expect(swap([1, 2, 3], 0, 2)).toEqual([3, 2, 1]);
  });

  test("should swap with functional approach", () => {
    expect(functionalSwap([1, 2, 3], 0, 2)).toEqual([3, 2, 1]);
  });

  test("should handle string arrays", () => {
    expect(swap(["a", "b", "c"], 0, 2)).toEqual(["c", "b", "a"]);
  });
});
