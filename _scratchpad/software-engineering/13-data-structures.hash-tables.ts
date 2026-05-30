/**
 * =============================================================================
 * LESSON 13: Hash Tables
 * =============================================================================
 * Category: Data Structures
 * Topics: Key-value storage, hash functions, collision handling, maps
 * Description: Implements a hash table with separate chaining for collision
 *              resolution. Includes common operations and usage patterns.
 */

import { strictEqual } from 'assert';

// =============================================================================
// HASH TABLES
//
// A hash table is a data structure that implements an associative array
// (key-value pairs) with efficient insertion, lookup, and deletion.
//
// Core concept:
// - Convert a key into an array index using a "hash function"
// - Store/retrieve values at that index
//
// Why Hash Tables?
// - Arrays require O(n) search (have to check each element)
// - Linked lists require O(n) search
// - Hash tables provide O(1) average-case lookup!
//
// Trade-offs:
// - Worst case O(n) when many collisions
// - Memory overhead (array of buckets)
// - Hash function quality matters
//
// Key Concepts:
// 1. Hash Function: Maps keys to array indices
// 2. Collision: Two keys map to the same index
// 3. Collision Resolution: How we handle multiple values at same index
// =============================================================================

/**
 * =============================================================================
 * OUR HASH TABLE IMPLEMENTATION
 * =============================================================================
 *
 * Uses "Separate Chaining" for collision resolution:
 * - Each bucket is a linked list (array of key-value pairs)
 * - Multiple items can exist at the same index
 * - When searching, we iterate through the bucket's list
 *
 * This implementation also includes:
 * - Dynamic resizing when load factor exceeds 0.75
 * - Generic types for keys and values
 * - All standard operations: set, get, has, delete, keys, values, entries
 */

// =============================================================================
// HASH TABLE CLASS
// =============================================================================

class HashTable<K, V> {
  // Buckets array: each bucket contains a list of key-value pairs
  // Type: Array of Arrays, where inner array contains {key, value} objects
  private buckets: Array<Array<{ key: K; value: V }>>;

  // Current number of key-value pairs stored
  private size: number;

  // Number of buckets (array length)
  private capacity: number;

  /**
   * Initialize hash table with given capacity
   *
   * @param capacity - Initial number of buckets (default: 16)
   */
  constructor(capacity: number = 16) {
    this.capacity = capacity;
    // Create array of empty buckets
    // Each bucket is an empty array initially
    this.buckets = Array.from({ length: capacity }, () => []);
    this.size = 0;
  }

  /**
   * Hash function: Converts a key to a bucket index
   *
   * Uses polynomial rolling hash:
   * hash = (hash * 31 + charCode) % capacity
   *
   * Why 31? It's a prime number that produces good distribution.
   * The multiplication distributes the characters across the hash.
   *
   * @param key - The key to hash
   * @returns - Bucket index (0 to capacity-1)
   */
  private hash(key: K): number {
    // Convert key to string (works for numbers, strings, objects)
    const str = String(key);
    let hash = 0;

    // Polynomial rolling hash
    // For each character, update hash = (hash * 31 + charCode) % capacity
    for (let i = 0; i < str.length; i++) {
      // charCodeAt returns ASCII/Unicode value
      // Multiply by 31 (prime) and add character value
      // Modulo by capacity to keep within bucket range
      hash = (hash * 31 + str.charCodeAt(i)) % this.capacity;
    }

    return hash;
  }

  /**
   * Insert or update a key-value pair
   *
   * If key exists, update its value.
   * If key doesn't exist, insert new pair.
   *
   * @param key - The key
   * @param value - The value to associate with key
   */
  set(key: K, value: V): void {
    const index = this.hash(key);
    const bucket = this.buckets[index];

    // Check if key already exists in this bucket
    // If so, just update the value
    for (const pair of bucket) {
      if (pair.key === key) {
        pair.value = value;
        return;
      }
    }

    // Key not found, add new pair to bucket
    bucket.push({ key, value });
    this.size++;

    // Check load factor: size / capacity
    // If > 0.75, resize to maintain O(1) performance
    if (this.size / this.capacity > 0.75) {
      this.resize();
    }
  }

  /**
   * Retrieve value by key
   *
   * @param key - The key to look up
   * @returns The value, or undefined if key not found
   */
  get(key: K): V | undefined {
    const index = this.hash(key);
    const bucket = this.buckets[index];

    // Search through bucket for matching key
    for (const pair of bucket) {
      if (pair.key === key) {
        return pair.value;
      }
    }

    // Key not found
    return undefined;
  }

  /**
   * Check if key exists
   *
   * @param key - The key to check
   * @returns true if key exists
   */
  has(key: K): boolean {
    // Uses get(), returns true if value isn't undefined
    return this.get(key) !== undefined;
  }

  /**
   * Delete a key-value pair
   *
   * @param key - The key to delete
   * @returns true if key was found and deleted
   */
  delete(key: K): boolean {
    const index = this.hash(key);
    const bucket = this.buckets[index];

    // Search bucket for key
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].key === key) {
        // Found it! Remove from array
        bucket.splice(i, 1);  // Remove 1 element at index i
        this.size--;
        return true;
      }
    }

    // Key not found
    return false;
  }

  /**
   * Get all keys as an array
   *
   * @returns Array of all keys
   */
  keys(): K[] {
    const keys: K[] = [];
    for (const bucket of this.buckets) {
      for (const pair of bucket) {
        keys.push(pair.key);
      }
    }
    return keys;
  }

  /**
   * Get all values as an array
   *
   * @returns Array of all values
   */
  values(): V[] {
    const values: V[] = [];
    for (const bucket of this.buckets) {
      for (const pair of bucket) {
        values.push(pair.value);
      }
    }
    return values;
  }

  /**
   * Get all key-value pairs
   *
   * @returns Array of {key, value} objects
   */
  entries(): Array<{ key: K; value: V }> {
    const entries: Array<{ key: K; value: V }> = [];
    for (const bucket of this.buckets) {
      for (const pair of bucket) {
        entries.push({ key: pair.key, value: pair.value });
      }
    }
    return entries;
  }

  /**
   * Get current number of stored pairs
   *
   * @returns Size
   */
  getSize(): number {
    return this.size;
  }

  /**
   * Resize the hash table when load factor exceeds threshold
   *
   * Doubles capacity and rehashes all existing keys.
   * This maintains O(1) performance by keeping load factor low.
   */
  private resize(): void {
    // Save old buckets
    const oldBuckets = this.buckets;

    // Double capacity and create new empty buckets
    this.capacity *= 2;
    this.buckets = Array.from({ length: this.capacity }, () => []);
    this.size = 0;

    // Rehash all existing pairs into new buckets
    for (const bucket of oldBuckets) {
      for (const pair of bucket) {
        // Use set() which will handle the new capacity
        this.set(pair.key, pair.value);
      }
    }
  }
}

// =============================================================================
// TESTING
// =============================================================================

const hashTable = new HashTable<string, number>();

// Insert some values
hashTable.set("apple", 5);
hashTable.set("banana", 3);
hashTable.set("cherry", 7);

// Test updates (apple already exists)
hashTable.set("apple", 10);  // Updates from 5 to 10

strictEqual(hashTable.get("apple"), 10);
strictEqual(hashTable.get("banana"), 3);
strictEqual(hashTable.get("cherry"), 7);
strictEqual(hashTable.has("apple"), true);
strictEqual(hashTable.has("grape"), false);
strictEqual(hashTable.getSize(), 3);

// Test delete
hashTable.delete("banana");
strictEqual(hashTable.has("banana"), false);
strictEqual(hashTable.getSize(), 2);

console.log("Keys:", hashTable.keys());
console.log("Values:", hashTable.values());
console.log("Entries:", hashTable.entries());

// =============================================================================
// PRACTICAL APPLICATION: TWO SUM
// =============================================================================

/**
 * Two Sum Problem
 *
 * Given an array of numbers and a target, find two numbers that add to target.
 * Return their indices.
 *
 * Approach: Use a hash map to store (value -> index) as we iterate.
 * For each number, check if (target - number) exists in the map.
 *
 * Time Complexity: O(n) - single pass
 * Space Complexity: O(n) - hash map storage
 *
 * This is a classic LeetCode problem that demonstrates hash table utility.
 */
function twoSum(nums: number[], target: number): number[] {
  // Map stores: number -> its index
  const map = new Map<number, number>();

  for (let i = 0; i < nums.length; i++) {
    const currentNum = nums[i];
    const complement = target - currentNum;

    // Check if complement exists in map
    // If yes, we found our pair!
    if (map.has(complement)) {
      // Return indices: complement's index and current index
      return [map.get(complement)!, i];
    }

    // Store current number and its index for future lookups
    map.set(currentNum, i);
  }

  // No solution found
  return [];
}

// =============================================================================
// TESTING TWO SUM
// =============================================================================

strictEqual(twoSum([2, 7, 11, 15], 9)[0], 0);
strictEqual(twoSum([2, 7, 11, 15], 9)[1], 1);
strictEqual(twoSum([3, 2, 4], 6)[0], 1);
strictEqual(twoSum([3, 3], 6)[0], 0);

console.log("Two sum [2,7,11,15] target 9:", twoSum([2, 7, 11, 15], 9));
// Expected: [0, 1] because nums[0] + nums[1] = 2 + 7 = 9

/**
 * Trace through [2, 7, 11, 15] with target 9:
 *
 * i=0: currentNum=2, complement=7
 *      map doesn't have 7, so store {2 -> 0}
 *
 * i=1: currentNum=7, complement=2
 *      map HAS 2! Return [0, 1]
 *
 * Solution found!
 */

// =============================================================================
// HASH TABLE COMPLEXITY SUMMARY
// =============================================================================

/**
 * Operation    | Average Case | Worst Case
 * ------------|--------------|------------
 * Insert      | O(1)        | O(n)
 * Lookup      | O(1)        | O(n)
 * Delete      | O(1)        | O(n)
 * Search      | O(1)        | O(n)
 *
 * Worst case happens when:
 * - Hash function is poor (many collisions)
 * - All keys hash to same bucket
 * - With resize threshold of 0.75, worst case is rare
 */

// =============================================================================
// OTHER HASH TABLE IMPLEMENTATIONS
// =============================================================================

/**
 * Alternative collision resolution strategies:
 *
 * 1. Open Addressing / Linear Probing:
 *    - If bucket is full, try next bucket
 *    - Clustering can become an issue
 *
 * 2. Quadratic Probing:
 *    - If bucket is full, try i^2 distance away
 *    - Less clustering than linear
 *
 * 3. Double Hashing:
 *    - Use second hash function to determine offset
 *    - Good distribution
 *
 * 4. Separate Chaining (what we used):
 *    - Each bucket is a linked list or other structure
 *    - Simple and effective
 */

// =============================================================================
// COMMON HASH TABLE USAGE PATTERNS
// =============================================================================

/**
 * 1. Counting Frequencies:
 *    Count occurrences of each element
 */
function countFrequencies(arr: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const item of arr) {
    freq.set(item, (freq.get(item) || 0) + 1);
  }
  return freq;
}

/**
 * 2. Caching / Memoization:
 *    Store expensive function results
 */
const cache = new Map<string, number>();
function expensiveOperation(key: string): number {
  if (cache.has(key)) {
    return cache.get(key)!;
  }
  // ... compute result
  const result = key.length * 10;  // Example computation
  cache.set(key, result);
  return result;
}
