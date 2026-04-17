/**
 * =============================================================================
 * LESSON 03: Array Equilibrium
 * =============================================================================
 * Category: Arrays & Search
 * Topics: Prefix sums, equilibrium index, array partitioning
 * Description: Finds an index where the sum of elements on the left equals
 *              the sum of elements on the right.
 */

// =============================================================================
// PROBLEM: Find Equilibrium Index
//
// An equilibrium index P is where:
//   sum(A[0] to A[P-1]) === sum(A[P+1] to A[N-1])
//
// The element at index P is NOT included in either sum.
// Think of it like a fulcrum/balance point - elements on both sides balance.
//
// Special cases:
// - P = 0: Left sum is 0 (no elements), right sum must be 0
// - P = N-1: Right sum is 0 (no elements), left sum must be 0
//
// Examples from problem statement:
//   A = [-1, 3, -4, 5, 1, -6, 2, 1]
//
//   P=1: sum[-1] === sum[3..7] = 3+(-4)+5+1+(-6)+2+1 = 0 ✓
//   P=3: sum[-1+3+(-4)] = -2 === sum[5+1+(-6)+2+1] = -2 ✓
//   P=7: sum[-1+3+(-4)+5+1+(-6)+2] = 0 === sum[] = 0 ✓
//
// Complexity requirement: O(N) time, O(N) space
// =============================================================================

/**
 * Test array from the problem statement.
 *
 * Visual representation:
 * Index:  0   1   2   3   4   5   6   7
 * Value: -1,  3, -4,  5,  1, -6,  2,  1
 *         ↑                       ↑
 *      P=0 sum left=0          P=7 sum right=0
 *
 * P=1 is equilibrium: left=[-1], right=[-4,5,1,-6,2,1] both sum to -1
 * P=3 is equilibrium: left=[-1,3,-4], right=[1,-6,2,1] both sum to -2
 * P=7 is equilibrium: left=[-1,3,-4,5,1,-6,2], right=[] both sum to 0
 */
var array = [
  -1,
  3,
  -4,
  5,
  1,
  -6,
  2,
  1
]

// =============================================================================
// NAIVE APPROACH (O(N²)) - DON'T USE FOR LARGE ARRAYS
//
// For each index P, calculate:
//   leftSum = sum of elements before P
//   rightSum = sum of elements after P
//
// This is O(N²) because for each of N positions, we sum up to N elements.
// =============================================================================

/**
 * Naive O(N²) approach - for educational purposes only.
 *
 * For each index, we recalculate both sums from scratch.
 * This works but is inefficient for large arrays.
 *
 * @param {number[]} A - Input array
 * @returns {number} - First equilibrium index found, or -1
 */
function naiveApproach(A) {
  for (let p = 0; p < A.length; p++) {
    let leftSum = 0
    let rightSum = 0

    // Calculate sum of elements before index P
    // These are indices 0 to P-1 (P elements)
    for (let i = 0; i < p; i++) {
      leftSum += A[i]
    }

    // Calculate sum of elements after index P
    // These are indices P+1 to N-1
    for (let i = p + 1; i < A.length; i++) {
      rightSum += A[i]
    }

    if (leftSum === rightSum) {
      return p
    }
  }
  return -1
}

// =============================================================================
// OPTIMAL APPROACH (O(N)) - PREFIX SUMS
//
// Key insight: Instead of recalculating sums, use prefix sums.
//
// Prefix sum at index P: sum of elements from 0 to P-1
//
// Total sum - prefix sum at P = sum of elements after P
//
// For equilibrium at P:
//   prefixSum[P] === totalSum - prefixSum[P] - A[P]
//   2 * prefixSum[P] === totalSum - A[P]
//   prefixSum[P] === (totalSum - A[P]) / 2
//
// BUT simpler: keep track of total sum and subtract as we go
// =============================================================================

/**
 * Finds the FIRST equilibrium index using O(N) algorithm.
 *
 * Algorithm:
 * 1. Calculate total sum of all elements
 * 2. Iterate from left to right, maintaining "left sum so far"
 * 3. At each index P:
 *    - right sum = total sum - left sum - A[P]
 *    - if left sum === right sum, P is equilibrium
 *    - update left sum to include A[P] for next iteration
 *
 * Time Complexity: O(N) - two passes through array
 * Space Complexity: O(1) - only using a few variables
 *
 * @param {number[]} A - Input array
 * @returns {number} - First equilibrium index, or -1 if none exists
 */
export function solution(A) {
  // Calculate the total sum of all elements in one pass
  // This represents: left sum + A[P] + right sum for any position P
  const totalSum = A.reduce((sum, val) => sum + val, 0)

  // leftSum tracks the sum of all elements we've seen so far
  // (elements at indices 0 to P-1)
  let leftSum = 0

  // Iterate through each index and check if it's an equilibrium point
  for (let p = 0; p < A.length; p++) {
    // Right sum = total sum - left sum - current element
    // This is the sum of all elements AFTER index P
    const rightSum = totalSum - leftSum - A[p]

    // Check if current index is equilibrium
    if (leftSum === rightSum) {
      return p  // Found it! Return immediately (first equilibrium)
    }

    // Add current element to leftSum for next iteration
    // After this, leftSum = sum of elements at indices 0 to P
    leftSum += A[p]
  }

  // No equilibrium index found
  return -1
}

/**
 * Finds ALL equilibrium indices in the array.
 *
 * Uses the same O(N) prefix sum approach but continues checking
 * all indices instead of returning early.
 *
 * @param {number[]} A - Input array
 * @returns {number[]} - Array of all equilibrium indices (empty if none)
 */
export function solutionFindingAllIndexes(A) {
  // Edge cases: arrays with 0 or 1 elements
  // For single element: left and right sums are both 0, so index 0 is always equilibrium
  if (A.length === 1) return [0]

  // Empty array has no equilibrium
  if (A.length === 0) return []

  const totalSum = A.reduce((sum, val) => sum + val, 0)
  let leftSum = 0
  const indexes = []

  // Same algorithm as solution(), but collect all matches
  for (let p = 0; p < A.length; p++) {
    const rightSum = totalSum - leftSum - A[p]

    if (leftSum === rightSum) {
      indexes.push(p)
    }

    leftSum += A[p]
  }

  return indexes
}

// =============================================================================
// TESTING
// =============================================================================

console.log('Test array:', array)
console.log('First equilibrium index:', solution(array))
// Expected output: 1 (because sum before 1 = -1, sum after 1 = -1)

// Test additional cases
const testCases = [
  { input: [1, 2, 3], expected: null },      // No equilibrium
  { input: [1], expected: 0 },                // Single element (0 === 0)
  { input: [-1, 3, -4, 5, 1, -6, 2, 1], expected: 1 },
  { input: [1, 2, 1], expected: 1 },          // [1] === [1]
  { input: [0, 0, 0], expected: 0 },          // [0] === [0,0]
]

console.log('\n--- Testing solution() ---')
for (const { input, expected } of testCases) {
  const result = solution(input)
  console.log(`Input: [${input}] -> Index: ${result} (expected: ${expected})`)
}

console.log('\n--- Testing solutionFindingAllIndexes() ---')
console.log(`All indices: [${solutionFindingAllIndexes(array)}]`)
// Expected: [1, 3, 7]
