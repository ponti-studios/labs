/**
 * =============================================================================
 * LESSON 09: Sorting Algorithms
 * =============================================================================
 * Category: Sorting
 * Topics: Insertion sort, selection sort, in-place sorting, O(n²) complexity
 * Description: Implements insertion sort, selection sort, and utilities for
 *              finding minimum/maximum values in arrays.
 */

// =============================================================================
// SORTING ALGORITHMS OVERVIEW
//
// Sorting is one of the most fundamental operations in computer science.
// Given an array, arrange elements in order (usually ascending for numbers).
//
// Common Sorting Algorithms:
// - Bubble Sort: O(n²) - Simple but inefficient
// - Selection Sort: O(n²) - Simple, good for minimizing swaps
// - Insertion Sort: O(n²) - Efficient for small/nearly sorted data
// - Merge Sort: O(n log n) - Efficient, stable, uses extra memory
// - Quick Sort: O(n log n) average - Very efficient, in-place
// - Heap Sort: O(n log n) - Guaranteed performance, in-place
//
// This lesson covers Insertion Sort and Selection Sort in detail.
// =============================================================================

/**
 * =============================================================================
 * INSERTION SORT
 * =============================================================================
 *
 * How it works:
 * 1. Start with second element (index 1)
 * 2. Compare with elements before it, shifting larger elements right
 * 3. Insert the current element in its correct position
 * 4. Repeat for all elements
 *
 * Analogy: Sorting playing cards in your hand
 * - You hold sorted cards in your left hand
 * - Pick up a new card with right hand
 * - Insert it in the correct position among the sorted cards
 *
 * Time Complexity: O(n²) worst/average case, O(n) best case (already sorted)
 * Space Complexity: O(1) - sorts in place
 * Stable: Yes - equal elements maintain their relative order
 *
 * @bigO {n^2} This is because you have to hit every element and then might have to move
 * every element beneath it
 * @param {array} array - Array to sort
 * @returns {array} - Original array sorted (mutated in place)
 */
function insertionSort(array) {
  // Start from second element (index 1)
  // Element at index 0 is considered "sorted" initially (single element is trivially sorted)
  for (var i = 1; i < array.length; i++) {
    // Save current element to be inserted
    // We'll move elements around it to make room
    var index = i;
    var current = array[i];

    // Move left through the sorted portion
    // While previous element is GREATER than current element,
    // shift the previous element RIGHT (make room for insertion)
    //
    // Why "greater than"? Because we're sorting in ascending order.
    // For descending order, we'd use "less than".
    //
    // Stop when:
    // - index reaches 0 (current element is smallest so far)
    // - OR we find an element <= current (correct position found)
    while (index > 0 && array[index - 1] > current) {
      // Shift element one position to the right
      // This creates a "gap" at position (index-1) for the next iteration
      array[index] = array[index - 1];
      index--;
    }

    // Insert the current element in the gap created by shifting
    array[index] = current;
  }

  return array;
}

/**
 * Trace of Insertion Sort on [5, 2, 4, 6, 1, 3]:
 *
 * Initial: [5, 2, 4, 6, 1, 3]
 *           ↑
 *         i=1, current=2
 *         Shift 5 right, insert 2 at index 0
 * Result:  [2, 5, 4, 6, 1, 3]
 *                ↑
 *              i=2, current=4
 *         Shift 5 right, insert 4 at index 1
 * Result:  [2, 4, 5, 6, 1, 3]
 *                    ↑
 *                  i=3, current=6
 *         6 is in correct position (no shift needed)
 * Result:  [2, 4, 5, 6, 1, 3]
 *                      ↑
 *                    i=4, current=1
 *         Shift 2,4,5,6 right, insert 1 at index 0
 * Result:  [1, 2, 4, 5, 6, 3]
 *                          ↑
 *                        i=5, current=3
 *         Shift 4,5,6 right, insert 3 at index 2
 * Result:  [1, 2, 3, 4, 5, 6] ✓
 */

/**
 * =============================================================================
 * INSERTION SORT - FUNCTIONAL/PURE VERSION
 * =============================================================================
 *
 * This version doesn't mutate the original array.
 * Instead, it builds a new array using reduce.
 *
 * Time Complexity: O(n²)
 * Space Complexity: O(n) - creates a new array
 */
function insertionSortFunctional(array) {
  // reduce processes each element, building up the result
  // Initial value is empty array (sorted portion is empty)
  return array.reduce(function (newArray, element, index) {
    // newArray is the sorted portion built so far
    // element is the current element to insert
    // index is where element came from in original array (not directly used here)

    let i = index;

    // Find correct position in sorted portion
    // Move elements that are GREATER than current element one position right
    while (i >= 0 && newArray[i - 1] > element) {
      newArray[i] = newArray[i - 1];
      i--;
    }

    // Insert element in the correct position
    newArray[i] = element;

    return newArray;
  }, []);  // Start with empty array
}

/**
 * =============================================================================
 * SELECTION SORT
 * =============================================================================
 *
 * How it works:
 * 1. Find minimum element in unsorted portion
 * 2. Swap it with the first unsorted element
 * 3. Expand sorted portion by one
 * 4. Repeat until no unsorted elements remain
 *
 * Analogy: Selecting the smallest card and putting it at the front,
 * then repeating with remaining cards.
 *
 * Time Complexity: O(n²) - always (both best and worst case)
 * Space Complexity: O(1) - sorts in place
 * Swaps: O(n) - at most n swaps (good when write is expensive)
 * Stable: No - equal elements may change relative order
 *
 * @param {array} array - Array to sort
 * @returns {array} - Original array sorted
 */
function selectionSort(array) {
  // Outer loop: position where we'll place the next minimum
  for (var i = 0; i < array.length; i++) {
    // Assume current position has minimum
    // We haven't scanned yet, so this is just our starting hypothesis
    let minIndex = i;
    let minValue = array[i];

    // Inner loop: scan remaining unsorted elements to find true minimum
    // Start at i+1 because index i is already "sorted" (it holds current minimum)
    let index = i + 1;

    while (index < array.length) {
      // Update minimum if we find a smaller value
      if (array[index] < minValue) {
        minIndex = index;
        minValue = array[index];
      }
      index++;
    }

    // Swap: place minimum in its correct position
    // Only swap if we found a value smaller than what we assumed
    // (If minIndex === i, the element is already in correct position)
    let temp = array[minIndex];
    array[minIndex] = array[i];
    array[i] = temp;
  }

  return array;
}

/**
 * Trace of Selection Sort on [64, 25, 12, 22, 11]:
 *
 * Initial: [64, 25, 12, 22, 11]
 * i=0: Find min in [25, 12, 22, 11] → min=11 at index 4
 *       Swap positions 0 and 4
 *       [11, 25, 12, 22, 64]
 * i=1: Find min in [25, 12, 22] → min=12 at index 2
 *       Swap positions 1 and 2
 *       [11, 12, 25, 22, 64]
 * i=2: Find min in [25, 22] → min=22 at index 3
 *       Swap positions 2 and 3
 *       [11, 12, 22, 25, 64]
 * i=3: Find min in [25] → min=25 at index 3 (already in place)
 *       No swap needed
 *       [11, 12, 22, 25, 64] ✓
 */

/**
 * =============================================================================
 * UTILITY FUNCTIONS
 * =============================================================================
 */

/**
 * Finds the index of the minimum element in array starting from given index.
 *
 * Useful for selection sort's inner loop logic.
 *
 * @param {array} array - Array to search
 * @param {number} start - Starting index for search
 * @returns {number} - Index of minimum element
 */
function getMinimum(array, start) {
  // Initialize with first element in search range
  let minIndex = start;
  let minValue = array[start];

  // Scan through remaining elements
  var i = start + 1;

  while (i < array.length) {
    // Found new minimum?
    if (array[i] < minValue) {
      minIndex = i;
      minValue = array[i];
    }
    i++;
  }

  return minIndex;
}

/**
 * Finds the largest element in an array.
 *
 * Can return either the value or its index.
 *
 * @param {array} array - Array to search
 * @param {boolean} getIndex - If true, return index; if false, return value
 * @returns {number} - Either max value or max index (based on getIndex)
 */
function findLargest(array, getIndex) {
  // Start with first element
  let maxValue = array[0];
  let maxIndex = 0;

  // Scan through remaining elements
  let index = 1;

  while (index < array.length) {
    // Found new maximum?
    if (array[index] > maxValue) {
      maxValue = array[index];
      maxIndex = index;
    }
    index++;
  }

  // Return based on what caller asked for
  return getIndex ? maxIndex : maxValue;
}

// =============================================================================
// TESTING
// =============================================================================

console.log("getMinimum([1,10,4,8,11,5,0,25,3,52,2], 0):", getMinimum([1, 10, 4, 8, 11, 5, 0, 25, 3, 52, 2], 0));
// Should return 6 (index of value 0)

console.log("selectionSort result:", selectionSort([1, 10, 4, 8, 11, 5, 0, 25, 3, 52, 2]));
// Should return [0, 1, 2, 3, 4, 5, 8, 10, 11, 25, 52]

console.log("findLargest result:", findLargest([1, 10, 4, 8, 11, 5, 0, 25, 3, 52, 2]));
// Should return 52

console.log("insertionSortFunctional result:", insertionSortFunctional([1, 10, 4, 8, 11, 5, 0, 25, 3, 52, 2]));
// Should return [0, 1, 2, 3, 4, 5, 8, 10, 11, 25, 52]

/**
 * =============================================================================
 * COMPLEXITY COMPARISON
 * =============================================================================
 *
 * Algorithm      | Best      | Average   | Worst    | Space | Stable |
 * ---------------|-----------|-----------|----------|-------|--------|
 * Insertion Sort | O(n)      | O(n²)    | O(n²)   | O(1)  | Yes    |
 * Selection Sort | O(n²)    | O(n²)    | O(n²)   | O(1)  | No     |
 * Bubble Sort    | O(n)      | O(n²)    | O(n²)   | O(1)  | Yes    |
 * Merge Sort     | O(n log n)| O(n log n)| O(n log n)| O(n)| Yes   |
 * Quick Sort     | O(n log n)| O(n log n)| O(n²)  | O(log n)| No   |
 * Heap Sort      | O(n log n)| O(n log n)| O(n log n)| O(1)| No   |
 *
 * When to use which:
 * - Insertion Sort: Small arrays, nearly sorted data
 * - Selection Sort: When minimizing swaps is important
 * - Merge Sort: When stability is required, large datasets
 * - Quick Sort: General purpose, fast in practice
 * - Heap Sort: Guaranteed O(n log n), no extra memory
 */
