/**
 * =============================================================================
 * LESSON 04: Maximum Subarray
 * =============================================================================
 * Category: Algorithms / Dynamic Programming
 * Topics: Kadane's algorithm, sliding window, array traversal
 * Description: Finds the contiguous subarray with the largest sum
 *              using Kadane's algorithm with O(n) time complexity.
 */

import { strictEqual } from 'assert';

// =============================================================================
// PROBLEM: Maximum Subarray
//
// Find the contiguous subarray (one continuous slice) that has the largest sum.
//
// Example:
//   Input:  [-2, 1, -3, 4, -1, 2, 1, -5, 4]
//   Output: 6 (from subarray [4, -1, 2, 1])
//
//   Visualizing the array:
//   Index:    0   1   2   3   4   5   6   7   8
//   Value:   -2   1  -3   4  -1   2   1  -5   4
//                     └─────┘     └───────┘
//                   -3+4-1+2+1=3    4-1+2+1=6 ← maximum!
//
// Why contiguous?
// - "Contiguous" means elements must be adjacent in the original array
// - [4, -1, 2, 1] is contiguous (indices 3-6)
// - [4, -1, 2, 1, -5] is NOT contiguous (there's a gap)
//
// This is a classic interview question that can be solved several ways:
// 1. Brute force: O(N³) or O(N²) - check all subarrays
// 2. Divide and conquer: O(N log N) - split array and combine
// 3. Kadane's algorithm: O(N) - optimal!
// =============================================================================

/**
 * BRUTE FORCE APPROACH - O(N²) time, O(1) space
 *
 * For each starting index i, try all ending indices j and calculate sum.
 * Track the maximum sum seen.
 *
 * This is still better than O(N³) which recalculates sums redundantly.
 *
 * Why it's suboptimal:
 * - We recalculate the sum of [i..j] when we already calculated [i..j-1]
 * - At minimum we need to look at every pair (i, j), hence O(N²)
 */
function maxSubArrayNaive(nums: number[]): number {
  // Initialize maxSum to the first element
  // This handles the case where all numbers are negative
  // (we must include at least one element)
  let maxSum = nums[0];

  // Try every possible starting point
  for (let i = 0; i < nums.length; i++) {
    // For each starting point, accumulate sum going to each ending point
    let currentSum = 0;

    // Try every possible ending point, starting from i
    for (let j = i; j < nums.length; j++) {
      // Add element at j to current subarray sum
      currentSum += nums[j];

      // Update max if this subarray is better
      if (currentSum > maxSum) {
        maxSum = currentSum;
      }
    }
    // At this point, we've checked all subarrays starting at i
    // Move to next starting position
  }

  return maxSum;
}

/**
 * KADANE'S ALGORITHM - O(N) time, O(1) space
 *
 * The key insight:
 * - At each position, we either START a new subarray OR EXTEND the previous one
 * - If current element is LARGER than our accumulated sum, start fresh from here
 * - Otherwise, keep extending the existing subarray
 *
 * Why this works:
 * - If currentSum + nums[i] < nums[i], then nums[i] alone is a better subarray
 * - If currentSum + nums[i] >= nums[i], then nums[i] extends the best subarray
 *
 * Visual example on [-2, 1, -3, 4, -1, 2, 1, -5, 4]:
 *
 *   i=0: currentSum=-2, maxSum=-2  (start with -2)
 *   i=1: currentSum=max(-2+1=-1, 1)=1  (start fresh at 1, better than -1)
 *   i=2: currentSum=max(1+(-3)=-2, -3)=-2  (1 alone is better than 1+(-3))
 *   i=3: currentSum=max(-2+4=2, 4)=4  (start fresh at 4)
 *   i=4: currentSum=max(4+(-1)=3, -1)=-1  (wait, 4 alone is better than 4-1=3)
 *         ↑ ERROR IN THIS EXPLANATION - see corrected below
 *
 * CORRECTED TRACE:
 *   i=0: currentSum=-2, maxSum=-2
 *   i=1: currentSum=max(-2+1, 1) = max(-1, 1) = 1  (start fresh at 1)
 *   i=2: currentSum=max(1+(-3)=-2, -3) = -2       (extend 1,-3 gives -2, but -3 alone is -2... wait)
 *         Actually: max(1+(-3)=-2, -3) = -2
 *   i=3: currentSum=max(-2+4=2, 4) = 4            (start fresh at 4)
 *   i=4: currentSum=max(4+(-1)=3, -1) = 3         (extend with -1 gives 3, but 4 alone is 4...)
 *         Wait, currentSum at i=3 was 4, so:
 *         currentSum = max(4 + (-1), -1) = max(3, -1) = 3
 *   i=5: currentSum = max(3 + 2, 2) = max(5, 2) = 5
 *   i=6: currentSum = max(5 + 1, 1) = max(6, 1) = 6  ← maxSum becomes 6!
 *   i=7: currentSum = max(6 + (-5) = 1, -5) = 1
 *   i=8: currentSum = max(1 + 4 = 5, 4) = 5
 *
 * Result: maxSum = 6, from subarray [4, -1, 2, 1] at indices 3-6
 */
function maxSubArray(nums: number[]): number {
  // Initialize both to first element
  // We must include at least one element (contiguous requirement)
  let maxSum = nums[0];
  let currentSum = nums[0];

  // Start from index 1 (we've already processed index 0)
  for (let i = 1; i < nums.length; i++) {
    // KEY DECISION: Start new subarray OR extend existing?
    //
    // Option 1: Start fresh at nums[i]
    //   This means the subarray is just [nums[i]]
    //
    // Option 2: Extend the previous subarray: currentSum + nums[i]
    //   This means nums[i] is added to the best subarray ending at i-1
    //
    // We take whichever is larger.
    // If nums[i] alone is bigger, the previous subarray wasn't helping.
    currentSum = Math.max(nums[i], currentSum + nums[i]);

    // Track the best sum we've seen so far
    // (could be from an earlier subarray, not necessarily the current one)
    maxSum = Math.max(maxSum, currentSum);
  }

  return maxSum;
}

/**
 * KADANE'S ALGORITHM WITH INDICES - O(N) time, O(1) space
 *
 * Same as above, but also tracks WHERE the maximum subarray starts and ends.
 *
 * Key tracking variables:
 * - currentStart: where the current subarray would start if we extend
 * - maxStart: start index of the maximum subarray found so far
 * - maxEnd: end index of the maximum subarray found so far
 */
function maxSubArrayWithIndices(
  nums: number[]
): { sum: number; start: number; end: number } {
  // Initialize with first element
  let maxSum = nums[0];
  let currentSum = nums[0];

  // These track the START of the best subarray we've seen
  let maxStart = 0;
  let maxEnd = 0;
  let currentStart = 0;

  // Iterate from second element
  for (let i = 1; i < nums.length; i++) {
    // DECISION: Start new subarray or extend?
    //
    // If nums[i] is greater than (currentSum + nums[i]),
    // it means starting fresh at i gives a better (or equal) sum.
    // In that case, currentStart becomes i (new subarray starts here).
    //
    // Otherwise, we extend the existing subarray, keeping currentStart.
    if (nums[i] > currentSum + nums[i]) {
      // Start fresh - nums[i] alone is better than adding it to current
      currentSum = nums[i];
      currentStart = i;  // Remember where this new subarray starts
    } else {
      // Extend existing - add nums[i] to the current subarray sum
      currentSum = currentSum + nums[i];
      // currentStart stays the same (still the start of this subarray)
    }

    // CHECK: Is the current subarray better than the best we've seen?
    if (currentSum > maxSum) {
      // New maximum found! Update all tracking variables
      maxSum = currentSum;
      maxStart = currentStart;
      maxEnd = i;  // Current index is the end of this subarray
    }
    // Note: if currentSum <= maxSum, we don't update maxStart/maxEnd
    // This means the previous max subarray is still the best
  }

  // Return the maximum sum and its boundaries (inclusive indices)
  return { sum: maxSum, start: maxStart, end: maxEnd };
}

// =============================================================================
// TEST CASES
// =============================================================================

const testCases = [
  // Case 1: Classic example with mixed positive/negative
  { input: [-2, 1, -3, 4, -1, 2, 1, -5, 4], expected: 6 },
  // Subarray [4, -1, 2, 1] = 4 + (-1) + 2 + 1 = 6

  // Case 2: Single element
  { input: [1], expected: 1 },
  // Only one choice, so it's the maximum

  // Case 3: All positive - the whole array is the answer
  { input: [5, 4, -1, 7, 8], expected: 23 },
  // Subarray [5, 4, -1, 7, 8] = 23 (the whole array)

  // Case 4: All negative - take the least negative (largest) element
  { input: [-1, -2, -3, -4], expected: -1 },
  // Only [-1] gives the maximum sum of -1
];

// Run all test cases
for (const { input, expected } of testCases) {
  strictEqual(maxSubArray(input), expected);
}

// Show the result with indices
const result = maxSubArrayWithIndices([-2, 1, -3, 4, -1, 2, 1, -5, 4]);
console.log(
  `Max subarray: [${result.start}:${result.end}] = ${result.sum}`
);
// Output: "Max subarray: [3:6] = 6"

// Show which elements form the max subarray
const slice = [-2, 1, -3, 4, -1, 2, 1, -5, 4].slice(result.start, result.end + 1);
console.log(
  `Contributing elements: [${slice.join(", ")}] = ${slice.reduce((a, b) => a + b, 0)}`
);
// Output: "Contributing elements: [4, -1, 2, 1] = 6"

// =============================================================================
// WHY KADANE'S ALGORITHM IS CORRECT
//
// Proof by contradiction:
//
// Assume at position i, currentSum represents the maximum subarray ending at i.
//
// At position i+1, either:
// 1. The max subarray ending at i+1 includes element i (extends)
//    Then sum = currentSum + nums[i+1]
// 2. Or it doesn't include any element from the previous subarray
//    Then sum = nums[i+1] (starts fresh)
//
// We take max(nums[i+1], currentSum + nums[i+1])
// This gives us the maximum subarray ending at i+1.
//
// By induction, this holds for all positions.
//
// The maxSum variable tracks the global maximum seen at ANY position.
// So when we finish, maxSum is the maximum subarray sum in the entire array.
//
// QED (quod erat demonstrandum - "which was to be demonstrated")
// =============================================================================
