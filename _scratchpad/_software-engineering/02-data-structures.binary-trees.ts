/**
 * =============================================================================
 * LESSON 02: Binary Trees
 * =============================================================================
 * Category: Data Structures
 * Topics: Tree traversal, recursion, tree properties
 * Description: Recursively processes a binary tree structure, computing values
 *              based on left (l) and right (r) subtrees for each node.
 */

// =============================================================================
// BINARY TREE STRUCTURE
//
// A binary tree is a hierarchical data structure where:
// - Each node has at most two children: left (l) and right (r)
// - The tree has a root node (topmost), and each node can have subtrees
//
// Tree Representation in JavaScript:
// - Object with 'x' property for node value
// - 'l' property for left child (null if none)
// - 'r' property for right child (null if none)
//
// Visual representation of our example tree:
//
//           5           ← root (x: 5)
//          / \
//         3   10        ← level 1 (l: 3, r: 10)
//        /   / \
//       20  1   15      ← level 2
//      /       / \
//    [obj]   [obj] [obj] ← level 3 (leaf nodes)
// =============================================================================

/**
 * Example binary tree used for demonstrating traversal.
 *
 * Structure details:
 * - Root node: value 5
 * - Left subtree of 5: node with value 3, which has left child 20
 * - Right subtree of 5: node with value 10, which has children 1 (left) and 15 (right)
 *
 * This is a ternary tree visualization:
 *
 *        5           ← root
 *       / \
 *      3   10        ← 5's children
 *     /   / \
 *    20  1   15      ← 10's children
 *   /       / \
 *  ●       ●   ●     ← null children represented as ●
 */
interface TreeNode {
  x: number;
  l: TreeNode | null;
  r: TreeNode | null;
}

const binaryTree: TreeNode = {
  // Root node with value 5
  x: 5,
  // Left subtree: node with value 3
  l: {
    x: 3,
    // Left child of 3: node with value 20 (has children but they're just placeholders)
    l: {
      x: 20,
      // Left child of 20 is omitted here to keep the sample tree well-typed in TypeScript
      l: null,
      // Right child of 20 is null (no right child)
      r: null,
    },
    // Right child of 3 is null (3 has no right child)
    r: null,
  },
  // Right subtree: node with value 10
  r: {
    x: 10,
    // Left child of 10: node with value 1 (leaf node)
    l: { x: 1, l: null, r: null },
    // Right child of 10: node with value 15 (has children)
    r: { x: 15, l: null, r: null },
  },
};

// =============================================================================
// TREE TRAVERSAL (Currently buggy - see notes below)
//
// This function attempts to traverse the tree recursively,
// but has issues with its implementation.
//
// Issues with the current implementation:
// 1. Object.keys(T) returns ['x', 'l', 'r'] - it iterates over properties, not nodes
// 2. The recursive calls don't properly compute meaningful values
// 3. This would cause infinite recursion on circular references
//
// A proper binary tree traversal should:
// 1. Process the current node's value
// 2. Recursively traverse the left subtree (if exists)
// 3. Recursively traverse the right subtree (if exists)
//
// Common traversal orders:
// - Preorder: Process root, then left, then right
// - Inorder: Process left, then root, then right
// - Postorder: Process left, then right, then root
// =============================================================================

/**
 * Attempts to traverse a binary tree and compute values for each node.
 *
 * NOTE: This implementation has issues - see explanation below.
 *
 * @param {Object} T - Binary tree with properties x (value), l (left), r (right)
 * @returns {Array} - Array of objects with computed l and r values
 */
export function solution(T: TreeNode): Array<{ l: number; r: number }> {
  // ISSUE: Object.keys(T) returns ['x', 'l', 'r'] - the property names
  // This iterates over the properties of the root node, not a proper tree traversal!
  //
  // For the root node { x: 5, l: {...}, r: {...} }, this returns:
  // ['x', 'l', 'r'] - three keys, not three nodes
  //
  // A proper implementation would check if T exists, then:
  // 1. Process T.x (the current node's value)
  // 2. If T.l exists, recursively process it
  // 3. If T.r exists, recursively process it

  return Object.keys(T).map(function () {
    // BUG: 'item' here is a key string ('x', 'l', or 'r'), not a subtree node
    // So item.l and item.r don't mean what the code thinks they do
    //
    // The condition `item.l != null` checks if the STRING 'x', 'l', or 'r'
    // has a property 'l', which is always undefined/null for strings
    //
    // This causes the ternary to always return 0 (the else branch)

    return {
      // This will always be 0 due to the bug described above
      l: 0,
      r: 0,
    };
  });
}

// =============================================================================
// CORRECT BINARY TREE TRAVERSAL EXAMPLES
//
// Below are proper implementations of binary tree traversal algorithms.
// Use these as reference for correct tree processing.
// =============================================================================

/**
 * Correct Preorder Traversal: Root → Left → Right
 *
 * Use case: Creating a copy of the tree, getting prefix expression
 *
 * @param {Object} node - Current node in tree
 * @returns {Array} - Array of node values in preorder
 */
export function preorderTraversal(node: TreeNode | null): number[] {
  // Base case: if node is null or undefined, return empty array
  if (node === null || node === undefined) {
    return [];
  }

  const result = [];

  // Process current node first (root)
  result.push(node.x);

  // Then recursively process left subtree
  if (node.l !== null && node.l !== undefined) {
    result.push(...preorderTraversal(node.l));
  }

  // Then recursively process right subtree
  if (node.r !== null && node.r !== undefined) {
    result.push(...preorderTraversal(node.r));
  }

  return result;
}

/**
 * Correct Postorder Traversal: Left → Right → Root
 *
 * Use case: Deleting the tree, evaluating expressions
 *
 * @param {Object} node - Current node in tree
 * @returns {Array} - Array of node values in postorder
 */
export function postorderTraversal(node: TreeNode | null): number[] {
  if (node === null || node === undefined) {
    return [];
  }

  const result = [];

  // First recursively process left subtree
  if (node.l !== null && node.l !== undefined) {
    result.push(...postorderTraversal(node.l));
  }

  // Then recursively process right subtree
  if (node.r !== null && node.r !== undefined) {
    result.push(...postorderTraversal(node.r));
  }

  // Finally process current node (root)
  result.push(node.x);

  return result;
}

/**
 * Calculate tree depth (number of levels)
 *
 * Depth vs Height:
 * - Depth: distance from root to a specific node
 * - Height: distance from a node to the deepest leaf (this function)
 *
 * @param {Object} node - Current node
 * @returns {number} - Height of the subtree rooted at this node
 */
export function treeHeight(node: TreeNode | null): number {
  // Base case: null node has height 0
  if (node === null || node === undefined) {
    return 0;
  }

  // Recursive case: height is 1 (for current node) plus max of children's heights
  // If a node has no children, its height is 1
  const leftHeight = treeHeight(node.l);
  const rightHeight = treeHeight(node.r);

  return 1 + Math.max(leftHeight, rightHeight);
}

/**
 * Count total number of nodes in the tree
 *
 * @param {Object} node - Current node
 * @returns {number} - Total nodes in subtree
 */
export function countNodes(node: TreeNode | null): number {
  if (node === null || node === undefined) {
    return 0;
  }

  // Count this node (1) plus nodes in left subtree plus nodes in right subtree
  return 1 + countNodes(node.l) + countNodes(node.r);
}

// =============================================================================
// TESTING THE CORRECT IMPLEMENTATIONS
// =============================================================================

console.log("Preorder traversal:", preorderTraversal(binaryTree));
// Expected: [5, 3, 20, 10, 1, 15]

console.log("Postorder traversal:", postorderTraversal(binaryTree));
// Expected: [20, 3, 1, 15, 10, 5]

console.log("Tree height:", treeHeight(binaryTree));
// Expected: 4 (root is level 1, 20/15 are level 3, so depth is 3 levels deep)

console.log("Node count:", countNodes(binaryTree));
// Expected: 6 (nodes with values: 5, 3, 20, 10, 1, 15)

// NOTE: The original buggy solution() is left in place but should not be used
// It demonstrates how easy it is to write incorrect tree traversal code
console.log("Original (buggy) solution:", solution(binaryTree)); // eslint-disable-line
