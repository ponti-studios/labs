/**
 * Sum Array Problem
 *
 * Demonstrates different approaches to summing array elements:
 * Time Complexity: O(n)
 */

/**
 * Sum an array using a for loop
 * Complexity: O(n) - The running-time is linear as the number of executions grows with the length of the array.
 */
export function sumOfNumbers(numbers: number[]): number {
  let result = 0;

  for (const number of numbers) {
    result += number;
  }

  return result;
}

/**
 * Sum of integers from 1 to n using loop
 * Complexity: O(n)
 */
export function sumUp(n: number): number {
  let result = 0;

  for (let i = 1; i <= n; i++) {
    result += i;
  }

  return result;
}

/**
 * Sum of integers from 1 to n using mathematical formula
 * Complexity: O(1)
 * Formula: n * (n + 1) / 2
 */
export function sumUpFormula(n: number): number {
  return (n / 2) * (1 + n);
}

// Example usage showing performance difference
export const sumExample = () => {
  const numbers = [1, 2, 3, 4, 5];
  const sum = sumOfNumbers(numbers);
  const sumUpResult = sumUp(100);
  const sumUpFormulaResult = sumUpFormula(100);

  return {
    arraySum: sum,
    loopSum: sumUpResult,
    formulaSum: sumUpFormulaResult,
    performanceNote: "Formula is much faster for large numbers",
  };
};
