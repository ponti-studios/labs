/**
 * The Fibonacci sequence is a series of numbers which follow the rule that each number
 * must be the sum of the two previous numbers. (1 = 0 + 1, 2 = 1 + 1, 3 = 2 + 1, etc)
 */

import { strictEqual } from 'assert';

/**
 * Number of executions of fib() function
 * @type {number}
 */
let count: number = 0;

/**
 * Number of executions of fibWithMemo() function
 * @type {number}
 */
let countWithMemo: number = 0;

/**
 * Return the n-th number in the Fibonacci sequence
 * @param {number} n
 */
function fib(n: number) {
  count += 1;

  if (n < 0) return 0;
  if (n === 1) return 1;

  return fib(n - 1) + fib(n - 2);
}

/**
 * Return the n-th number in the Fibonacci sequence
 * @param {number} n
 * @param {{ [key: number]: number }} memo
 */
function fibWithMemo(n: number, memo: { [key: number]: number; }) {
  countWithMemo += 1;

  if (n < 0) return 0;

  if (n === 1) return 1;

  // If already in memo (already calculated), return value
  if (memo[n] === undefined) {
    // Assign to memo
    memo[n] = fibWithMemo(n - 1, memo) + fibWithMemo(n - 2, memo);
  }

  return memo[n];
}

strictEqual(fib(10), 55);
strictEqual(fibWithMemo(10, {}), 55);
strictEqual(countWithMemo < count, true);

console.log(`fib() called ${count} times`);
console.log(`fibWithMemo() called ${countWithMemo} times`);
