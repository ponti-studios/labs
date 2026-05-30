/**
 * =============================================================================
 * LESSON 22: Swap Elements
 * =============================================================================
 * Category: Problems
 * Topics: Mutation, temporary variables, immutability
 * Description: Demonstrates broken, standard, and functional approaches to
 *              swapping two elements in an array.
 */

import { deepStrictEqual, strictEqual } from "assert";

// =============================================================================
// SWAP OVERVIEW
//
// Swapping two values looks simple, but it is easy to get wrong.
//
// The common mistake is to overwrite one value before preserving it.
// The standard fix is to use a temporary variable.
// A functional approach can also build a new array without mutating the input.
// =============================================================================

/**
 * Broken swap - demonstrates a common mistake.
 */
export function brokenSwap(array: any[], firstIndex: number, secondIndex: number): any[] {
  array[firstIndex] = array[secondIndex];
  array[secondIndex] = array[firstIndex];

  return array;
}

/**
 * Standard swap using a temporary variable.
 */
export function swap(array: any[], firstIndex: number, secondIndex: number): any[] {
  const temp = array[firstIndex];
  array[firstIndex] = array[secondIndex];
  array[secondIndex] = temp;

  return array;
}

/**
 * Functional swap - creates a new array instead of mutating the original.
 */
export function functionalSwap(array: any[], firstIndex: number, secondIndex: number): any[] {
  return array.reduce((result, value, index) => {
    if (index === firstIndex) result.push(array[secondIndex]);
    else if (index === secondIndex) result.push(array[firstIndex]);
    else result.push(value);
    return result;
  }, [] as any[]);
}

/**
 * Trace of the broken version on [1, 2, 3]:
 *
 * Step 1: array[0] = array[2] -> [3, 2, 3]
 * Step 2: array[2] = array[0] -> still [3, 2, 3]
 * Result: the original value at index 0 is lost.
 */

// =============================================================================
// SELF-TESTS
// =============================================================================

const original = [1, 2, 3];

deepStrictEqual(brokenSwap([...original], 0, 2), [3, 2, 3]);
deepStrictEqual(swap([...original], 0, 2), [3, 2, 1]);
deepStrictEqual(functionalSwap(original, 0, 2), [3, 2, 1]);
strictEqual(original.join(","), "1,2,3");

console.log("brokenSwap([1, 2, 3], 0, 2):", brokenSwap([...original], 0, 2));
console.log("swap([1, 2, 3], 0, 2):", swap([...original], 0, 2));
console.log("functionalSwap([1, 2, 3], 0, 2):", functionalSwap(original, 0, 2));
