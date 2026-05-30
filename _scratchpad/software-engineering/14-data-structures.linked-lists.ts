/**
 * =============================================================================
 * LESSON 14: Linked Lists
 * =============================================================================
 * Category: Data Structures
 * Topics: Singly linked list, doubly linked list, pointers, traversal
 * Description: Implements singly and doubly linked lists with common
 *              operations including insertion, deletion, and reversal.
 */

import { strictEqual } from 'assert';

// =============================================================================
// LINKED LISTS
//
// A linked list is a linear data structure where elements are stored in "nodes".
// Each node contains:
//   - The data (value)
//   - A pointer/reference to the next node (and previous for doubly)
//
// Unlike arrays, linked lists don't store elements in contiguous memory.
// Instead, each element points to the next/previous element.
//
// Visual comparison:
//
// ARRAY:    [0] [1] [2] [3] [4]
//           │   │   │   │   │
//           └───┴───┴───┴───┘  (contiguous memory)
//
// LINKED:   [0] → [1] → [2] → [3] → [4] → null
//           ↑                               ↓
//           └───────────────────────────────┘  (scattered in memory)
//
// Key Differences with Arrays:
// | Operation    | Array | Linked List |
// |--------------|-------|--------------|
// | Access by    | O(1)  | O(n)        |
// |   index     |       |              |
// | Insert at   | O(n)  | O(1)        |
// |   beginning |       | (with head)  |
// | Insert at   | O(n)  | O(1)        |
// |   end       |       | (with tail) |
// | Delete      | O(n)  | O(1)        |
// |   (known    |       | (with node)  |
// |   position) |       |              |
//
// Memory:
// - Array: fixed size, may waste or run out
// - Linked List: grows as needed, but each node has pointer overhead
// =============================================================================

// =============================================================================
// SINGLY LINKED LIST NODE
// =============================================================================

/**
 * Node for singly linked list
 *
 * Each node holds:
 * - value: The actual data
 * - next: Pointer to the next node (null if this is the tail)
 */
class ListNode<T> {
  value: T;
  next: ListNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

// =============================================================================
// SINGLY LINKED LIST
//
// Structure: head → node → node → ... → tail → null
//
// Operations:
// - prepend: Add to beginning (O(1))
// - append: Add to end (O(n) without tail, O(1) with tail)
// - delete: Remove by value (O(n))
// - find: Search by value (O(n))
// - reverse: Reverse the list (O(n))
// =============================================================================

class SinglyLinkedList<T> {
  head: ListNode<T> | null = null;

  // Private size tracker for O(1) size queries
  private _size: number = 0;

  get size(): number {
    return this._size;
  }

  /**
   * Append: Add element to the END of the list
   *
   * Without a tail pointer, we must traverse to the end.
   * Time Complexity: O(n)
   *
   * @param value - Value to append
   */
  append(value: T): void {
    const newNode = new ListNode(value);

    // Case 1: Empty list
    // New node becomes both head and tail
    if (!this.head) {
      this.head = newNode;
    } else {
      // Case 2: Non-empty list
      // Traverse to the last node (where next is null)
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      // current.next is now null, so this is the tail
      // Link new node after tail
      current.next = newNode;
    }

    this._size++;
  }

  /**
   * Prepend: Add element to the BEGINNING of the list
   *
   * Simply create new node and point it to current head.
   * Time Complexity: O(1)
   *
   * @param value - Value to prepend
   */
  prepend(value: T): void {
    const newNode = new ListNode(value);

    // New node points to current head
    newNode.next = this.head;

    // New node becomes the new head
    this.head = newNode;

    this._size++;
  }

  /**
   * Delete: Remove first node containing the value
   *
   * Must track previous node to relink after deletion.
   * Time Complexity: O(n)
   *
   * @param value - Value to delete
   * @returns true if value was found and deleted
   */
  delete(value: T): boolean {
    if (!this.head) return false;

    // Case 1: Head contains the value
    if (this.head.value === value) {
      this.head = this.head.next;
      this._size--;
      return true;
    }

    // Case 2: Search for value in rest of list
    let current = this.head;
    while (current.next) {
      // Check if next node has the value
      if (current.next.value === value) {
        // Skip over the node to delete
        current.next = current.next.next;
        this._size--;
        return true;
      }
      current = current.next;
    }

    // Value not found
    return false;
  }

  /**
   * Find: Search for a node by value
   *
   * @param value - Value to find
   * @returns Node containing value, or null if not found
   */
  find(value: T): ListNode<T> | null {
    let current = this.head;

    // Traverse until we find value or reach end
    while (current) {
      if (current.value === value) return current;
      current = current.next;
    }

    return null;
  }

  /**
   * Convert linked list to array
   *
   * Useful for testing and output.
   *
   * @returns Array of all values in order
   */
  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;

    while (current) {
      result.push(current.value);
      current = current.next;
    }

    return result;
  }

  /**
   * Reverse: Reverse the linked list in place
   *
   * Algorithm:
   * 1. Track three pointers: prev, current, next
   * 2. For each node, flip its next pointer to point backward
   * 3. When done, head points to the old tail
   *
   * Visual:
   * Before: 1 → 2 → 3 → null
   *              ↑
   *           current
   *
   * After: null ← 1 ← 2 ← 3
   *                      ↑
   *                   new head
   *
   * Time Complexity: O(n)
   * Space Complexity: O(1)
   */
  reverse(): void {
    let prev: ListNode<T> | null = null;
    let current = this.head;

    while (current) {
      // Save next pointer before we overwrite
      const next = current.next;

      // Flip the pointer: current.next now points backward
      current.next = prev;

      // Advance prev and current
      prev = current;
      current = next;
    }

    // prev is now pointing to the old tail, which is the new head
    this.head = prev;
  }
}

// =============================================================================
// DOUBLY LINKED LIST NODE
// =============================================================================

/**
 * Node for doubly linked list
 *
 * Each node holds:
 * - value: The data
 * - next: Pointer to next node (null if tail)
 * - prev: Pointer to previous node (null if head)
 */
class DoublyListNode<T> {
  value: T;
  next: DoublyListNode<T> | null = null;
  prev: DoublyListNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

// =============================================================================
// DOUBLY LINKED LIST
//
// Structure: null ← head ↔ node ↔ node ↔ tail → null
//            (prev)              (next)
//
// Each node has both prev and next pointers, enabling:
// - Traversal in both directions
// - Easier deletion (no need to track previous node)
// - More flexible operations
//
// Trade-off: More memory per node (extra pointer)
// =============================================================================

class DoublyLinkedList<T> {
  head: DoublyListNode<T> | null = null;
  tail: DoublyListNode<T> | null = null;  // Tail pointer for O(1) append

  private _size: number = 0;

  get size(): number {
    return this._size;
  }

  /**
   * Append to doubly linked list
   *
   * With tail pointer, this is O(1).
   *
   * @param value - Value to append
   */
  append(value: T): void {
    const newNode = new DoublyListNode(value);

    if (!this.tail) {
      // Empty list
      this.head = this.tail = newNode;
    } else {
      // Link new node after tail
      newNode.prev = this.tail;
      this.tail.next = newNode;
      this.tail = newNode;
    }

    this._size++;
  }

  /**
   * Prepend to doubly linked list
   *
   * @param value - Value to prepend
   */
  prepend(value: T): void {
    const newNode = new DoublyListNode(value);

    if (!this.head) {
      // Empty list
      this.head = this.tail = newNode;
    } else {
      // Link new node before head
      newNode.next = this.head;
      this.head.prev = newNode;
      this.head = newNode;
    }

    this._size++;
  }

  /**
   * Delete first node containing value
   *
   * Doubly linked lists make deletion easier - we have direct
   * access to previous node via prev pointer.
   *
   * @param value - Value to delete
   * @returns true if deleted
   */
  delete(value: T): boolean {
    let current = this.head;

    while (current) {
      if (current.value === value) {
        // Update previous node's next pointer
        if (current.prev) {
          current.prev.next = current.next;
        } else {
          // Deleting head
          this.head = current.next;
        }

        // Update next node's prev pointer
        if (current.next) {
          current.next.prev = current.prev;
        } else {
          // Deleting tail
          this.tail = current.prev;
        }

        this._size--;
        return true;
      }
      current = current.next;
    }

    return false;
  }

  /**
   * Convert to array
   */
  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;

    while (current) {
      result.push(current.value);
      current = current.next;
    }

    return result;
  }

  /**
   * Reverse doubly linked list
   *
   * Simply swap prev and next for all nodes.
   */
  reverse(): void {
    let current = this.head;
    let temp: DoublyListNode<T> | null = null;

    while (current) {
      // Swap prev and next
      temp = current.prev;
      current.prev = current.next;
      current.next = temp;

      // Move to next (which was previous)
      current = current.prev!;
    }

    // temp now points to the new head (old tail)
    if (temp) {
      this.head = temp.prev;
    }
  }
}

// =============================================================================
// TESTING
// =============================================================================

const singly = new SinglyLinkedList<number>();
singly.append(1);
singly.append(2);
singly.append(3);
singly.prepend(0);

strictEqual(singly.toArray().join(","), "0,1,2,3");
strictEqual(singly.size, 4);
strictEqual(singly.delete(2), true);
strictEqual(singly.toArray().join(","), "0,1,3");

singly.reverse();
strictEqual(singly.toArray().join(","), "3,1,0");

const doubly = new DoublyLinkedList<number>();
doubly.append(1);
doubly.append(2);
doubly.append(3);
doubly.prepend(0);

strictEqual(doubly.toArray().join(","), "0,1,2,3");
strictEqual(doubly.size, 4);
strictEqual(doubly.delete(2), true);
strictEqual(doubly.toArray().join(","), "0,1,3");

doubly.reverse();
strictEqual(doubly.toArray().join(","), "3,1,0");

console.log("Singly linked list:", singly.toArray());
console.log("Doubly linked list:", doubly.toArray());

// =============================================================================
// PRACTICAL ALGORITHM: REMOVE NTH NODE FROM END
// =============================================================================

/**
 * Remove the Nth node from the end of a linked list
 *
 * Uses two pointers (fast and slow):
 * 1. Move fast n positions ahead
 * 2. Move both pointers until fast reaches end
 * 3. Slow is now at the node before the one to delete
 *
 * Example for [1,2,3,4,5] removing 2nd from end:
 *
 * Initial: 1 → 2 → 3 → 4 → 5
 *              ↑
 *           slow, fast (both at 1)
 *
 * After moving fast 2 positions:
 *          slow   fast
 *           ↓      ↓
 *          1 → 2 → 3 → 4 → 5
 *
 * Move both until fast reaches end:
 *                   slow      fast
 *                     ↓         ↓
 *          1 → 2 → 3 → 4 → 5 → null
 *
 * Delete slow.next (the 4):
 * Result: 1 → 2 → 3 → 5 ✓
 *
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */
function removeNthFromEnd(head: number[], n: number): number[] {
  // Build linked list from array
  const dummy = new SinglyLinkedList<number>();
  for (const val of head) {
    dummy.append(val);
  }

  // Initialize pointers
  let slow: ListNode<number> | null = dummy.head;
  let fast: ListNode<number> | null = dummy.head;
  let prev: ListNode<number> | null = null;

  // Move fast n positions ahead
  for (let i = 0; i < n; i++) {
    fast = fast!.next;
  }

  // Move both until fast reaches end
  while (fast) {
    prev = slow;
    slow = slow!.next;
    fast = fast.next;
  }

  // Delete the node
  if (prev) {
    prev.next = slow!.next;
  }

  // Remove dummy head and convert to array
  dummy.head = dummy.head!.next;
  return dummy.toArray();
}

// =============================================================================
// TESTING REMOVE NTH FROM END
// =============================================================================

strictEqual(removeNthFromEnd([1, 2, 3, 4, 5], 2).join(","), "1,2,3,5");
strictEqual(removeNthFromEnd([1], 1).join(","), "");
strictEqual(removeNthFromEnd([1, 2], 1).join(","), "1");

console.log("Remove 2nd from end [1,2,3,4,5]:", removeNthFromEnd([1, 2, 3, 4, 5], 2));

// =============================================================================
// LINKED LIST COMPLEXITY SUMMARY
// =============================================================================

/**
 * Operation    | Singly | Doubly |
 * ------------|--------|--------|
 * prepend     | O(1)   | O(1)   |
 * append      | O(n)*  | O(1)   |
 * delete      | O(n)   | O(n)   |
 * find        | O(n)   | O(n)   |
 * reverse     | O(n)   | O(n)   |
 *
 * * Without tail pointer, O(1) with tail
 */

// =============================================================================
// WHEN TO USE LINKED LISTS
// =============================================================================

/**
 * Good use cases:
 * - Frequent insertions/deletions at known positions
 * - When you don't know the total size upfront
 * - Implementing other data structures (stacks, queues)
 * - Memory is at a premium (no index overhead)
 *
 * Avoid when:
 * - You need random access by index (use array)
 * - Search-heavy workloads (hash table better)
 * - Memory is tight (pointer overhead is 2 pointers per node)
 */
