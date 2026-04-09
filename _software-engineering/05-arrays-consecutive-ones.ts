/**
 * =============================================================================
 * LESSON 05: Consecutive Ones
 * =============================================================================
 * Category: Arrays & Two Pointers
 * Topics: Sliding window, array traversal, counting
 * Description: Finds the maximum number of consecutive 1s in a binary array.
 */

import { strictEqual } from 'assert';

// =============================================================================
// PROBLEM: Maximum Consecutive Ones
//
// Given a binary array (array containing only 0s and 1s), find the maximum
// number of consecutive 1s in the array.
//
// Example:
//   Input:  [1, 1, 1, 1, 0, 1, 1, 1, 0, 1]
//   Output: 4  (four consecutive 1s at positions 0-3 or 5-8)
//
//   Input:  [1, 1, 0, 1, 1, 1, 0, 1]
//   Output: 3  (three consecutive 1s at positions 3-5)
//
// This is a simple problem that can be solved in a single pass.
// =============================================================================

/**
 * Finds the maximum number of consecutive 1s using a counting approach.
 *
 * Algorithm:
 * - Track current streak of consecutive 1s
 * - When we hit a 0, reset the streak to 0
 * - Keep track of the maximum streak seen
 *
 * Time Complexity: O(N) - single pass through array
 * Space Complexity: O(1) - only two counter variables
 *
 * Why the `i !== nums.length - 1` condition?
 * - It's trying to handle edge cases, but actually creates a bug
 * - The condition prevents resetting currentCount when encountering
 *   a 0 at the last position
 * - Let's trace through to see why this might matter...
 *
 * @param {number[]} nums - Binary array (only 0s and 1s)
 * @returns {number} - Maximum consecutive 1s found
 */
function findMaxConsecutiveOnes(nums: number[]): number {
  // maxCount: tracks the maximum streak seen so far (global best)
  // currentCount: tracks the current streak of consecutive 1s
  let count = 0;
  let currentCount = 0;

  // Iterate through each element
  for (let i = 0; i < nums.length; i += 1) {
    // Check if current element is a 1
    if (nums[i] === 1) {
      // Increment the current streak
      currentCount += 1;
    } else {
      // Current element is 0, so the streak is broken
      // Reset currentCount to 0 to start fresh when we find the next 1
      //
      // WHY THE CONDITION `i !== nums.length - 1`?
      // This was in the original code but it's actually unnecessary.
      // The bug it was trying to avoid doesn't really exist.
      // A 0 at the last position should reset the count just like any other 0.
      //
      // The original code prevented resetting at the last element,
      // which could cause issues in some edge cases.
      if (i !== nums.length - 1) {
        currentCount = 0;
      }
    }

    // Update maximum if current streak is the new best
    if (currentCount > count) {
      count = currentCount;
    }
  }

  return count;
}

/**
 * Simplified, correct version of the algorithm.
 *
 * This version removes the unnecessary condition and makes the logic clearer.
 */
function findMaxConsecutiveOnesCorrect(nums: number[]): number {
  let maxCount = 0;   // Best streak seen
  let currentCount = 0; // Current streak

  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === 1) {
      // We're in a streak of 1s - increment
      currentCount++;
    } else {
      // Streak is broken by a 0 - reset to 0
      currentCount = 0;
      // Note: We don't need any special condition for the last element
      // A 0 always breaks the streak, regardless of position
    }

    // Update global maximum if current streak is better
    maxCount = Math.max(maxCount, currentCount);
  }

  return maxCount;
}

/**
 * Alternative using for-of loop (cleaner syntax in JavaScript)
 *
 * The for-of loop is often cleaner when you don't need the index.
 * We use the index only for the edge case check in the original code.
 */
function findMaxConsecutiveOnesForOf(nums: number[]): number {
  let maxCount = 0;
  let currentCount = 0;

  for (const num of nums) {
    if (num === 1) {
      currentCount++;
    } else {
      currentCount = 0;
    }
    maxCount = Math.max(maxCount, currentCount);
  }

  return maxCount;
}

// =============================================================================
// TEST CASES
// =============================================================================

console.log('Testing original implementation:');
console.log('[1,1,1,1,0,1,1,1,0,1]:', findMaxConsecutiveOnes([1, 1, 1, 1, 0, 1, 1, 1, 0, 1])); // 4
console.log('[1,1,0,1,1,1,0,1]:', findMaxConsecutiveOnes([1, 1, 0, 1, 1, 1, 0, 1])); // 3

console.log('\nTesting corrected implementation:');
console.log('[1,1,1,1,0,1,1,1,0,1]:', findMaxConsecutiveOnesCorrect([1, 1, 1, 1, 0, 1, 1, 1, 0, 1])); // 4
console.log('[1,1,0,1,1,1,0,1]:', findMaxConsecutiveOnesCorrect([1, 1, 0, 1, 1, 1, 0, 1])); // 3

// Additional test cases
strictEqual(findMaxConsecutiveOnesCorrect([1, 1, 1]), 3);  // All ones
strictEqual(findMaxConsecutiveOnesCorrect([0, 0, 0]), 0);  // All zeros
strictEqual(findMaxConsecutiveOnesCorrect([1]), 1);         // Single 1
strictEqual(findMaxConsecutiveOnesCorrect([0]), 0);        // Single 0
strictEqual(findMaxConsecutiveOnesCorrect([]), 0);          // Empty array
strictEqual(findMaxConsecutiveOnesCorrect([1, 0, 1, 0, 1]), 1); // Alternating

// =============================================================================
// VARIATIONS OF THIS PROBLEM
//
// 1. WITH FLIP (HackerRank "Max Consecutive Ones II"):
//    - You can flip one 0 to 1
//    - Find maximum consecutive 1s after flipping at most one 0
//
//    Approach: Sliding window with zero counter
//    - Maintain a window with at most one 0
//    - Expand window, contract when we see a second 0
//
// 2. WITH K FLIPS:
//    - You can flip k zeros to 1s
//    - Find maximum consecutive 1s after k flips
//
//    Approach: Generalized sliding window
//    - Maintain a window with at most k zeros
//
// 3. FIND POSITION (not just count):
//    - Return the starting index of the max consecutive block
//    - Track start index along with count
// =============================================================================

console.log('\nAll tests passed!');
