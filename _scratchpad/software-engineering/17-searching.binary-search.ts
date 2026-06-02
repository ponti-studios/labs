/**
 * =============================================================================
 * LESSON 17: Binary Search
 * =============================================================================
 * Category: Searching
 * Topics: Divide and conquer, sorted arrays, logarithmic search
 * Description: Finds a target value in a sorted array by repeatedly halving
 *              the search range.
 */

import { strictEqual } from "assert";

// =============================================================================
// BINARY SEARCH OVERVIEW
//
// Binary search only works on sorted arrays.
//
// The algorithm keeps two pointers:
// - min: the first index still in play
// - max: the last index still in play
//
// On each step:
// 1. Pick the middle element.
// 2. Compare it to the target.
// 3. If the middle element is too small, discard the left half.
// 4. If the middle element is too large, discard the right half.
// 5. Repeat until the target is found or the range is empty.
//
// Time Complexity: O(log n)
// Space Complexity: O(1)
// =============================================================================

/**
 * Search for a number in a sorted list.
 *
 * @param n - Target value
 * @param list - Sorted array to search
 * @returns Index of target, or null if not found
 */
export function binarySearch(n: number, list: number[]): number | null {
  let min = 0;
  let max = list.length - 1;

  while (max >= min) {
    const guess = Math.floor((min + max) / 2);

    if (list[guess] === n) return guess;

    if (list[guess] < n) {
      min = guess + 1;
    } else {
      max = guess - 1;
    }
  }

  return null;
}

/**
 * Trace of binary search on a sorted array:
 *
 * Array: [0, 1, 2, ..., 100]
 * Target: 42
 *
 * Step 1: min=0, max=100, guess=50
 *         arr[50]=50 is too large → search left half
 * Step 2: min=0, max=49, guess=24
 *         arr[24]=24 is too small → search right half
 * Step 3: min=25, max=49, guess=37
 *         arr[37]=37 is too small → search right half
 * Step 4: min=38, max=49, guess=43
 *         arr[43]=43 is too large → search left half
 * Step 5: min=38, max=42, guess=40
 *         arr[40]=40 is too small → search right half
 * Step 6: min=41, max=42, guess=41
 *         arr[41]=41 is too small → search right half
 * Step 7: min=42, max=42, guess=42
 *         Found it at index 42 ✓
 */

// =============================================================================
// SELF-TESTS
// =============================================================================

const sorted = Array.from({ length: 101 }, (_, i) => i);

strictEqual(binarySearch(0, sorted), 0);
strictEqual(binarySearch(42, sorted), 42);
strictEqual(binarySearch(100, sorted), 100);
strictEqual(binarySearch(101, sorted), null);
strictEqual(binarySearch(-1, sorted), null);

console.log("binarySearch(42):", binarySearch(42, sorted));
console.log("binarySearch(101):", binarySearch(101, sorted));
