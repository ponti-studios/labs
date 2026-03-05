/**
 * Selection Sort
 *
 * Selection sort loops over positions in the array.
 * For each position, it finds the index of the minimum value in the subarray
 * starting at that position. Then it swaps the values at the position and at the minimum index.
 */

/**
 * Swap items in array
 */
function swap(array: any[], firstIndex: number, secondIndex: number) {
  const temp = array[firstIndex];
  array[firstIndex] = array[secondIndex];
  array[secondIndex] = temp;
}

/**
 * Find the index of the minimum element in an array
 */
function indexOfMinimum(array: any[], startIndex: number): number {
  let minValue = array[startIndex];
  let minIndex = startIndex;

  for (let i = minIndex + 1; i < array.length; i++) {
    if (array[i] < minValue) {
      minIndex = i;
      minValue = array[i];
    }
  }

  return minIndex;
}

/**
 * Sort an array using selection sort
 * Time Complexity: O(n²)
 */
export function selectionSort(array: any[]): any[] {
  const result = [...array];
  for (let i = 0; i < result.length; i++) {
    const minimum = indexOfMinimum(result, i);
    swap(result, i, minimum);
  }
  return result;
}
