/**
 * =============================================================================
 * LESSON 15: BFS and DFS
 * =============================================================================
 * Category: Graphs
 * Topics: Breadth-first search, depth-first search, graph traversal
 * Description: Implements BFS and DFS for graph traversal with practical
 *              examples including path finding and connected components.
 */

import { strictEqual } from 'assert';

// =============================================================================
// GRAPHS
//
// A graph is a collection of nodes (vertices) connected by edges.
//
// Graph terminology:
// - Vertex: A node in the graph
// - Edge: A connection between two vertices
// - Adjacent/Neighbors: Vertices connected by an edge
//
// Graph representations:
// 1. Adjacency List: Map<Vertex, List<Vertex>> - each vertex has a list of neighbors
// 2. Adjacency Matrix: 2D array where matrix[i][j] indicates edge i→j
//
// Our implementation uses adjacency list (more space-efficient for sparse graphs).
//
// Visual representation of our test graph:
//
//       A
//      / \
//     B   C
//     |   |
//     D───E
//      \ /
//       F
//
// Edges: A-B, A-C, B-D, C-E, D-E, D-F, E-F
// =============================================================================

class Graph {
  // Adjacency list: maps each vertex to its list of neighbors
  private adjacencyList: Map<string, string[]>;

  constructor() {
    this.adjacencyList = new Map();
  }

  /**
   * Add a vertex to the graph
   */
  addVertex(vertex: string): void {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
    }
  }

  /**
   * Add an undirected edge between two vertices
   *
   * @param v1 - First vertex
   * @param v2 - Second vertex
   */
  addEdge(v1: string, v2: string): void {
    // Add v2 to v1's adjacency list
    this.adjacencyList.get(v1)?.push(v2);
    // Add v1 to v2's adjacency list (undirected = bidirectional)
    this.adjacencyList.get(v2)?.push(v1);
  }

  // =============================================================================
  // BREADTH-FIRST SEARCH (BFS)
  // =============================================================================
  //
  // BFS explores vertices in "layers" - first all vertices at distance 1,
  // then distance 2, etc.
  //
  // Uses a QUEUE (FIFO) to track vertices to visit next.
  //
  // Visualization for our graph starting at A:
  //
  // Layer 0:     A         visited = {A}, queue = [A]
  // Layer 1:    B C       visited = {A,B,C}, queue = [B,C]
  // Layer 2:    D E       visited = {A,B,C,D,E}, queue = [D,E]
  // Layer 3:    F          visited = {A,B,C,D,E,F}, queue = [F]
  // End:                  visited = {A,B,C,D,E,F}, queue = []
  //
  // Order: A, B, C, D, E, F
  //
  // Properties:
  // - Finds shortest path in unweighted graphs
  // - Time: O(V + E) where V=vertices, E=edges
  // - Space: O(V) for visited set and queue
  //
  /**
   * BFS traversal starting from a vertex
   *
   * @param start - Starting vertex
   * @returns Array of vertices in BFS order
   */
  bfs(start: string): string[] {
    const visited = new Set<string>();  // Track visited vertices
    const result: string[] = [];       // BFS traversal order
    const queue: string[] = [start];    // Queue for BFS

    visited.add(start);

    // Process vertices from queue until empty
    while (queue.length > 0) {
      // Dequeue (remove from front)
      const vertex = queue.shift()!;
      result.push(vertex);

      // Enqueue all unvisited neighbors
      const neighbors = this.adjacencyList.get(vertex) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    return result;
  }

  // =============================================================================
  // DEPTH-FIRST SEARCH (DFS)
  // =============================================================================
  //
  // DFS explores as deep as possible along each branch before backtracking.
  //
  // Uses a STACK (LIFO) - either explicit or through recursion.
  //
  // Visualization for our graph starting at A:
  //
  //   A
  //   ├─ B
  //   │  └─ D
  //   │     ├─ E
  //   │     │  └─ F
  //   │     └─ F
  //   └─ C
  //      └─ E
  //         └─ F
  //
  // Order (depends on implementation): A, B, D, E, F, C or similar
  //
  // Properties:
  // - Good for detecting cycles, topological sort
  // - Time: O(V + E)
  // - Space: O(V) for visited set + recursion stack
  //
  /**
   * DFS traversal starting from a vertex (recursive)
   */
  dfs(start: string): string[] {
    const visited = new Set<string>();
    const result: string[] = [];

    const dfsHelper = (vertex: string): void => {
      visited.add(vertex);
      result.push(vertex);

      // Recursively visit unvisited neighbors
      const neighbors = this.adjacencyList.get(vertex) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfsHelper(neighbor);
        }
      }
    };

    dfsHelper(start);
    return result;
  }

  /**
   * DFS iterative version (using explicit stack)
   *
   * Same logic as recursive, but using an explicit stack data structure.
   */
  dfsIterative(start: string): string[] {
    const visited = new Set<string>();
    const result: string[] = [];
    const stack: string[] = [start];

    while (stack.length > 0) {
      // Pop from stack (LIFO)
      const vertex = stack.pop()!;

      if (!visited.has(vertex)) {
        visited.add(vertex);
        result.push(vertex);

        // Push neighbors onto stack
        // Note: we reverse to maintain consistent order with recursive DFS
        const neighbors = this.adjacencyList.get(vertex) || [];
        for (const neighbor of neighbors.reverse()) {
          if (!visited.has(neighbor)) {
            stack.push(neighbor);
          }
        }
      }
    }

    return result;
  }

  // =============================================================================
  // PRACTICAL APPLICATIONS
  // =============================================================================

  /**
   * Check if a path exists between two vertices using BFS
   *
   * @param start - Start vertex
   * @param end - End vertex
   * @returns true if path exists
   */
  hasPathBfs(start: string, end: string): boolean {
    const visited = new Set<string>();
    const queue: string[] = [start];

    visited.add(start);

    while (queue.length > 0) {
      const vertex = queue.shift()!;

      // Found the destination!
      if (vertex === end) return true;

      const neighbors = this.adjacencyList.get(vertex) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    // Exhausted all possibilities - no path
    return false;
  }

  /**
   * Find the shortest path between two vertices
   *
   * BFS naturally finds shortest paths in unweighted graphs because
   * it explores vertices in order of distance from start.
   *
   * We track the PATH along with each vertex.
   *
   * @param start - Start vertex
   * @param end - End vertex
   * @returns Array representing path, or null if no path exists
   */
  findShortestPath(start: string, end: string): string[] | null {
    const visited = new Set<string>();
    // Queue now holds {vertex, path} pairs
    const queue: Array<{ vertex: string; path: string[] }> = [
      { vertex: start, path: [start] },
    ];

    visited.add(start);

    while (queue.length > 0) {
      const { vertex, path } = queue.shift()!;

      // Reached destination?
      if (vertex === end) return path;

      const neighbors = this.adjacencyList.get(vertex) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          // Append neighbor to path when enqueuing
          queue.push({ vertex: neighbor, path: [...path, neighbor] });
        }
      }
    }

    return null;  // No path found
  }

  /**
   * Find all connected components in the graph
   *
   * A connected component is a subgraph where every vertex
   * is reachable from every other vertex.
   *
   * Algorithm: For each unvisited vertex, run BFS to find
   * all vertices reachable from it (one component).
   */
  getConnectedComponents(): string[][] {
    const visited = new Set<string>();
    const components: string[][] = [];

    for (const vertex of this.adjacencyList.keys()) {
      // If not visited, this is a new component
      if (!visited.has(vertex)) {
        const component: string[] = [];
        const queue: string[] = [vertex];

        visited.add(vertex);

        // BFS to find all vertices in this component
        while (queue.length > 0) {
          const current = queue.shift()!;
          component.push(current);

          const neighbors = this.adjacencyList.get(current) || [];
          for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
              visited.add(neighbor);
              queue.push(neighbor);
            }
          }
        }

        components.push(component);
      }
    }

    return components;
  }

  /**
   * Count connected components
   */
  numberOfConnectedComponents(): number {
    return this.getConnectedComponents().length;
  }
}

// =============================================================================
// TESTING
// =============================================================================

const graph = new Graph();
graph.addVertex("A");
graph.addVertex("B");
graph.addVertex("C");
graph.addVertex("D");
graph.addVertex("E");
graph.addVertex("F");

graph.addEdge("A", "B");
graph.addEdge("A", "C");
graph.addEdge("B", "D");
graph.addEdge("C", "E");
graph.addEdge("D", "E");
graph.addEdge("D", "F");
graph.addEdge("E", "F");

console.log("BFS from A:", graph.bfs("A"));
console.log("DFS from A:", graph.dfs("A"));
console.log("DFS Iterative from A:", graph.dfsIterative("A"));

strictEqual(graph.bfs("A").join(","), "A,B,C,D,E,F");
strictEqual(graph.hasPathBfs("A", "F"), true);
strictEqual(graph.hasPathBfs("F", "A"), true);

const shortestPath = graph.findShortestPath("A", "F");
if (shortestPath) {
  console.log("Shortest path A to F:", shortestPath.join(" -> "));
  strictEqual(shortestPath.join(","), "A,B,D,F");
}

// =============================================================================
// TESTING CONNECTED COMPONENTS
// =============================================================================

// Graph with two separate components: 1-2-3 and 4-5
const graph2 = new Graph();
graph2.addVertex("1");
graph2.addVertex("2");
graph2.addVertex("3");
graph2.addVertex("4");
graph2.addVertex("5");
graph2.addEdge("1", "2");
graph2.addEdge("2", "3");
graph2.addEdge("4", "5");

console.log("Number of components:", graph2.numberOfConnectedComponents());
strictEqual(graph2.numberOfConnectedComponents(), 2);

// =============================================================================
// PRACTICAL APPLICATION: COURSE SCHEDULE (TOPOLOGICAL SORT)
// =============================================================================

/**
 * LeetCode 207: Course Schedule
 *
 * Determine if you can finish all courses given prerequisites.
 *
 * This is a classic topological sort / cycle detection problem.
 *
 * Approach: Build directed graph, check for cycles using BFS (Kahn's algorithm).
 * - Calculate in-degree (number of incoming edges) for each vertex
 * - Start with vertices that have in-degree 0 (can be taken first)
 * - "Take" those courses, decrement in-degree of their neighbors
 * - If all courses can be "taken", there's no cycle
 *
 * @param numCourses - Total number of courses (labeled 0 to numCourses-1)
 * @param prerequisites - Array of [course, prerequisite] pairs
 * @returns true if all courses can be finished
 */
function canFinishCourses(
  numCourses: number,
  prerequisites: number[][]
): boolean {
  // Build adjacency list for directed graph
  const graph = new Map<number, number[]>();
  // Track in-degree (number of prerequisites) for each course
  const inDegree = new Array(numCourses).fill(0);

  // Initialize graph
  for (let i = 0; i < numCourses; i++) {
    graph.set(i, []);
  }

  // Build graph from prerequisites
  // Edge: prerequisite → course (must take prerequisite first)
  for (const [course, prereq] of prerequisites) {
    graph.get(prereq)!.push(course);
    inDegree[course]++;  // course has one more prerequisite
  }

  // Kahn's algorithm: Start with courses that have no prerequisites
  const queue: number[] = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) {
      queue.push(i);
    }
  }

  let completed = 0;

  // Process courses with in-degree 0
  while (queue.length > 0) {
    const course = queue.shift()!;
    completed++;

    // "Take" this course, reducing in-degree of dependent courses
    for (const next of graph.get(course)!) {
      inDegree[next]--;
      // If a course now has no prerequisites, it can be taken next
      if (inDegree[next] === 0) {
        queue.push(next);
      }
    }
  }

  // If we completed all courses, there was no cycle
  return completed === numCourses;
}

// =============================================================================
// TESTING COURSE SCHEDULE
// =============================================================================

strictEqual(canFinishCourses(2, [[1, 0]]), true);
// Can take: 0 → then 1 ✓

strictEqual(canFinishCourses(2, [[1, 0], [0, 1]]), false);
// Cycle: 0 requires 1, 1 requires 0 - impossible!

strictEqual(
  canFinishCourses(4, [[1, 0], [2, 0], [3, 1], [3, 2]]),
  true
);
// Valid: 0 → (1, 2) → 3

console.log(
  "Can finish courses [[1,0],[2,0],[3,1],[3,2]]:",
  canFinishCourses(4, [[1, 0], [2, 0], [3, 1], [3, 2]])
);

// =============================================================================
// BFS vs DFS SUMMARY
// =============================================================================

/**
 * BFS (Breadth-First Search):
 * - Uses QUEUE
 * - Explores layer by layer
 * - Finds SHORTEST PATH in unweighted graphs
 * - Better for: nearest neighbors, level-order traversal
 *
 * DFS (Depth-First Search):
 * - Uses STACK (or recursion)
 * - Explores deep before backtracking
 * - Uses less memory for deep graphs
 * - Better for: path existence, cycle detection, topological sort
 */

// =============================================================================
// COMMON GRAPH ALGORITHMS USING BFS/DFS
// =============================================================================

/**
 * Other problems solved with BFS/DFS:
 *
 * 1. Number of Islands (LeetCode 200):
 *    - Use DFS/BFS to find connected components of '1's in a grid
 *
 * 2. Clone Graph (LeetCode 133):
 *    - BFS to copy all nodes and edges
 *
 * 3. Word Ladder (LeetCode 127):
 *    - BFS to find shortest transformation sequence
 *
 * 4. Pacific Atlantic Water Flow (LeetCode 417):
 *    - BFS from Pacific and Atlantic edges, find cells reachable from both
 *
 * 5. Rotting Oranges (LeetCode 994):
 *    - BFS to simulate spread of rot
 */
