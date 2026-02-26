/**
 * Swap Array Elements
 * 
 * Demonstrates different approaches to swapping elements in an array:
 * 1. brokenSwap - shows a common mistake
 * 2. swap - standard swap with temp variable
 * 3. functionalSwap - immutable approach using reduce
 */

/**
 * Broken swap - demonstrates a common mistake
 */
export function brokenSwap(array: any[], firstIndex: number, secondIndex: number): any[] {
	array[firstIndex] = array[secondIndex];
	array[secondIndex] = array[firstIndex]; // This is wrong! Value was already overwritten

	return array;
}

/**
 * Standard swap using temporary variable
 */
export function swap(array: any[], firstIndex: number, secondIndex: number): any[] {
	const temp = array[firstIndex];
	array[firstIndex] = array[secondIndex];
	array[secondIndex] = temp;
	return array;
}

/**
 * Functional swap - immutable approach
 * This approach has the benefit of not manipulating the original array.
 */
export function functionalSwap(array: any[], firstIndex: number, secondIndex: number): any[] {
	return array.reduce((a, b, i) => {
		if (i === firstIndex) a.push(array[secondIndex]);
		else if (i === secondIndex) a.push(array[firstIndex]);
		else a.push(b);
		return a;
	}, [] as any[]);
}
