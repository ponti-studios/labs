/**
 * =============================================================================
 * LESSON 21: Two Sum
 * =============================================================================
 * Category: Problems
 * Topics: Hash maps, complements, array traversal
 * Description: Finds the indices of two numbers in an array that add up to a
 *              target value using a single-pass hash map approach.
 */

import { deepStrictEqual, strictEqual } from "assert";

// =============================================================================
// TWO SUM OVERVIEW
//
// The core idea is to scan the array once while remembering the numbers we've
// already seen in a map.
//
// For each number:
// 1. Compute the complement: target - currentNumber.
// 2. Check whether that complement has already been seen.
// 3. If yes, we found the answer.
// 4. If not, store the current number and its index.
//
// Time Complexity: O(n)
// Space Complexity: O(n)
// =============================================================================

/**
 * Return the indices of the two values that add up to the target.
 *
 * @param nums - Array of numbers to search
 * @param target - Desired sum
 * @returns Index pair or a failure message
 */
export function twoSum(nums: number[], target: number): number[] | string {
  const map = new Map<number, number>();

  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];

    if (map.get(diff) !== undefined) return [map.get(diff) as number, i];

    map.set(nums[i], i);
  }

  return "No two sum solution";
}

/**
 * Trace of the algorithm on [2, 7, 11, 15] with target 9:
 *
 * i=0, value=2, complement=7   -> store {2: 0}
 * i=1, value=7, complement=2   -> found 2 at index 0, return [0, 1]
 */

// =============================================================================
// SELF-TESTS
// =============================================================================

const sample = [2, 7, 11, 15];
const sampleResult = twoSum(sample, 9);
const duplicateSample = twoSum([3, 3], 6);
const missingResult = twoSum([1, 2, 3], 7);

deepStrictEqual(sampleResult, [0, 1]);
deepStrictEqual(duplicateSample, [0, 1]);
strictEqual(missingResult, "No two sum solution");

console.log("twoSum([2, 7, 11, 15], 9):", sampleResult);
console.log("twoSum([3, 3], 6):", duplicateSample);
console.log("twoSum([1, 2, 3], 7):", missingResult);
