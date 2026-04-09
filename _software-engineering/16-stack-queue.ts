/**
 * =============================================================================
 * LESSON 16: Stack and Queue
 * =============================================================================
 * Category: Data Structures
 * Topics: LIFO, FIFO, push, pop, enqueue, dequeue, practical applications
 * Description: Implements stack and queue data structures with array-based
 *              implementations. Includes practical applications like
 *              expression evaluation and task scheduling.
 */

import { strictEqual } from 'assert';

// =============================================================================
// STACK
//
// A stack is a LIFO (Last In, First Out) data structure.
//
// Think of a stack of plates:
// - You add plates to the TOP (push)
// - You remove plates from the TOP (pop)
//
// Operations:
// - push(item): Add item to top - O(1)
// - pop(): Remove and return top item - O(1)
// - peek(): View top item without removing - O(1)
// - isEmpty(): Check if stack is empty - O(1)
//
// Visual:
//
//     TOP
//    ┌─────┐
//    │  5  │ ← push(5)
//    ├─────┤
//    │  3  │ ← push(3)
//    ├─────┤
//    │  1  │ ← push(1)
//    └─────┘
//
//    peek() → 5
//    pop() → 5, stack now has [3, 1]
//
// Applications:
// - Function call stack (recursion)
// - Undo/Redo operations
// - Expression evaluation
// - Matching parentheses
// - DFS traversal
// =============================================================================

class Stack<T> {
  // Store items in an array
  // Array's end is the top of the stack
  private items: T[] = [];

  /**
   * Push: Add item to the top of the stack
   *
   * @param item - Item to add
   */
  push(item: T): void {
    this.items.push(item);
  }

  /**
   * Pop: Remove and return the top item
   *
   * @returns Top item, or undefined if empty
   */
  pop(): T | undefined {
    return this.items.pop();
  }

  /**
   * Peek: View the top item without removing it
   *
   * @returns Top item, or undefined if empty
   */
  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  /**
   * Check if stack is empty
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Get number of items
   */
  size(): number {
    return this.items.length;
  }

  /**
   * Remove all items
   */
  clear(): void {
    this.items = [];
  }

  /**
   * Convert to array
   */
  toArray(): T[] {
    return [...this.items];
  }
}

// =============================================================================
// QUEUE
//
// A queue is a FIFO (First In, First Out) data structure.
//
// Think of a line at a store:
// - You join at the BACK (enqueue)
// - You leave from the FRONT (dequeue)
//
// Operations:
// - enqueue(item): Add item to back - O(1)
// - dequeue(): Remove and return front item - O(n)* *with array, O(1) with linked list
// - front(): View front item - O(1)
// - rear(): View back item - O(1)
// - isEmpty(): Check if queue is empty - O(1)
//
// Visual:
//
//    FRONT                      BACK
//    ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐
//    │  1  │──│  2  │──│  3  │──│  5  │ ← enqueue(5)
//    └─────┘  └─────┘  └─────┘  └─────┘
//
//    front() → 1
//    dequeue() → 1, queue now has [2, 3, 5]
//
// Applications:
// - Task scheduling
// - BFS traversal
// - Print queue
// - Message queues
// =============================================================================

class Queue<T> {
  private items: T[] = [];

  /**
   * Enqueue: Add item to the back of the queue
   *
   * @param item - Item to add
   */
  enqueue(item: T): void {
    this.items.push(item);
  }

  /**
   * Dequeue: Remove and return the front item
   *
   * Note: For large queues, consider using a linked list
   * for O(1) dequeue instead of O(n) with array shift().
   *
   * @returns Front item, or undefined if empty
   */
  dequeue(): T | undefined {
    return this.items.shift();
  }

  /**
   * View the front item
   */
  front(): T | undefined {
    return this.items[0];
  }

  /**
   * View the back item
   */
  rear(): T | undefined {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }

  toArray(): T[] {
    return [...this.items];
  }
}

// =============================================================================
// TESTING BASIC STACK AND QUEUE
// =============================================================================

const stack = new Stack<number>();
stack.push(1);
stack.push(2);
stack.push(3);

strictEqual(stack.peek(), 3);
strictEqual(stack.size(), 3);
strictEqual(stack.pop(), 3);
strictEqual(stack.size(), 2);
strictEqual(stack.toArray().join(","), "1,2");

const queue = new Queue<string>();
queue.enqueue("a");
queue.enqueue("b");
queue.enqueue("c");

strictEqual(queue.front(), "a");
strictEqual(queue.rear(), "c");
strictEqual(queue.size(), 3);
strictEqual(queue.dequeue(), "a");
strictEqual(queue.toArray().join(","), "b,c");

// =============================================================================
// APPLICATION 1: VALID PARENTHESES
// =============================================================================

/**
 * Check if parentheses are balanced and correctly nested.
 *
 * Valid combinations: (), [], {}
 *
 * Algorithm:
 * 1. Scan the string character by character
 * 2. If opening bracket, push onto stack
 * 3. If closing bracket:
 *    - Stack should not be empty (nothing to match)
 *    - Pop from stack, should be matching opening bracket
 * 4. At end, stack should be empty (all brackets matched)
 *
 * @param s - String containing brackets
 * @returns true if valid
 */
function isValidParentheses(s: string): boolean {
  const stack = new Stack<string>();

  // Map closing brackets to their matching opening brackets
  const matching: Record<string, string> = {
    ")": "(",
    "]": "[",
    "}": "{",
  };

  for (const char of s) {
    if ("([{".includes(char)) {
      // Opening bracket: push onto stack
      stack.push(char);
    } else {
      // Closing bracket: must match top of stack
      // If stack is empty or top doesn't match, invalid
      if (stack.isEmpty() || stack.pop() !== matching[char]) {
        return false;
      }
    }
  }

  // Valid if all brackets were matched (stack is empty)
  return stack.isEmpty();
}

// =============================================================================
// TESTING VALID PARENTHESES
// =============================================================================

strictEqual(isValidParentheses("()"), true);
strictEqual(isValidParentheses("()[]{}"), true);
strictEqual(isValidParentheses("(]"), false);
strictEqual(isValidParentheses("([)]"), false);
strictEqual(isValidParentheses("{[]}"), true);
strictEqual(isValidParentheses(""), true);  // Empty string is valid

console.log("Valid parentheses '()[]{}':", isValidParentheses("()[]{}"));
console.log("Valid parentheses '{[]}':", isValidParentheses("{[1234]}"));

// =============================================================================
// APPLICATION 2: POSTFIX EXPRESSION EVALUATION
// =============================================================================

/**
 * Evaluate a postfix (Reverse Polish Notation) expression.
 *
 * Postfix notation: operators come AFTER operands
 * Example: "3 4 +" means 3 + 4 = 7
 *
 * Algorithm:
 * 1. Scan tokens left to right
 * 2. If number, push onto stack
 * 3. If operator:
 *    - Pop two operands (a = second pop, b = first pop)
 *    - Compute result
 *    - Push result back onto stack
 * 4. Final result is on stack
 *
 * Example: "5 1 2 + 4 * + 3 -"
 *
 * Token | Action              | Stack
 * ------|---------------------|-------
 *   5   | Push 5              | [5]
 *   1   | Push 1              | [5, 1]
 *   2   | Push 2              | [5, 1, 2]
 *   +   | Pop 2,1, push 3    | [5, 3]
 *   4   | Push 4              | [5, 3, 4]
 *   *   | Pop 4,3, push 12   | [5, 12]
 *   +   | Pop 12,5, push 17  | [17]
 *   3   | Push 3              | [17, 3]
 *   -   | Pop 3,17, push 14  | [14]
 *
 * Result: 14
 */
function evaluatePostfix(expression: string): number {
  const stack = new Stack<number>();
  const tokens = expression.split(" ");

  for (const token of tokens) {
    if (!isNaN(Number(token))) {
      // It's a number: push onto stack
      stack.push(Number(token));
    } else {
      // It's an operator: pop operands, compute, push result
      // Note: b is the first operand (older), a is second (newer)
      // So for "a op b", we do a op b where a is stack.pop() second
      const b = stack.pop()!;
      const a = stack.pop()!;

      switch (token) {
        case "+":
          stack.push(a + b);
          break;
        case "-":
          stack.push(a - b);
          break;
        case "*":
          stack.push(a * b);
          break;
        case "/":
          // Integer division with truncation toward zero
          stack.push(Math.trunc(a / b));
          break;
      }
    }
  }

  // Result should be the only item on stack
  return stack.pop()!;
}

// =============================================================================
// TESTING POSTFIX EVALUATION
// =============================================================================

strictEqual(evaluatePostfix("3 4 +"), 7);          // 3 + 4 = 7
strictEqual(evaluatePostfix("3 4 + 2 *"), 14);     // (3 + 4) * 2 = 14
strictEqual(evaluatePostfix("3 4 + 2 /"), 3);       // (3 + 4) / 2 = 3
strictEqual(evaluatePostfix("1 2 + 3 + 4 +"), 10); // 1 + 2 + 3 + 4 = 10
strictEqual(evaluatePostfix("5 1 2 + 4 * + 3 -"), 14); // 5 + (1+2)*4 - 3 = 14

console.log("Postfix '3 4 + 2 *':", evaluatePostfix("3 4 + 2 *"));
console.log("Postfix '5 1 2 + 4 * + 3 -':", evaluatePostfix("5 1 2 + 4 * + 3 -"));

// =============================================================================
// APPLICATION 3: NEXT GREATER ELEMENT
// =============================================================================

/**
 * For each element in findNums, find the next greater element in nums.
 *
 * Uses a "monotonic decreasing stack":
 * - Stack maintains elements in decreasing order
 * - When we see a larger element, it becomes the answer for stack elements
 *
 * @param findNums - Elements to find greater for
 * @param nums - Array to search in
 * @returns Array of next greater elements (-1 if none)
 */
function nextGreaterElement(findNums: number[], nums: number[]): number[] {
  const stack = new Stack<number>();
  // Map: element → next greater element
  const map = new Map<number, number>();

  // Process nums array
  for (const num of nums) {
    // While stack has elements smaller than current num,
    // current num is their next greater element
    while (!stack.isEmpty() && stack.peek()! < num) {
      map.set(stack.pop()!, num);
    }
    stack.push(num);
  }

  // Remaining stack elements have no greater element
  while (!stack.isEmpty()) {
    map.set(stack.pop()!, -1);
  }

  // Build result array
  return findNums.map((n) => map.get(n)!);
}

// =============================================================================
// TESTING NEXT GREATER ELEMENT
// =============================================================================

strictEqual(
  nextGreaterElement([4, 1, 2], [1, 3, 4, 2]).join(","),
  "3,-1,4"
);

strictEqual(nextGreaterElement([2, 4], [1, 2, 3, 4]).join(","), "3,-1");

console.log(
  "Next greater [4,1,2] in [1,3,4,2]:",
  nextGreaterElement([4, 1, 2], [1, 3, 4, 2])
);
// For nums [1, 3, 4, 2]:
// - 1's greater is 3
// - 3's greater is 4
// - 4's greater is -1 (none)
// - 2's greater is -1 (none)
// So findNums [4,1,2] → [3,-1,4]

// =============================================================================
// APPLICATION 4: PRIORITY TASK SCHEDULER
// =============================================================================

/**
 * Simple priority-based task scheduler using a queue.
 *
 * Tasks are stored with priority, higher priority tasks are dequeued first.
 *
 * This is a simplified priority queue.
 * For production, use a proper heap-based priority queue for O(log n) operations.
 */
class TaskScheduler {
  private queue: Array<{ task: string; priority: number }>;

  constructor() {
    this.queue = [];
  }

  /**
   * Add a task with given priority
   *
   * @param task - Task description
   * @param priority - Higher number = higher priority
   */
  addTask(task: string, priority: number): void {
    this.queue.push({ task, priority });
    // Sort by priority (descending) - simple but O(n log n)
    // For better performance, use a heap
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get and remove highest priority task
   */
  getNextTask(): string | undefined {
    return this.queue.shift()?.task;
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  size(): number {
    return this.queue.length;
  }
}

// =============================================================================
// TESTING TASK SCHEDULER
// =============================================================================

const scheduler = new TaskScheduler();
scheduler.addTask("write code", 2);
scheduler.addTask("review PR", 1);
scheduler.addTask("fix bug", 3);  // Highest priority
scheduler.addTask("write tests", 2);

strictEqual(scheduler.getNextTask(), "fix bug");  // Priority 3
strictEqual(scheduler.getNextTask(), "write code");  // Priority 2 (or tests, order varies)
strictEqual(scheduler.size(), 2);

console.log(
  "Task scheduler order:",
  scheduler.getNextTask(),
  "then",
  scheduler.getNextTask()
);

// =============================================================================
// STACK AND QUEUE COMPLEXITY SUMMARY
// =============================================================================

/**
 * Operation | Stack (Array) | Queue (Array) |
 * -----------|---------------|----------------|
 * push/enqueue | O(1)      | O(1)          |
 * pop/dequeue  | O(1)      | O(n)*         |
 * peek/front  | O(1)      | O(1)          |
 * isEmpty     | O(1)      | O(1)          |
 *
 * * Using array shift() is O(n). For O(1) dequeue, use a linked list.
 */

// =============================================================================
// WHEN TO USE STACK VS QUEUE
// =============================================================================

/**
 * Use STACK when:
 * - You need to reverse something
 * - Matching/balancing problems
 * - Undo operations
 * - DFS traversal
 * - Function call management
 *
 * Use QUEUE when:
 * - Order matters (FIFO)
 * - BFS traversal
 * - Task scheduling
 * - Print/job queues
 * - Any "first come, first served" scenario
 */

// =============================================================================
// REAL-WORLD ANALOGIES
// =============================================================================

/**
 * Stack (LIFO):
 * - Stack of plates/books
 * - Undo/redo in editors
 * - Browser back button (visits stack)
 * - Function call stack (recursion)
 *
 * Queue (FIFO):
 * - Line at a store/restaurant
 * - Printer queue
 * - CPU task scheduling
 * - BFS pathfinding
 */
