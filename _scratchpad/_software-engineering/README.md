# Software Engineering Curriculum

A structured learning path covering essential computer science concepts for software engineering.

## Learning Path

```
Arrays & Basics
├── 01: Array Swapping
├── 03: Array Equilibrium
├── 05: Consecutive Ones
└── 07: Matrix Diagonal Sum

Strings & Math
├── 10: Palindromes
└── 11: Prime Numbers

Data Structures
├── 02: Binary Trees
├── 12: Union-Find
├── 13: Hash Tables
├── 14: Linked Lists
└── 16: Stack/Queue

Sorting & Searching
├── 03: Array Equilibrium
└── 09: Sorting Algorithms

Dynamic Programming
├── 06: Grid Paths
└── 08: Fibonacci Sequence

Graph Algorithms
└── 15: BFS/DFS

Special Topics
├── 04: Maximum Subarray
└── 09: Sorting Algorithms
```

## Lessons

### Foundation (Start Here)

| Lesson | Title | Category | Topics |
|--------|-------|----------|--------|
| 01 | [Array Swapping](./01-arrays-swapping.js) | Arrays | Adjacent swapping, sorting validation |
| 02 | [Binary Trees](./02-trees-binary-trees.js) | Data Structures | Tree traversal, recursion |
| 03 | [Array Equilibrium](./03-arrays-equilibrium.js) | Arrays & Search | Prefix sums, partitioning |
| 04 | [Maximum Subarray](./04-maximum-subarray.ts) | Algorithms | Kadane's algorithm, dynamic programming |

### Core Concepts

| Lesson | Title | Category | Topics |
|--------|-------|----------|--------|
| 05 | [Consecutive Ones](./05-arrays-consecutive-ones.ts) | Arrays | Sliding window, counting |
| 06 | [Grid Paths](./06-dynamic-programming-grid-paths.ts) | Dynamic Programming | Memoization, recursion |
| 07 | [Matrix Diagonal Sum](./07-matrices-diagonal-sum.js) | Matrices | Matrix traversal, indexing |
| 08 | [Fibonacci Sequence](./08-dynamic-programming-fibonacci.ts) | Dynamic Programming | Memoization, optimization |
| 09 | [Sorting Algorithms](./09-sorting-insertion-sort.js) | Sorting | Insertion sort, selection sort |

### Advanced Topics

| Lesson | Title | Category | Topics |
|--------|-------|----------|--------|
| 10 | [Palindromes](./10-strings-palindromes.js) | Strings | Two-pointer technique, recursion |
| 11 | [Prime Numbers](./11-math-prime-numbers.js) | Math | Number theory, optimization |
| 12 | [Union-Find](./12-graphs-union-find.js) | Graphs | Connected components |
| 13 | [Hash Tables](./13-hash-tables.ts) | Data Structures | Key-value storage, collisions |
| 14 | [Linked Lists](./14-linked-lists.ts) | Data Structures | List operations, pointers |
| 15 | [BFS/DFS](./15-bfs-dfs.ts) | Graphs | Graph traversal |
| 16 | [Stack/Queue](./16-stack-queue.ts) | Data Structures | LIFO/FIFO, applications |

## Prerequisites

Most lessons have no strict prerequisites, but understanding earlier lessons helps:

- **Dynamic Programming (06, 08)**: Benefits from understanding recursion first (02)
- **Graph Algorithms (12, 15)**: Builds on data structure concepts (02, 14)
- **Stack/Queue (16)**: Useful for understanding BFS/DFS (15) traversal

## Category Overview

### Arrays & Manipulation
Lessons focusing on array operations, searching, and manipulation techniques.

### Data Structures
Core data structures including trees, linked lists, hash tables, stacks, and queues.

### Dynamic Programming
Techniques for optimizing recursive solutions by memoizing subproblems.

### Graphs
Graph representation and traversal algorithms for solving connected structure problems.

### Sorting & Searching
Classic sorting algorithms and search techniques.

### Strings
String manipulation, pattern matching, and text processing.

### Math & Number Theory
Number properties, prime numbers, and mathematical optimizations.

## Running the Lessons

Each lesson is a standalone JavaScript or TypeScript file that can be run directly:

```bash
# JavaScript lessons
node _software-engineering/01-arrays-swapping.js

# TypeScript lessons (requires ts-node or compilation)
npx ts-node _software-engineering/06-dynamic-programming-grid-paths.ts
```

## Contributing

When adding new lessons:
1. Use two-digit numbering (17, 18, etc.)
2. Follow the standard header format
3. Add entry to this README
4. Place in appropriate category section
