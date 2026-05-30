/**
 * =============================================================================
 * LESSON 18: Selection Sort
 * =============================================================================
 * Category: Sorting
 * Topics: Selection sort, in-place sorting, minimum selection
 * Description: Sorts an array by repeatedly selecting the smallest remaining
 *              value and moving it into the next sorted position.
 */

import { strictEqual } from "assert";

// =============================================================================
// SELECTION SORT OVERVIEW
//
// Selection sort divides the array into two regions:
// - a sorted prefix on the left
// - an unsorted suffix on the right
//
// For each position i:
// 1. Find the minimum value in the unsorted suffix.
// 2. Swap it into position i.
// 3. Expand the sorted prefix by one.
//
// Time Complexity: O(n^2)
// Space Complexity: O(1)
// =============================================================================

function swap(array: number[], firstIndex: number, secondIndex: number) {
  const temp = array[firstIndex];
  array[firstIndex] = array[secondIndex];
  array[secondIndex] = temp;
}

function indexOfMinimum(array: number[], startIndex: number): number {
  let minIndex = startIndex;
  let minValue = array[startIndex];

  for (let i = startIndex + 1; i < array.length; i++) {
    if (array[i] < minValue) {
      minIndex = i;
      minValue = array[i];
    }
  }

  return minIndex;
}

/**
 * Sort an array using selection sort.
 *
 * @param array - Array of numbers to sort
 * @returns A new sorted array
 */
export function selectionSort(array: number[]): number[] {
  const result = [...array];

  for (let i = 0; i < result.length; i++) {
    const minimum = indexOfMinimum(result, i);
    swap(result, i, minimum);
  }

  return result;
}

/**
 * Trace of selection sort on [64, 25, 12, 22, 11]:
 *
 * Pass 1: find the minimum in [64, 25, 12, 22, 11]
 *         minimum = 11 → swap into position 0
 *         [11, 25, 12, 22, 64]
 * Pass 2: find the minimum in [25, 12, 22, 64]
 *         minimum = 12 → swap into position 1
 *         [11, 12, 25, 22, 64]
 * Pass 3: find the minimum in [25, 22, 64]
 *         minimum = 22 → swap into position 2
 *         [11, 12, 22, 25, 64]
 * Pass 4: already in place
 * Pass 5: already in place
 */

// =============================================================================
// SELF-TESTS
// =============================================================================

const sample = [64, 25, 12, 22, 11];
const sorted = selectionSort(sample);

strictEqual(sample.join(","), "64,25,12,22,11");
strictEqual(sorted.join(","), "11,12,22,25,64");

console.log("selectionSort([64, 25, 12, 22, 11]):", sorted);
