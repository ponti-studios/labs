/**
 * Binary Search
 *
 * Steps:
 * 1. Let min = 0 and max = n-1.
 * 2. Compute guess as the average of max and min, rounded down (so that it is an integer).
 * 3. If array[guess] equals target, then stop. You found it! Return guess.
 * 4. If the guess was too low, that is, array[guess] < target, then set min = guess + 1.
 * 5. Otherwise, the guess was too high. Set max = guess - 1.
 * 6. Go back to step 2.
 */

/**
 * This function assumes that the list is sorted
 * @param {Number} n - Target value
 * @param {Array} list - Sorted array to search
 * @returns {Number | null} - Index of target or null if not found
 */
export function binarySearch(n: number, list: number[]): number | null {
  let min = 0;
  let max = list.length - 1;
  let count = 0;

  while (max >= min) {
    count++;
    const guess = Math.floor((min + max) / 2);

    if (list[guess] === n) return guess;

    if (list[guess] < n) {
      min = guess + 1;
    } else if (list[guess] > n) {
      max = guess - 1;
    }
  }

  return null;
}

// Example usage
export const binarySearchExample = () => {
  const arr = Array.from({ length: 101 }, (_, i) => i);
  const target = Math.floor(Math.random() * 100);
  const result = binarySearch(target, arr);
  return { target, result, found: result !== null };
};
