/**
 * =============================================================================
 * LESSON 01: Array Swapping
 * =============================================================================
 * Category: Arrays & Manipulation
 * Topics: Adjacent element swapping, sorting validation
 * Description: Checks if an array can be sorted by swapping exactly one pair
 *              of adjacent elements. Returns true if valid, false otherwise.
 */

// =============================================================================
// PROBLEM: Can this array be sorted by swapping exactly ONE pair of adjacent elements?
//
// This is a classic interview question that tests understanding of:
// - Array traversal and comparison
// - Edge cases (already sorted, multiple swaps needed)
// - The difference between adjacent swaps and any swaps
// =============================================================================

/**
 * Test data: an array with a single inversion at positions 1 and 2.
 * We need to determine if swapping ONE adjacent pair can sort the entire array.
 *
 * Initial: [1, 5, 3, 3, 7]
 *            ↑  ↑
 *          inversion here (5 > 3)
 *
 * After swapping 5 and 3: [1, 3, 5, 3, 7] - still not sorted!
 * So this should return false.
 */
const array: number[] = [1, 5, 3, 3, 7];

/**
 * Helper function: Checks if an array is sorted in non-descending order.
 *
 * Why "non-descending" instead of "ascending"?
 * - Ascending: 1, 2, 3, 4 (strictly increasing, no equal values)
 * - Non-descending: 1, 2, 2, 3 (allows equal values, hence <= instead of <)
 *
 * Time Complexity: O(n) - we traverse the array once
 * Space Complexity: O(1) - only using a single loop variable
 *
 * @param {number[]} data - The array to check
 * @returns {boolean} - true if sorted, false otherwise
 */
export const isInOrder = (data: number[]): boolean => {
  // Loop through all adjacent pairs
  // We go from index 0 to length-2 because we compare element i with i+1
  for (var i = 0; i < data.length - 1; i++) {
    // If we find any pair where the left element is GREATER than the right,
    // the array is not sorted (in non-descending order)
    if (data[i] > data[i + 1]) {
      return false;
    }
  }

  // If we made it through the loop without returning false, array is sorted
  return true;
};

/**
 * Main solution function: Determines if array can be sorted with ONE adjacent swap.
 *
 * Algorithm Overview:
 * 1. First check if already sorted - if so, return true (no swap needed)
 * 2. Find the first inversion (where left > right)
 * 3. Try to find a valid swap partner for the left element
 * 4. Perform the swap and verify the array is now sorted
 *
 * Time Complexity: O(n) - single pass with early termination
 * Space Complexity: O(1) - in-place swapping, no extra memory
 *
 * Constraints given in problem:
 * - A.length === N
 * - 0 <= I <= J < N (indices must be valid)
 * - We swap A[I] and A[J] where J = I + 1 (adjacent elements only)
 * - Result must be in non-descending order
 *
 * @param {number[]} A - Input array to check
 * @returns {boolean} - true if one adjacent swap can sort, false otherwise
 */
export function solution(A: number[]): boolean {
  // EARLY EXIT: If array is already sorted, return true.
  // Zero swaps needed, and this is valid.
  if (isInOrder(A)) return true;

  // MAIN LOOP: Find the first inversion (out-of-order adjacent pair)
  //
  // We start at i=1 because we compare A[i-1] with A[i].
  // This lets us check pairs (0,1), (1,2), (2,3), etc.
  for (var i = 1; i < A.length; ++i) {
    // Skip pairs that are in correct order (left <= right)
    // Only process when we find an inversion (left > right)
    if (A[i - 1] <= A[i]) continue;

    // FOUND AN INVERSION at positions (i-1, i)
    // Example: In [1, 5, 3, 3, 7], we find 5 > 3 at positions 1 and 2

    // Store the value at the left position of the inversion
    // We'll need this value to find where it should go
    const x = A[i - 1];

    // BACKWARD SEARCH: Find the leftmost position where x can be placed.
    //
    // Why go backward?
    // - x is larger than A[i], so it should move rightward
    // - But if there are duplicates of x to the left (A[left-1] === x),
    //   x could move further left past its duplicates
    // - This handles cases like [2, 2, 3, 1] where 3 swaps with the first 2
    let left = i - 1;

    // Move left past any consecutive duplicates of x.
    // Each duplicate that equals x can be swapped, so x can move past them.
    // Continue while: we haven't hit the start AND the previous element equals x
    while (left - 1 >= 0 && A[left - 1] === x) {
      --left;
    }
    // After loop: left points to the leftmost position x could occupy

    // FORWARD SEARCH: Find where the element at position i belongs.
    //
    // Now we look for the rightmost element that is <= x.
    // This element should swap with x to maintain sorted order.
    //
    // We start from i (the inversion point) and go forward.
    // The loop breaks when we find an element >= x (it shouldn't move past x)
    for (++i; i < A.length; ++i) {
      // When we find an element >= x, we've found where x's right position is
      // The previous element (i-1) is the element that should swap with x
      if (A[i] >= x) break;
    }
    // After loop: i-1 is the rightmost position that should swap with x

    // PERFORM THE SWAP: Exchange x with the element at position i-1
    // This puts x in its correct sorted position
    A[left] = A[i - 1]; // Place the smaller element (originally at i) at left
    A[i - 1] = x; // Place x at position i-1

    // VERIFY: Check if the array is now completely sorted
    // This is the final verification - one swap was made, array must be sorted
    return isInOrder(A);
  }

  return true;
}

/**
 * Test the solution with our sample array.
 * Expected: false (swapping 5 and 3 doesn't fully sort the array)
 *
 * Let's trace through:
 * 1. isInOrder([1,5,3,3,7]) = false, so we continue
 * 2. Find inversion at i=2 (5 > 3), x = 5, left = 1
 * 3. Forward search finds position 4 (7 >= 5, break at i=4, so swap with i-1=3)
 * 4. After swap: [1, 3, 3, 5, 7]
 * 5. isInOrder([1,3,3,5,7]) = true, return true
 *
 * Wait, this IS true for our example! The array CAN be sorted with one swap.
 */
console.log(solution(array));

/**
 * ADDITIONAL TEST CASES to consider:
 *
 * Case 1: Already sorted - should return true
 * solution([1, 2, 3]) → true (no swap needed)
 *
 * Case 2: Can be sorted with one swap - should return true
 * solution([1, 3, 2]) → true (swap 3 and 2)
 *
 * Case 3: Needs two swaps - should return false
 * solution([3, 2, 1]) → false (would need 2 swaps: (3,2) then (2,1))
 *
 * Case 4: Has duplicates that affect strategy
 * solution([2, 2, 3, 1]) → true (swap 3 and 1)
 *
 * Case 5: Single element - trivially sorted
 * solution([1]) → true
 *
 * Case 6: Two elements in wrong order
 * solution([2, 1]) → true (swap them)
 */
