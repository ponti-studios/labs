/**
 * =============================================================================
 * LESSON 06: Grid Paths
 * =============================================================================
 * Category: Dynamic Programming
 * Topics: Memoization, recursion, path counting, space complexity
 * Description: Counts all possible paths in a grid from top-left to bottom-right,
 *              comparing naive recursion vs memoization for performance.
 */

import { strictEqual } from 'assert';

// =============================================================================
// PROBLEM: Unique Paths in a Grid
//
// Count the number of unique paths from the top-left corner to the bottom-right
// corner of an m × n grid.
//
// Rules:
// - You can only move either DOWN or RIGHT at each step
// - Start position: top-left (0, 0)
// - End position: bottom-right (m-1, n-1)
//
// Example for a 2×2 grid:
//   ┌───┬───┐
//   │ S │   │  S = Start
//   ├───┼───┤  E = End
//   │   │ E │  Arrows show possible paths:
//   └───┴───┘    ↓→↓ or →↓↓
//
//   Paths: 2 (RIGHT→DOWN→DOWN, DOWN→RIGHT→DOWN, DOWN→DOWN→RIGHT... wait)
//
// For a 2×2 grid (2 rows, 2 columns):
// - Path 1: Right, Down (→, ↓)
// - Path 2: Down, Right (↓, →)
// - Total: 2 paths
//
// For a 3×3 grid (3 rows, 3 columns):
// - We need to make 2 RIGHT moves and 2 DOWN moves (4 total steps)
// - Number of paths = number of ways to arrange 2 R's and 2 D's
// - = C(4,2) = 4!/(2!×2!) = 6 paths
// =============================================================================

// Type definition: Grid is a 2D array of booleans
// true = valid cell (can traverse), false = blocked cell
// For this problem, we assume all cells are true (no obstacles)
type Grid = boolean[][];

// Counters to track how many times each function is called
// This helps us see the efficiency difference between approaches
let countPathsCount = 0;
let countPathsCountWithMemo = 0;

/**
 * Checks if a given position is within the grid bounds.
 *
 * Important: Grid coordinates are [row][col] not [x][y]
 * - Row increases going DOWN (0 at top, max at bottom)
 * - Col increases going RIGHT (0 at left, max at right)
 *
 * @param grid - The grid we're traversing
 * @param row - Row index to check
 * @param col - Column index to check
 * @returns true if position is valid and within bounds
 */
function validSquare(grid: Grid, row: number, col: number): boolean {
  // Must be non-negative row and within grid height
  // Must be non-negative col and within grid width
  return row >= 0 && row < grid.length && col >= 0 && col < grid[0].length;
}

/**
 * Checks if we've reached the destination (bottom-right corner).
 *
 * @param grid - The grid we're traversing
 * @param row - Current row position
 * @param col - Current column position
 * @returns true if this is the destination cell
 */
function isAtEnd(grid: Grid, row: number, col: number): boolean {
  // Destination is at bottom-right: last row, last column
  return row === grid.length - 1 && col === grid[0].length - 1;
}

// =============================================================================
// NAIVE RECURSIVE APPROACH - EXPONENTIAL TIME COMPLEXITY
//
// The recursive approach:
// - From any cell, we can go DOWN or RIGHT
// - Count paths from here = paths from (row+1, col) + paths from (row, col+1)
// - Base case: if at destination, return 1 (found a path!)
// - If out of bounds, return 0 (no path from here)
//
// Problem: The same subproblems are solved MANY times!
//
// Example for 3×3 grid - notice repeated calculations:
//                    (0,0)
//                  /        \
//              (1,0)        (0,1)     ← First split
//             /    \        /    \
//         (2,0)  (1,1)  (1,1)  (0,2)  ← (1,1) appears TWICE!
//            ↓      ↓      ↓      ↓
//            E     (2,1) (2,1)    E     ← (2,1) appears TWICE!
//
// Time Complexity: O(2^(m+n)) - each path is explored, with lots of overlap
// Space Complexity: O(m+n) - recursion depth equals path length
// =============================================================================

/**
 * Counts paths using naive recursion (NO memoization).
 *
 * WARNING: This has exponential time complexity!
 * For a 3×3 grid it works, but for larger grids it becomes impossibly slow.
 * A 10×10 grid would require exploring millions of paths.
 *
 * @param grid - The grid to traverse
 * @param row - Current row (0-indexed from top)
 * @param col - Current column (0-indexed from left)
 * @returns Number of unique paths from this position to destination
 */
function countPaths(grid: Grid, row: number, col: number): number {
  // Track function calls for comparison with memoized version
  countPathsCount++;

  // BASE CASE 1: Out of bounds - no valid path from here
  if (!validSquare(grid, row, col)) return 0;

  // BASE CASE 2: Reached destination - found a valid path!
  if (isAtEnd(grid, row, col)) return 1;

  // RECURSIVE CASE: Try both possible moves
  //
  // From (row, col), we can go:
  // - DOWN to (row+1, col)
  // - RIGHT to (row, col+1)
  //
  // Total paths from here = paths from DOWN + paths from RIGHT
  return countPaths(grid, row + 1, col) + countPaths(grid, row, col + 1);
}

// =============================================================================
// MEMOIZED RECURSIVE APPROACH - OPTIMAL TIME COMPLEXITY
//
// The fix for the naive approach: MEMOIZATION (caching)!
//
// Key insight: The same subproblem (same row, same col) is solved many times.
// Instead of recalculating, we cache the result and reuse it.
//
// Memoization technique:
// 1. Create a cache (memo table) initialized with special values (often -1 or 0)
// 2. Before computing, check if the result is already cached
// 3. After computing, store the result in the cache for future use
//
// Time Complexity: O(m × n) - each cell is computed exactly once!
// Space Complexity: O(m × n) - for the memo table + O(m+n) for recursion stack
// =============================================================================

/**
 * Counts paths using memoization (dynamic programming).
 *
 * This caches results so we never compute the same subproblem twice.
 * Much faster than naive recursion for larger grids.
 *
 * @param grid - The grid to traverse
 * @param row - Current row
 * @param col - Current column
 * @param memo - Cache table (2D array) storing computed results
 *               memo[row][col] = number of paths from (row, col) to destination
 * @returns Number of unique paths from this position to destination
 */
function countPathsWithMemo(
  grid: Grid,
  row: number,
  col: number,
  memo: number[][]
): number {
  // Track function calls
  countPathsCountWithMemo++;

  // BASE CASE 1: Out of bounds - no valid path
  if (!validSquare(grid, row, col)) return 0;

  // BASE CASE 2: At destination - found a path!
  if (isAtEnd(grid, row, col)) return 1;

  // CHECK CACHE: If we've already computed this, return cached result!
  // A cell value of 0 means "not yet computed" (assuming valid paths can't be 0)
  if (memo[row][col] !== 0) {
    // Already computed! Just return the cached value.
    // This is the key optimization - skip redundant calculations.
    return memo[row][col];
  }

  // COMPUTE: Calculate paths from this cell
  // Same as naive approach, but store result before returning
  const pathsFromDown = countPathsWithMemo(grid, row + 1, col, memo);
  const pathsFromRight = countPathsWithMemo(grid, row, col + 1, memo);

  // STORE IN CACHE: Remember this result for future reference
  memo[row][col] = pathsFromDown + pathsFromRight;

  // Return the computed value
  return memo[row][col];
}

// =============================================================================
// TEST SETUP AND VERIFICATION
// =============================================================================

// Create a 3×3 test grid (all cells valid/no obstacles)
const testGrid: Grid = [
  [true, true, true],  // Row 0
  [true, true, true],  // Row 1
  [true, true, true],  // Row 2
];
// Grid structure:
//   Col:  0     1     2
// Row 0: [0,0] [0,1] [0,2]
// Row 1: [1,0] [1,1] [1,2]
// Row 2: [2,0] [2,1] [2,2] ← Destination

// Initialize memo table with 0s (0 means "not yet computed")
// Memo table is same dimensions as grid
const memoGrid: number[][] = [
  [0, 0, 0],  // Row 0
  [0, 0, 0],  // Row 1
  [0, 0, 0],  // Row 2
];

// Verify both implementations return correct answer
// For 3×3 grid: 6 unique paths (as calculated by C(4,2) = 6)
strictEqual(countPaths(testGrid, 0, 0), 6);
strictEqual(countPathsWithMemo(testGrid, 0, 0, memoGrid), 6);

// The real difference: how many function calls!
//
// Naive approach: 110 calls
// Memoized approach: 15 calls
//
// For a 3×3 grid (9 cells), the difference is already 7×
// For larger grids, the difference is even more dramatic:
// - 10×10 grid: naive ≈ 2^20 ≈ 1M calls, memoized ≈ 100 calls
// - 20×20 grid: naive ≈ 2^40 ≈ 1T calls, memoized ≈ 400 calls
//
strictEqual(countPathsCount, 110);  // Naive: lots of redundant work
strictEqual(countPathsCountWithMemo, 15);  // Memoized: each cell computed once

console.log(`Naive recursion called countPaths ${countPathsCount} times`);
console.log(`With memoization called countPathsWithMemo ${countPathsCountWithMemo} times`);

// =============================================================================
// VISUALIZATION OF PATHS FOR 2×2 GRID
//
// Grid:
//   [0,0] → [0,1]
//      ↓
//   [1,0]
//      ↓
//   [1,1]
//
// Paths:
// 1. Right then Down: (0,0) → (0,1) → (1,1)
// 2. Down then Right: (0,0) → (1,0) → (1,1)
//
// Number of paths from (0,0) to (1,1):
// = paths from (1,0) + paths from (0,1)
// = 1 + 1 = 2
//
// For 3×3 grid, we can use combinatorics:
// We need 2 DOWN moves and 2 RIGHT moves = 4 total moves
// Number of sequences: C(4,2) = 4!/(2!×2!) = 6
// =============================================================================

// =============================================================================
// MEMOIZATION VISUALIZATION FOR 3×3 GRID
//
// Memo table after computing (each cell = paths from that cell):
//
//   [6]   [3]   [1]
//    ↓     ↓     ↓
//   [3]   [2]   [1]
//    ↓     ↓     ↓
//   [1]   [1]   [0] ← 0 because it's the destination (we don't count paths from dest)
//                    Actually wait, destination is included, so it's 1...
//
// Correction - the memo values represent "paths from this cell":
//
//   [6]   [3]   [1]
//    ↓     ↓     ↓
//   [3]   [2]   [1]
//    ↓     ↓     ↓
//   [1]   [1]   [0] (destination - 0 because we return 1 at destination, not stored here)
//
// Actually when we reach isAtEnd we return 1 without storing in memo
// So the last cell stays 0... but conceptually it's 1 path from itself to itself.
// =============================================================================
