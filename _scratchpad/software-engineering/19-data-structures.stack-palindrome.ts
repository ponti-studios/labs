/**
 * =============================================================================
 * LESSON 19: Stack-Based Palindrome Check
 * =============================================================================
 * Category: Data Structures
 * Topics: Stack (LIFO), palindrome detection, push/pop operations
 * Description: Uses a stack to reverse a word and check whether it reads the
 *              same forwards and backwards.
 */

import { strictEqual } from "assert";

// =============================================================================
// STACK
//
// A stack is a LIFO (Last In, First Out) data structure.
//
// Think of a stack of books:
// - push() adds a book to the top
// - pop() removes the book from the top
// =============================================================================

class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  size(): number {
    return this.items.length;
  }
}

/**
 * Check whether a word is a palindrome using a stack.
 *
 * @param word - Word to check
 * @returns true when the word reads the same forwards and backwards
 */
export function isPalindrome(word: string): boolean {
  const letters = new Stack<string>();

  for (const letter of word) {
    letters.push(letter);
  }

  let reversed = "";
  while (letters.size() > 0) {
    reversed += letters.pop();
  }

  return reversed === word;
}

/**
 * Trace of the stack approach:
 *
 * Word: "racecar"
 * Push: r, a, c, e, c, a, r
 * Pop:  r, a, c, e, c, a, r
 * Result: the reversed string matches the original ✓
 */

// =============================================================================
// SELF-TESTS
// =============================================================================

strictEqual(isPalindrome("racecar"), true);
strictEqual(isPalindrome("level"), true);
strictEqual(isPalindrome("hello"), false);
strictEqual(isPalindrome(""), true);

console.log('isPalindrome("racecar"):', isPalindrome("racecar"));
console.log('isPalindrome("hello"):', isPalindrome("hello"));
