/**
 * =============================================================================
 * LESSON 12: Union-Find (Disjoint Set Union)
 * =============================================================================
 * Category: Graphs & Data Structures
 * Topics: Union-find, connected components, graph representation
 * Description: Implements a basic Graph with union-find operations for
 *              tracking connected components and relationships.
 */

import { strictEqual } from "assert";

// =============================================================================
// UNION-FIND / DISJOINT SET UNION (DSU)
//
// A data structure that tracks elements partitioned into disjoint sets.
//
// Key Operations:
// 1. find(x): Determine which set x belongs to (usually returns a "representative")
// 2. union(a, b): Merge two sets into one
// 3. connected(a, b): Check if two elements are in the same set
//
// Applications:
// - Cycle detection in graphs
// - Finding connected components
// - Kruskal's minimum spanning tree algorithm
// - Image processing (segmentation)
// - Network connectivity
// - etc.
//
// The current implementation is simplified. A proper Union-Find uses:
// - Parent array: each element points to its parent
// - Path compression: flatten structure during find
// - Union by rank: attach smaller tree under larger one
// =============================================================================

/**
 * Current implementation (simplified version)
 *
 * Issues with this implementation:
 * - Uses array index as "representative" rather than true parent pointers
 * - No path compression
 * - No union by rank/size
 * - Array key using stringified points is fragile
 *
 * This is a basic educational version. Production code should use proper DSU.
 */
type PointTuple = [number, number];

type Edge = [number, number];

type PointLike = Point | PointTuple;

export class Graph {
  private groups: Record<string, number> = {};

  private points: Point[] = [];

  private getKey(point: PointLike): string {
    if (point instanceof Point) {
      return `${point.x},${point.y}`;
    }

    return `${point[0]},${point[1]}`;
  }

  /**
   * Add a point to the graph
   *
   * @param {Point} point - Point object with x, y coordinates
   */
  addPoint(point: Point): void {
    // Use stringified coordinates as key
    // e.g., point {x:1, y:2} becomes key "1,2"
    const key = this.getKey(point);
    this.groups[key] = this.points.length;
    this.points.push(point);
  }

  /**
   * Union: Connect two elements
   *
   * This simplified version just makes b point to a's group.
   * A proper union would find the roots of both and attach one to the other.
   *
   * @param {Point} a - First element (will be the "representative")
   * @param {Point} b - Second element (will be attached to a's set)
   */
  union(a: PointLike, b: PointLike): void {
    // Simplified: just copy a's group id to b
    // A proper implementation would find roots first
    this.groups[this.getKey(b)] = this.groups[this.getKey(a)];
  }

  /**
   * Check if two elements are connected (in the same set)
   *
   * @param {Point} a - First element
   * @param {Point} b - Second element
   * @returns {boolean} - true if connected
   */
  connected(a: PointLike, b: PointLike): boolean {
    return this.groups[this.getKey(b)] === this.groups[this.getKey(a)];
  }
}

/**
 * Point constructor function
 */
export class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}

/**
 * Line segment constructor
 */
export class Segment {
  constructor(
    public p1: Point,
    public p2: Point,
  ) {}
}

// =============================================================================
// PROPER UNION-FIND IMPLEMENTATION
//
// This is how a production-quality Union-Find should be implemented.
// =============================================================================

export class UnionFind {
  parent: number[];

  rank: number[];

  numSets: number;

  constructor(size: number) {
    // Parent[i] = parent of i, parent[i] = i means i is a root
    this.parent = [];
    // Rank[i] = upper bound on tree height (for union by rank)
    this.rank = [];
    // Number of distinct sets
    this.numSets = size;

    // Initialize: each element is its own parent (forms its own set)
    for (let i = 0; i < size; i++) {
      this.parent[i] = i;
      this.rank[i] = 0;
    }
  }

  /**
   * Find the representative (root) of the set containing x
   *
   * Uses path compression: makes every node on the path point directly to root
   * This flattens the structure and speeds up future operations
   *
   * @param {number} x - Element to find
   * @returns {number} - Root/set representative
   */
  find(x: number): number {
    if (this.parent[x] !== x) {
      // Path compression: make x point directly to its root
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }

  /**
   * Union: Merge sets containing a and b
   *
   * Union by rank: attach smaller tree under root of larger tree
   * This keeps trees balanced and prevents worst-case linear chains
   *
   * @param {number} a - First element
   * @param {number} b - Second element
   */
  union(a: number, b: number): void {
    const rootA = this.find(a);
    const rootB = this.find(b);

    // Already in the same set
    if (rootA === rootB) return;

    // Union by rank: attach smaller tree under larger tree
    if (this.rank[rootA] < this.rank[rootB]) {
      this.parent[rootA] = rootB;
    } else if (this.rank[rootA] > this.rank[rootB]) {
      this.parent[rootB] = rootA;
    } else {
      // Same rank: choose one as root and increment its rank
      this.parent[rootB] = rootA;
      this.rank[rootA]++;
    }

    this.numSets--;
  }

  /**
   * Check if two elements are in the same set
   *
   * @param {number} a - First element
   * @param {number} b - Second element
   * @returns {boolean} - true if connected
   */
  connected(a: number, b: number): boolean {
    return this.find(a) === this.find(b);
  }

  /**
   * Get number of distinct sets
   *
   * @returns {number} - Number of connected components
   */
  getNumSets(): number {
    return this.numSets;
  }
}

// =============================================================================
// TESTING
// =============================================================================

// Test simplified graph
const graph = new Graph();

graph.addPoint(new Point(1, 2));
graph.addPoint(new Point(2, 2));
graph.addPoint(new Point(1, 3));

graph.union([1, 2], [3, 1]);

console.log("Simplified Graph connected([1,2], [2,2]):", graph.connected([1, 2], [2, 2]));
console.log("Simplified Graph connected([1,2], [3,1]):", graph.connected([1, 2], [3, 1]));

// Test proper Union-Find
console.log("\n--- Proper Union-Find ---");

const uf = new UnionFind(10);

// Initially, each element is in its own set
console.log("After initialization:");
console.log("connected(0, 1):", uf.connected(0, 1)); // false
console.log("Number of sets:", uf.getNumSets()); // 10

// Union some elements
uf.union(0, 1);
uf.union(2, 3);
uf.union(4, 5);
uf.union(6, 7);
uf.union(0, 2); // Merge sets containing 0 and 2

console.log("\nAfter unions (0-1, 2-3, 4-5, 6-7, 0-2):");
console.log("connected(0, 1):", uf.connected(0, 1)); // true (in same set)
console.log("connected(1, 2):", uf.connected(1, 2)); // true (0-1 and 0-2, so 1-2 connected)
console.log("connected(3, 4):", uf.connected(3, 4)); // false
console.log("Number of sets:", uf.getNumSets()); // 5 (merged two pairs)

// More unions
uf.union(8, 9);
uf.union(0, 8); // Merge sets containing 0 and 8

console.log("\nAfter more unions (8-9, 0-8):");
console.log("connected(1, 9):", uf.connected(1, 9)); // true (all connected now)
console.log("Number of sets:", uf.getNumSets()); // 4

// =============================================================================
// APPLICATION: CYCLE DETECTION IN GRAPH
// =============================================================================

/**
 * Detect if adding an edge would create a cycle
 *
 * Using Union-Find for cycle detection:
 * - For each edge (u, v), check if u and v are already connected
 * - If yes, adding this edge creates a cycle
 * - If no, union them and continue
 *
 * @param {Array<[number, number]>} edges - Array of edges as [u, v] pairs
 * @returns {boolean} - true if cycle would be created
 */
export function wouldCreateCycle(edges: Edge[]): boolean {
  const uf = new UnionFind(edges.length + 1);

  for (const [u, v] of edges) {
    if (uf.connected(u, v)) {
      // u and v already connected, adding this edge creates a cycle
      return true;
    }
    uf.union(u, v);
  }

  return false;
}

// Example: triangle graph has cycle, path graph doesn't
const triangleEdges: Edge[] = [
  [0, 1],
  [1, 2],
  [2, 0],
];
const pathEdges: Edge[] = [
  [0, 1],
  [1, 2],
  [2, 3],
];

console.log("\n--- Cycle Detection ---");
console.log("Triangle (has cycle):", wouldCreateCycle(triangleEdges)); // true
console.log("Path (no cycle):", wouldCreateCycle(pathEdges)); // false

// =============================================================================
// APPLICATION: NUMBER OF CONNECTED COMPONENTS
// =============================================================================

/**
 * Count connected components in an undirected graph
 *
 * @param {number} n - Number of nodes
 * @param {Array<[number, number]>} edges - Array of edges
 * @returns {number} - Number of connected components
 */
export function countComponents(n: number, edges: Edge[]): number {
  const uf = new UnionFind(n);

  for (const [u, v] of edges) {
    uf.union(u, v);
  }

  return uf.getNumSets();
}

// Example
const componentsEdges: Edge[] = [
  [0, 1],
  [2, 3],
  [4, 5],
];
console.log("\n--- Connected Components ---");
console.log("Count:", countComponents(6, componentsEdges)); // 3
