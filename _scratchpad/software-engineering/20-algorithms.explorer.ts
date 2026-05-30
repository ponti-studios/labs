/**
 * =============================================================================
 * LESSON 20: Algorithms Explorer Overview
 * =============================================================================
 * Category: Algorithms
 * Topics: Sorting, searching, stacks, palindromes
 * Description: A compact node-runnable overview of the algorithm demos that
 *              used to live in the Labyrinth routes.
 */

import { binarySearch } from "./17-searching.binary-search";
import { selectionSort } from "./18-sorting.selection-sort";
import { isPalindrome } from "./19-data-structures.stack-palindrome";

const sampleNumbers = [5, 3, 8, 1, 9, 2, 7, 4, 6];
const sortedNumbers = selectionSort(sampleNumbers);
const sortedForSearch = Array.from({ length: 101 }, (_, i) => i);

console.log("=== Algorithms Explorer ===");
console.log("Sorting demo input:", sampleNumbers.join(", "));
console.log("Selection sort output:", sortedNumbers.join(", "));
console.log("Binary search for 42:", binarySearch(42, sortedForSearch));
console.log('Palindrome check for "racecar":', isPalindrome("racecar"));
console.log('Palindrome check for "hello":', isPalindrome("hello"));
console.log("\nThe original UI routes were migrated into scratchpad lessons.");
console.log("See 17-searching.binary-search.ts, 18-sorting.selection-sort.ts, and 19-data-structures.stack-palindrome.ts.");
