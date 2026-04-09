/**
 * =============================================================================
 * LESSON 08: Fibonacci Sequence
 * =============================================================================
 * Category: Dynamic Programming
 * Topics: Memoization, recursion, time complexity, optimization
 * Description: The Fibonacci sequence where each number is the sum of the two
 *              preceding ones. Compares naive recursive vs memoized approach.
 */

import { strictEqual } from 'assert';

// =============================================================================
// FIBONACCI SEQUENCE
//
// The Fibonacci sequence: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, ...
//
// Definition:
//   F(0) = 0
//   F(1) = 1
//   F(n) = F(n-1) + F(n-2) for n > 1
//
// Each number is the sum of the two preceding numbers:
//   0 + 1 = 1
//   1 + 1 = 2
//   1 + 2 = 3
//   2 + 3 = 5
//   3 + 5 = 8
//   etc.
//
// Visual representation as a tree:
//                         fib(5)
//                        /      \
//                   fib(4)      fib(3)
//                   /    \      /    \
//               fib(3) fib(2) fib(2) fib(1)
//               /   \
//           fib(2) fib(1)
//
// Notice how fib(2) is calculated 3 times, fib(1) is calculated 5 times!
// This redundancy is why naive recursion is so slow.
// =============================================================================

// Counters to track function calls for comparison
let count: number = 0;
let countWithMemo: number = 0;

/**
 * NAIVE FIBONACCI - Exponential Time Complexity O(2^n)
 *
 * This is the direct recursive implementation following the definition.
 * It's simple but EXTREMELY inefficient due to massive redundant calculations.
 *
 * The problem: Same subproblems are solved无数 times!
 *
 * Call tree for fib(5):
//                         fib(5)
//                        /      \
//                   fib(4)      fib(3)      ← First level: 2 calls
//                   /    \      /    \
//               fib(3) fib(2) fib(2) fib(1)  ← Second level: 4 calls
//               /   \
//           fib(2) fib(1)                       ← Third level: 5 calls
//
// Total calls for fib(5): 15
// Total calls for fib(10): 177 (see actual count in tests)
// Total calls for fib(30): 2,692,537 (over 2 million!)
// Total calls for fib(40): 331,160,281 (331 million!)
//
// Time Complexity: O(2^n) - exponential, doubling with each increment of n
// Space Complexity: O(n) - recursion depth equals n
 *
 * @param {number} n - Position in Fibonacci sequence (0-indexed)
 * @returns {number} - Fibonacci number at position n
 */
function fib(n: number): number {
  // Track every function call
  count += 1;

  // BASE CASES
  // F(0) = 0: If n is 0 or negative, return 0
  // F(1) = 1: If n is 1, return 1
  //
  // These are the "stopping conditions" that prevent infinite recursion.
  // Without these, the function would recurse forever (or until stack overflow).
  if (n <= 0) return 0;
  if (n === 1) return 1;

  // RECURSIVE CASE
  // F(n) = F(n-1) + F(n-2)
  //
  // To get fib(n), we need fib(n-1) and fib(n-2).
  // Each of those needs two more calls, and so on...
  return fib(n - 1) + fib(n - 2);
}

/**
 * FIBONACCI WITH MEMOIZATION - Optimal Time Complexity O(n)
 *
 * Memoization: Store computed results and reuse them.
 *
 * Instead of recalculating fib(k) every time we need it,
 * we check if we've already computed it and use the cached value.
 *
 * Key Insight:
 * - There are only n possible subproblems (fib(0) through fib(n))
 * - Once we compute fib(k), we never need to compute it again
 * - This reduces from O(2^n) to O(n) time!
 *
 * Time Complexity: O(n) - each fib(0) through fib(n) computed exactly once
 * Space Complexity: O(n) - memo table size + O(n) recursion depth
 *
 * @param {number} n - Position in Fibonacci sequence
 * @param {Map<number, number>} memo - Cache storing computed Fibonacci values
 * @returns {number} - Fibonacci number at position n
 */
function fibWithMemo(n: number, memo: Map<number, number>): number {
  // Track function calls (now much fewer!)
  countWithMemo += 1;

  // BASE CASES - same as naive version
  if (n <= 0) return 0;
  if (n === 1) return 1;

  // CHECK CACHE FIRST!
  // If we've already computed fib(n), return it immediately
  // memo.has(n) returns true if n is a key in the Map
  if (!memo.has(n)) {
    // NOT IN CACHE: Compute it and store the result
    //
    // The computation is the same as naive:
    // fib(n) = fib(n-1) + fib(n-2)
    //
    // But now when fib(n-1) computes fib(n-2), that result is cached!
    // This cascades - computing fib(n) only requires n calls total
    // instead of exponentially many.
    const fibNMinus1 = fibWithMemo(n - 1, memo);
    const fibNMinus2 = fibWithMemo(n - 2, memo);

    // Store in memo for future use
    // memo.set(key, value) adds/updates an entry in the Map
    memo.set(n, fibNMinus1 + fibNMinus2);
  }

  // RETURN CACHED VALUE
  // memo.get(n) retrieves the value stored for key n
  // The `!` tells TypeScript we know the value exists (we just set it above)
  return memo.get(n)!;
}

// =============================================================================
// VISUAL COMPARISON: NAIVE VS MEMOIZED
//
// NAIVE fib(5) call tree:
//                         fib(5)                     ← Call 1
//                        /      \
//                   fib(4)      fib(3)               ← Calls 2, 3
//                   /    \      /    \
//               fib(3) fib(2) fib(2) fib(1)         ← Calls 4-7
//               /   \
//           fib(2) fib(1)                           ← Calls 8-9
//
// Total: 9 calls (some versions count differently, but massive redundancy)
//
// MEMOIZED fib(5) call tree:
//                         fib(5)                     ← Compute, cache
//                        /      \
//                   fib(4)      fib(3)               ← Compute both, cache
//                   /    \      /    \
//               fib(3) fib(2) fib(2) fib(1)         ← fib(3) from cache!
//               /   \      ↑
//           fib(2) fib(1)  ↑
//               ↑    ↑      ↑
//            All from cache now!
//
// Total: 11 calls (but each unique subproblem only computed once)
// Actually the count is lower because many calls return immediately from cache
// =============================================================================

// =============================================================================
// TESTING
// =============================================================================

// Verify correctness: fib(10) should be 55
// Fibonacci sequence: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55
// Position 10 = 55 ✓
strictEqual(fib(10), 55);

// Test memoized version
strictEqual(fibWithMemo(10, new Map()), 55);

// Verify memoized is faster (fewer calls)
strictEqual(countWithMemo < count, true);

// Actual call counts show the dramatic difference:
// - count (naive): 177 calls for fib(10)
// - countWithMemo (memoized): much fewer (~19 calls for fib(10))
console.log(`Naive fib() called ${count} times`);
console.log(`With memoization fibWithMemo() called ${countWithMemo} times`);

// =============================================================================
// FIBONACCI VARIATIONS & APPLICATIONS
//
// 1. Tabulation (Bottom-up DP):
//    Instead of recursion + memoization, build up from base cases iteratively
//
//    function fibTabular(n):
//      if n <= 1: return n
//      dp[0] = 0
//      dp[1] = 1
//      for i in 2..n:
//        dp[i] = dp[i-1] + dp[i-2]
//      return dp[n]
//
// 2. Space Optimization:
//    We only need the previous two values, not the entire array!
//    function fibOptimized(n):
//      if n <= 1: return n
//      prev2 = 0, prev1 = 1
//      for i in 2..n:
//        curr = prev1 + prev2
//        prev2 = prev1
//        prev1 = curr
//      return prev1
//
// 3. Applications of Fibonacci:
//    - Golden ratio and nature (flower petals, pine cones)
//    - Algorithm analysis (Euclidean algorithm worst case)
//    - Financial markets (Fibonacci retracement)
//    - String algorithms (Fibonacci encoding)
// =============================================================================

/**
 * Iterative Fibonacci with space optimization - O(n) time, O(1) space
 *
 * We only need to track the previous two Fibonacci numbers at any point,
 * so we don't need an entire array or deep recursion.
 */
function fibIterative(n: number): number {
  if (n <= 0) return 0;
  if (n === 1) return 1;

  // Initialize the base cases
  let prev2 = 0;  // F(0)
  let prev1 = 1;  // F(1)

  // Build up to F(n) iteratively
  // At each step, we compute F(i) = F(i-1) + F(i-2)
  for (let i = 2; i <= n; i++) {
    const current = prev1 + prev2;  // F(i) = F(i-1) + F(i-2)
    prev2 = prev1;                  // Move forward: F(i-2) becomes old F(i-1)
    prev1 = current;                // Move forward: F(i-1) becomes new F(i)
  }

  return prev1;  // prev1 now holds F(n)
}

// Verify iterative version
console.log("\nIterative Fibonacci:");
console.log(`fibIterative(10) = ${fibIterative(10)}`);  // Should be 55
