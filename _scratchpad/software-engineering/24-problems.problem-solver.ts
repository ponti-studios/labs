/**
 * =============================================================================
 * LESSON 24: Problem Solver Overview
 * =============================================================================
 * Category: Problems
 * Topics: Two-sum, swapping, arithmetic optimization, problem solving
 * Description: A compact node-runnable overview of the practice problems that
 *              used to live in the Labyrinth route explorer.
 */

import { strictEqual } from "assert";

type Problem = {
  name: string;
  lesson: string;
  difficulty: "Easy";
  concept: string;
};

const problems: Problem[] = [
  {
    name: "Two Sum",
    lesson: "21-problems.two-sum.ts",
    difficulty: "Easy",
    concept: "Hash maps and complements",
  },
  {
    name: "Swap Elements",
    lesson: "22-problems.swap-elements.ts",
    difficulty: "Easy",
    concept: "Mutation vs. immutability",
  },
  {
    name: "Sum Array",
    lesson: "23-problems.sum-array.ts",
    difficulty: "Easy",
    concept: "Looping and arithmetic series",
  },
];

strictEqual(problems.length, 3);

console.log("=== Problem Solver Overview ===");
for (const problem of problems) {
  console.log(`- ${problem.name} (${problem.difficulty}) -> ${problem.lesson}`);
  console.log(`  concept: ${problem.concept}`);
}
console.log("\nRun each lesson with ts-node to see its self-tests and output.");
