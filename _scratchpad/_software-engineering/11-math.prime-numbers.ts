/**
 * =============================================================================
 * LESSON 11: Prime Numbers
 * =============================================================================
 * Category: Math & Number Theory
 * Topics: Divisibility, square root optimization, primality testing
 * Description: Determines if a number is prime by checking divisibility
 *              only up to the square root of the number.
 */

import { strictEqual } from "assert";

// =============================================================================
// PRIMES
//
// A prime number is a natural number greater than 1
// that has no positive divisors other than 1 and itself.
//
// Examples:
// - 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37...
//
// Key properties:
// - 2 is the only even prime
// - All other primes are odd
// - 1 is NOT prime (by definition)
// - Every composite number has a prime factor <= sqrt(n)
//
// Prime checking is fundamental to many algorithms:
// - Cryptography (RSA, prime factorization)
// - Hash functions
// - Random number generation
// - Finding GCD/LCM
// =============================================================================

/**
 * Determines if a number is prime using trial division.
 *
 * Key Optimization: Only check divisibility up to √n
 *
 * Why √n works:
 * - If n = a × b, then at least one of a or b is <= √n
 * - Proof: If both a > √n AND b > √n, then a × b > √n × √n = n
 * - Therefore, if n has any divisors, we'll find one <= √n
 *
 * Time Complexity: O(√n) - worst case checks all numbers from 2 to √n
 * Space Complexity: O(1) - only uses a few variables
 *
 * @param {number} n - Number to check if is prime
 * @returns {boolean} - true if prime, false otherwise
 */
export function isPrime(n: number): boolean {
  // =============================================================================
  // WHY WE START AT 2
  //
  // 1 is NOT a prime number (definition excludes it)
  // 2 IS a prime number (smallest prime, and the only even one)
  //
  // We start at 2 because:
  // - Every number is divisible by 1, so checking 1 tells us nothing
  // - 2 is the first meaningful divisor to check
  // =============================================================================

  // Handle edge cases
  if (n <= 1) return false; // 0, 1 are not prime
  if (n <= 3) return true; // 2, 3 are prime
  if (n % 2 === 0) return false; // Even numbers > 2 are not prime

  // =============================================================================
  // SQUARE ROOT OPTIMIZATION
  //
  // The key insight: if n = a × b, we only need to check up to √n
  //
  // Example with n = 36:
  //   Divisors: 1×36, 2×18, 3×12, 4×9, 6×6, 9×4, 12×3, 18×2, 36×1
  //   Notice: √36 = 6, and after 6×6, the pairs repeat in reverse
  //   So we only need to check up to 6!
  //
  // Example with n = 17 (prime):
  //   Check divisors: 2, 3, 4, 5, 6
  //   Since √17 ≈ 4.12, we only check up to 4
  //   None divide evenly, so 17 is prime
  //
  // Math.floor ensures we don't miss an integer divisor
  // (if √n = 4.6, we check up to 4, which is sufficient)
  // =============================================================================
  const sqrt = Math.floor(Math.sqrt(n));

  // =============================================================================
  // TRIAL DIVISION
  //
  // Check each potential divisor from 2 to √n
  // If any divides evenly, n is composite (not prime)
  // If none divide evenly, n is prime
  //
  // Optimization: After checking 2 (and finding n is not even),
  // we can skip all even numbers by incrementing by 2.
  // =============================================================================
  for (var i = 2; i <= sqrt; i++) {
    // If i divides n evenly, n is not prime
    // n % i === 0 means i is a divisor of n
    if (n % i === 0) {
      return false; // Found a divisor, so n is composite
    }
  }

  // If we get here, no divisors were found
  // Therefore n is prime
  return true;
}

/**
 * Optimized prime checker: Skip even numbers after checking 2
 *
 * Only checks odd numbers since:
 * - 2 is prime and we handle it explicitly
 * - All other even numbers are composite
 *
 * @param {number} n - Number to check
 * @returns {boolean} - true if prime
 */
export function isPrimeOptimized(n: number): boolean {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0) return false; // Handle 2 separately

  // Only check odd numbers: 3, 5, 7, 9, ... up to √n
  // This halves the number of iterations
  for (var i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }

  return true;
}

/**
 * Find all primes up to n using Sieve of Eratosthenes
 *
 * This is much faster than checking each number individually
 * when finding ALL primes up to a limit.
 *
 * Time Complexity: O(n log log n)
 * Space Complexity: O(n)
 *
 * @param {number} limit - Upper bound to find primes
 * @returns {number[]} - Array of all primes <= limit
 */
export function sieveOfEratosthenes(limit: number): number[] {
  // Create boolean array: isPrime[i] = true means i is initially assumed prime
  const primeFlags = new Array<boolean>(limit + 1).fill(true);

  // 0 and 1 are not prime by definition
  primeFlags[0] = false;
  primeFlags[1] = false;

  // Main sieve: mark multiples of each prime as composite
  // Start from 2 (first prime)
  for (let i = 2; i * i <= limit; i++) {
    if (primeFlags[i]) {
      // Mark all multiples of i as composite
      // Start from i*i (smaller multiples were already marked by smaller primes)
      for (let j = i * i; j <= limit; j += i) {
        primeFlags[j] = false;
      }
    }
  }

  // Collect all numbers still marked as prime
  return primeFlags.map((prime, index) => (prime ? index : -1)).filter((index) => index !== -1);
}

/**
 * Generate first n prime numbers
 *
 * @param {number} count - Number of primes to generate
 * @returns {number[]} - Array of first n primes
 */
export function firstNPrimes(count: number): number[] {
  const primes: number[] = [];
  let candidate = 2;

  while (primes.length < count) {
    if (isPrime(candidate)) {
      primes.push(candidate);
    }
    candidate++;
  }

  return primes;
}

// =============================================================================
// TESTING
// =============================================================================

// Test basic primality
strictEqual(isPrime(2), true);
strictEqual(isPrime(3), true);
strictEqual(isPrime(4), false);
strictEqual(isPrime(5), true);
strictEqual(isPrime(17), true);
strictEqual(isPrime(18), false);
strictEqual(isPrime(97), true); // 97 is prime
strictEqual(isPrime(100), false);

// Test edge cases
strictEqual(isPrime(0), false);
strictEqual(isPrime(1), false);
strictEqual(isPrime(-5), false);

// Test large numbers
console.log("Is 15485863 prime?", isPrime(15485863)); // This is the millionth prime!
console.log("Is 1000003 prime?", isPrime(1000003));

// Test optimized version
console.log("\nOptimized checker:");
console.log("Is 97 prime?", isPrimeOptimized(97));
console.log("Is 100 prime?", isPrimeOptimized(100));

// Test sieve
console.log("\nSieve of Eratosthenes:");
console.log("Primes up to 30:", sieveOfEratosthenes(30));
// Expected: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]

// Test first N primes
console.log("\nFirst 10 primes:", firstNPrimes(10));
// Expected: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]

// Performance comparison
console.log("\nPerformance:");
console.time("Check if 15485863 is prime (basic)");
isPrime(15485863);
console.timeEnd("Check if 15485863 is prime (basic)");

console.time("Check if 15485863 is prime (optimized)");
isPrimeOptimized(15485863);
console.timeEnd("Check if 15485863 is prime (optimized)");
