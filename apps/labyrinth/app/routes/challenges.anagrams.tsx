/**
 * Challenge: Group Anagrams (ChartHop)
 *
 * Given a list of words, group all anagrams together. Two words are anagrams
 * if they contain the same letters in any order (e.g. "eat", "tea", "ate").
 *
 * Solution: Sort-key grouping (O(n · k log k))
 * For each word, sort its characters alphabetically to produce a canonical key.
 * All anagrams of the same word will produce the same key ("eat" → "aet",
 * "tea" → "aet"), so they naturally fall into the same bucket in a hash map.
 * This avoids comparing words against each other directly, keeping the
 * algorithm linear in the number of words times the cost of sorting each word.
 */

import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@ponti-studios/ui/primitives";
import { Input } from "@ponti-studios/ui/forms";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ponti-studios/ui/data-display";
import { useState, type ChangeEvent, type JSX } from "react";

// A set of words that are all anagrams of each other
type WordGroup = string[];

// Records what happened when one word was processed by the algorithm
type Step = {
  word: string; // the original word
  sortedKey: string; // the word's characters sorted alphabetically
  groupIndex: number; // which group this word was assigned to
};

// The full output of the algorithm: each processing step plus the final groups
type AlgorithmResult = {
  steps: Step[];
  groups: WordGroup[];
};

// Groups words by sorting each word's characters into a canonical key.
// Words that produce the same key are anagrams and belong in the same group.
function groupBySortKey(words: string[]): AlgorithmResult {
  // Map from sorted-character key to the index of the group it represents
  const keyToGroupIndex = new Map<string, number>();
  // Accumulates the groups as we process each word
  const groups: WordGroup[] = [];
  // Records each word's processing step for visualization
  const steps: Step[] = [];

  for (const word of words) {
    // Sort the characters to produce a key identical for all anagrams of this word
    const sortedKey = word.split("").sort().join("");
    // Look up whether a group for this key already exists
    let groupIndex = keyToGroupIndex.get(sortedKey);

    if (groupIndex === undefined) {
      // No group yet — create one and record its index
      groupIndex = groups.length;
      groups.push([]);
      keyToGroupIndex.set(sortedKey, groupIndex);
    }

    // Add the word to its group
    groups[groupIndex].push(word);
    // Record this step for the visualization
    steps.push({ word, sortedKey, groupIndex });
  }

  return { steps, groups };
}

// Splits a comma-separated string into an array of trimmed, non-empty words
function tokenizeInput(input: string): string[] {
  return input
    .split(",") // divide on comma boundaries
    .map((word) => word.trim()) // strip leading and trailing whitespace
    .filter((word) => word.length > 0); // discard empty tokens
}

const GROUP_COLORS = [
  {
    row: "text-blue-700",
    badge: "bg-blue-100 border-blue-300 text-blue-800",
    card: "border-blue-300 bg-blue-50 text-blue-800",
  },
  {
    row: "text-green-700",
    badge: "bg-green-100 border-green-300 text-green-800",
    card: "border-green-300 bg-green-50 text-green-800",
  },
  {
    row: "text-violet-700",
    badge: "bg-violet-100 border-violet-300 text-violet-800",
    card: "border-violet-300 bg-violet-50 text-violet-800",
  },
  {
    row: "text-orange-700",
    badge: "bg-orange-100 border-orange-300 text-orange-800",
    card: "border-orange-300 bg-orange-50 text-orange-800",
  },
  {
    row: "text-pink-700",
    badge: "bg-pink-100 border-pink-300 text-pink-800",
    card: "border-pink-300 bg-pink-50 text-pink-800",
  },
];

function colorFor(index: number) {
  return GROUP_COLORS[index % GROUP_COLORS.length];
}

const RUN_DELAY_MS = 600;
const ROW_STAGGER_MS = 100;

export default function Anagrams(): JSX.Element {
  const [input, setInput] = useState("eat, tea, tan, ate, nat, bat");
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<AlgorithmResult | null>(() =>
    groupBySortKey(tokenizeInput("eat, tea, tan, ate, nat, bat")),
  );

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setInput(event.target.value);
  };

  const run = (): void => {
    setIsRunning(true);
    setResult(null);

    setTimeout(() => {
      setResult(groupBySortKey(tokenizeInput(input)));
      setIsRunning(false);
    }, RUN_DELAY_MS);
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-xl font-semibold">Anagrams</h2>
        <p className="text-muted-foreground">Group anagrams together from a list of words.</p>
        <i className="text-muted-foreground text-xs">Courtesy of ChartHop</i>
      </header>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Enter words separated by commas"
          className="flex-1"
        />
        <Button onClick={run} disabled={isRunning} className="flex items-center gap-2">
          {isRunning ? (
            <>
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Running…
            </>
          ) : (
            "Run"
          )}
        </Button>
      </div>

      {result && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Step by step</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Word</TableHead>
                    <TableHead>Sort characters</TableHead>
                    <TableHead>Assigned to</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.steps.map((step, i) => {
                    const color = colorFor(step.groupIndex);
                    return (
                      <TableRow
                        key={i}
                        style={{
                          animation: `fade-slide-in 300ms ease-out both`,
                          animationDelay: `${i * ROW_STAGGER_MS}ms`,
                        }}
                      >
                        <TableCell className={`font-mono font-medium ${color.row}`}>
                          {step.word}
                        </TableCell>
                        <TableCell className="text-muted-foreground font-mono">{step.sortedKey}</TableCell>
                        <TableCell>
                          <span
                            className={`rounded border px-2 py-0.5 text-xs font-medium ${color.badge}`}
                          >
                            Group {step.groupIndex + 1}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className="grid w-full grid-cols-3 flex-wrap gap-3">
                {result.groups.map((group, groupIndex) => {
                  const color = colorFor(groupIndex);
                  return (
                    <Card key={groupIndex} className={`border ${color.card}`}>
                      <p className="mb-2 text-xs font-medium">Group {groupIndex + 1}</p>
                      <div className="flex flex-wrap gap-2">
                        {group.map((word, wordIndex) => (
                          <span key={wordIndex} className="font-mono text-sm">
                            {word}
                          </span>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
