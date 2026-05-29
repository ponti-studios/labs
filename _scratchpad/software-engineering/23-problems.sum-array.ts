/**
 * =============================================================================
 * LESSON 23: Sum Array
 * =============================================================================
 * Category: Problems
 * Topics: Iteration, arithmetic series, constant-time optimization
 * Description: Compares summing an array with looping and using the arithmetic
 *              series formula for 1..n.
 */

import { strictEqual } from "assert";

// =============================================================================
// SUM ARRAY OVERVIEW
//
// There are two related ideas in this lesson:
//
// 1. Summing the values in an existing array by looping through it.
// 2. Summing the integers from 1 to n using either a loop or a formula.
//
// The formula version is much faster for large n because it runs in O(1).
// =============================================================================

/**
 * Sum the values in an array.
 */
export function sumOfNumbers(numbers: number[]): number {
  let result = 0;

  for (const number of numbers) {
    result += number;
  }

  return result;
}

/**
 * Sum the numbers from 1 to n using a loop.
 */
export function sumUp(n: number): number {
  let result = 0;

  for (let i = 1; i <= n; i++) {
    result += i;
  }

  return result;
}

/**
 * Sum the numbers from 1 to n using the arithmetic-series formula.
 */
export function sumUpFormula(n: number): number {
  return (n * (n + 1)) / 2;
}

/**
 * Trace of the formula on n = 10:
 *
 * sum = 10 * 11 / 2 = 55
 */

// =============================================================================
// SELF-TESTS
// =============================================================================

strictEqual(sumOfNumbers([1, 2, 3, 4, 5]), 15);
strictEqual(sumUp(10), 55);
strictEqual(sumUpFormula(10), 55);
strictEqual(sumUpFormula(100), 5050);

console.log("sumOfNumbers([1, 2, 3, 4, 5]):", sumOfNumbers([1, 2, 3, 4, 5]));
console.log("sumUp(10):", sumUp(10));
console.log("sumUpFormula(10):", sumUpFormula(10));
