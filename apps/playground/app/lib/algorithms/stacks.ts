/**
 * Stacks
 *
 * Stacks are list data structures that follow the FILO (First In, Last Out) principle.
 * When items are placed onto the stack, those placed first will be the last to be removed.
 * The last item placed on the stack must be removed before others can.
 *
 * Examples:
 * - Stack of Books: When you place a book on top of a stack of books, that book must be removed before the other books can be removed.
 * - Browser back button: When you visit a web page, the url of that page is placed into the stack of pages previously visited.
 */

export class Stack {
  count = 0;
  items: Record<number, any> = {};

  constructor(items?: any[]) {
    if (items) items.forEach((item) => this.push(item));
  }

  /**
   * Add item to the Stack
   */
  push(item: any) {
    this.items[this.count] = item;
    this.count += 1;
  }

  /**
   * Remove and return the last element in the Stack
   */
  pop(): any {
    const item = this.items[this.count - 1];
    delete this.items[this.count - 1];
    this.count -= 1;
    return item;
  }

  /**
   * Retrieve an element in the Stack
   */
  peek(index?: number): any {
    return this.items[index || 0];
  }

  /**
   * Return the number of items in the Stack
   */
  length(): number {
    return this.count;
  }
}

/**
 * Check if word is a palindrome using a stack
 */
export function isPalindrome(word: string): boolean {
  let test = "";
  const letters = new Stack(word.split(""));

  for (let i = 0; i < word.length; i++) {
    const letter = letters.pop();
    test += letter;
  }

  return test === word;
}
