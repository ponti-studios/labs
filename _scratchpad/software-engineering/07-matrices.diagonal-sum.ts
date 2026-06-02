/**
 * =============================================================================
 * LESSON 07: Matrix Diagonal Sum
 * =============================================================================
 * Category: Matrices & Arrays
 * Topics: Matrix traversal, diagonal indexing, array summation
 * Description: Calculates the absolute difference between the sums of the
 *              primary and secondary diagonals of a square matrix.
 */

// =============================================================================
// PROBLEM: Absolute Difference of Diagonal Sums
//
// Given a square matrix (n×n), calculate the absolute difference between:
// 1. Sum of primary diagonal (top-left to bottom-right)
// 2. Sum of secondary diagonal (top-right to bottom-left)
//
// Example matrix:
//   11  2  4
//    4  5  6
//   10  8 -12
//
// Primary diagonal (↘): a[0][0], a[1][1], a[2][2] = 11, 5, -12 → sum = 4
// Secondary diagonal (↙): a[0][2], a[1][1], a[2][0] = 4, 5, 10 → sum = 19
//
// |4 - 19| = 15
//
// Visual:
//   11  2  4        Primary: 11 + 5 + (-12) = 4
//    4  5  6        Secondary: 4 + 5 + 10 = 19
//   10  8 -12       |4 - 19| = 15
//
// =============================================================================

/**
 * Calculates the absolute difference between primary and secondary diagonal sums.
 *
 * Key Observations:
 * - Primary diagonal: indices where row === col (a[i][i])
 * - Secondary diagonal: indices where row + col === n - 1 (a[i][n-1-i])
 *
 * Time Complexity: O(n) - single pass through the diagonal elements
 * Space Complexity: O(n) - storing diagonal elements (could be O(1) by summing directly)
 *
 * @param {number} n - Dimension of the square matrix
 * @param {number[][]} a - The n×n matrix
 * @returns {number} - Absolute difference of diagonal sums
 */
export function main(n: number, a: number[][]): number {
  // =============================================================================
  // PRIMARY DIAGONAL (↘ - top-left to bottom-right)
  //
  // Elements at positions where row index === column index
  // For our 3×3 matrix example:
  //   a[0][0] = 11  ← row 0, col 0 (0 === 0)
  //   a[1][1] = 5   ← row 1, col 1 (1 === 1)
  //   a[2][2] = -12 ← row 2, col 2 (2 === 2)
  // =============================================================================
  var diagonal1: number[] = [];

  // =============================================================================
  // SECONDARY DIAGONAL (↙ - top-right to bottom-left)
  //
  // Elements at positions where row + col === n - 1
  // For our 3×3 matrix (n=3, so n-1=2):
  //   a[0][2] = 4   ← row 0, col 2 (0 + 2 = 2)
  //   a[1][1] = 5   ← row 1, col 1 (1 + 1 = 2)
  //   a[2][0] = 10  ← row 2, col 0 (2 + 0 = 2)
  // =============================================================================
  var diagonal2: number[] = [];

  /**
   * Maximum valid index for rows/columns.
   * Since arrays are 0-indexed in JavaScript:
   * - Index 0 is first element
   * - Index n-1 is last element
   * For n=3: indices are 0, 1, 2
   */
  var maximumCellIndex = n - 1;

  // =============================================================================
  // COLLECT DIAGONAL ELEMENTS
  //
  // We iterate through each row index i from 0 to n-1
  // For each i, we collect:
  // - Primary diagonal: a[i][i] (same row and column)
  // - Secondary diagonal: a[i][maximumCellIndex - i]
  // =============================================================================
  for (var i = 0; i <= maximumCellIndex; i++) {
    // PRIMARY DIAGONAL
    // Simply access a[i][i] - row i, column i
    //
    // Example trace for i = 0, 1, 2:
    //   i=0: a[0][0] = 11
    //   i=1: a[1][1] = 5
    //   i=2: a[2][2] = -12
    diagonal1.push(a[i][i]);

    // SECONDARY DIAGONAL
    // For row i, column is (maximumCellIndex - i)
    // This gives us the "mirrored" position in each row
    //
    // Example trace for 3×3 (maximumCellIndex = 2):
    //   i=0: a[0][2-0] = a[0][2] = 4  ← first row, last column
    //   i=1: a[1][2-1] = a[1][1] = 5  ← middle row, middle column
    //   i=2: a[2][2-2] = a[2][0] = 10 ← last row, first column
    diagonal2.push(a[i][maximumCellIndex - i]);
  }

  /**
   * Sums all elements in an array using reduce.
   *
   * reduce(callback, initialValue):
   * - callback(a, b): accumulator 'a' accumulates return values, 'b' is current element
   * - initialValue: starting value for accumulator (0 in this case)
   *
   * Trace for [11, 5, -12]:
   *   Initial: accumulator = 0
   *   After 11: accumulator = 0 + 11 = 11
   *   After 5: accumulator = 11 + 5 = 16
   *   After -12: accumulator = 16 + (-12) = 4
   *
   * @param {number[]} arr - Array to sum
   * @returns {number} - Sum of all elements
   */
  function arraySum(arr: number[]): number {
    return arr.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0);
  }

  // =============================================================================
  // CALCULATE ABSOLUTE DIFFERENCE
  //
  // diagonal1 = [11, 5, -12] → sum = 4
  // diagonal2 = [4, 5, 10] → sum = 19
  //
  // Difference = 4 - 19 = -15
  // Absolute value = |−15| = 15
  //
  // Math.abs() converts negative to positive, positive stays positive
  // =============================================================================
  return Math.abs(arraySum(diagonal1) - arraySum(diagonal2));
}

/**
 * More space-efficient version: O(1) space instead of O(n)
 *
 * Instead of storing diagonal elements in arrays, we sum them directly.
 * Also handles the center element of odd-sized matrices correctly
 * (it's counted once, not twice).
 */
export function diagonalDifferenceOptimized(matrix: number[][]): number {
  const n = matrix.length;
  let primarySum = 0;
  let secondarySum = 0;

  for (let i = 0; i < n; i++) {
    // Primary diagonal: a[i][i]
    primarySum += matrix[i][i];

    // Secondary diagonal: a[i][n-1-i]
    secondarySum += matrix[i][n - 1 - i];
  }

  // For odd n, the center element (a[n/2][n/2]) is counted twice
  // above, but it should only count once in each diagonal.
  // Actually wait - in a square matrix:
  // - Primary diagonal has elements where i=j
  // - Secondary diagonal has elements where i + j = n - 1
  // - The center element exists when n is odd and i = (n-1)/2
  // - At this point: i + j = 2i = n - 1, so it IS on both diagonals!
  //
  // But actually we're adding primarySum and secondarySum separately,
  // so the center element gets added twice in the difference calculation.
  // |primarySum - secondarySum| handles this correctly because we're
  // taking the absolute difference, not adding the sums.
  //
  // Example with odd matrix:
  //   1  2  3
  //   4  5  6
  //   7  8  9
  // Primary: 1+5+9 = 15
  // Secondary: 3+5+7 = 15
  // |15-15| = 0 ✓ (correct because both diagonals sum to the same)

  return Math.abs(primarySum - secondarySum);
}

// =============================================================================
// TESTING
// =============================================================================

// Test the original implementation
console.log(
  "Diagonal difference:",
  main(3, [
    [11, 2, 4],
    [4, 5, 6],
    [10, 8, -12],
  ]),
);
// Expected output: 15

// Test the optimized version
console.log(
  "Diagonal difference (optimized):",
  diagonalDifferenceOptimized([
    [11, 2, 4],
    [4, 5, 6],
    [10, 8, -12],
  ]),
);
// Expected output: 15

// Additional test cases
console.log(
  "5×5 matrix:",
  diagonalDifferenceOptimized([
    [1, 2, 3, 4, 5],
    [5, 6, 7, 8, 9],
    [9, 10, 11, 12, 13],
    [13, 14, 15, 16, 17],
    [17, 18, 19, 20, 21],
  ]),
);
// Primary: 1+6+11+16+21 = 55
// Secondary: 5+8+11+14+17 = 55
// |55-55| = 0
