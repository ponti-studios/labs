import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from "@pontistudios/ui";
import { useEffect, useState, type ChangeEvent, type CSSProperties, type JSX } from "react";

// A set of words that are all anagrams of each other
type WordGroup = string[];

// The output of running an algorithm: the grouped results plus how long it took
type TimedResult = {
  groups: WordGroup[];
  ms: number;
};

// Groups words by sorting each word's characters into a canonical key.
// Words that produce the same key are anagrams and belong in the same group.
function groupBySortKey(words: string[]): WordGroup[] {
  // Map from sorted-character key to the group of words that share it
  const keyToGroup = new Map<string, WordGroup>();

  for (const word of words) {
    // Sort the characters to produce a key that is identical for all anagrams of this word
    const sortedKey = word.split("").sort().join("");
    // Look up whether a group for this key already exists
    const existingGroup = keyToGroup.get(sortedKey);

    if (existingGroup) {
      // A group exists — append the word to it
      existingGroup.push(word);
      continue;
    }

    // No group yet — create one seeded with this word
    keyToGroup.set(sortedKey, [word]);
  }

  // Discard the keys and return only the groups
  return Array.from(keyToGroup.values());
}

// Returns true if `candidate` could be an anagram of the first word in `group`.
// Used by groupByLetterScan to decide which group a word belongs to.
function candidateMatchesGroup(group: WordGroup, candidate: string): boolean {
  // An empty group has no reference word to compare against
  if (group.length === 0) {
    return false;
  }

  // Use the first word in the group as the anagram reference
  const [referenceWord] = group;
  // Words of different lengths cannot be anagrams
  if (referenceWord.length !== candidate.length) {
    return false;
  }

  // Every letter in the candidate must appear in the reference word
  return candidate.split("").every((letter) => referenceWord.includes(letter));
}

// Scans all existing groups and returns the index of the one whose letters
// match `word`, or -1 if no match is found.
function findMatchingGroupIndex(groups: WordGroup[], word: string): number {
  for (let index = 0; index < groups.length; index += 1) {
    // Check whether this group is a letter-match for the candidate word
    if (candidateMatchesGroup(groups[index], word)) {
      return index;
    }
  }

  // No existing group matched the candidate
  return -1;
}

// Groups words by scanning existing groups for a letter match on each word.
// Less efficient than groupBySortKey because it compares letters directly
// instead of using a precomputed key.
function groupByLetterScan(words: string[]): WordGroup[] {
  // Accumulates the groups as we process each word
  const groups: WordGroup[] = [];

  for (const word of words) {
    // Search existing groups for one whose letters match this word
    const matchIndex = findMatchingGroupIndex(groups, word);

    if (matchIndex >= 0) {
      // A matching group was found — add the word to it
      groups[matchIndex].push(word);
    } else {
      // No match found — start a new group with this word as its first member
      groups.push([word]);
    }
  }

  return groups;
}

// Splits a comma-separated string into an array of trimmed, non-empty words
function tokenizeInput(input: string): string[] {
  return input
    .split(",") // divide on comma boundaries
    .map((word) => word.trim()) // strip leading and trailing whitespace from each token
    .filter((word) => word.length > 0); // discard tokens that were only whitespace
}

// Runs `fn` and records how many milliseconds it took to complete
function measureTime(fn: () => WordGroup[]): TimedResult {
  const start = performance.now(); // capture a high-resolution timestamp before the run
  const groups = fn(); // execute the algorithm
  const ms = performance.now() - start; // compute elapsed time in milliseconds
  return { groups, ms };
}

type AlgorithmColumnProps = {
  label: string;
  description: string;
  complexity: string;
  result: TimedResult;
  isFaster: boolean;
  visible: boolean;
  delay: number;
};

function AlgorithmColumn({
  label,
  description,
  complexity,
  result,
  isFaster,
  visible,
  delay,
}: AlgorithmColumnProps): JSX.Element {
  return (
    <div
      className="flex-1 min-w-0 transition-all duration-500"
      style={
        {
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(8px)",
          transitionDelay: `${delay}ms`,
        } as CSSProperties
      }
    >
      <>
        <div>
          <CardTitle className="text-sm">{label}</CardTitle>
          <CardDescription>{description}</CardDescription>
          <code className="text-xs text-muted-foreground">{complexity}</code>
        </div>
        <p className="flex flex-row-reverse gap-2 text-right shrink-0 items-center text-xs">
          <span className="font-mono">{result.ms}ms</span>
          {isFaster && <span className="block text-green-600/50 font-medium">faster</span>}
        </p>
      </>

      <div className="space-y-4">
        {result.groups.map((group, groupIndex) => (
          <Card key={groupIndex} variant="flat">
            <CardHeader className="text-xs text-muted-foreground uppercase tracking-wide">
              Group {groupIndex + 1}
            </CardHeader>
            <CardContent className="flex gap-2 flex-wrap mt-1">
              {group.map((word, wordIndex) => (
                <span key={wordIndex} className="px-2 py-1 border-b text-sm font-mono">
                  {word}
                </span>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

const RUN_DELAY_MS = 600;

export default function Anagrams(): JSX.Element {
  const [input, setInput] = useState("eat, tea, tan, ate, nat, bat");
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{ sort: TimedResult; manual: TimedResult } | null>(null);
  const [visible, setVisible] = useState(false);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setInput(event.target.value);
  };

  const compare = (): void => {
    setIsRunning(true);
    setVisible(false);
    setResults(null);

    setTimeout(() => {
      const words = tokenizeInput(input);
      setResults({
        sort: measureTime(() => groupBySortKey(words)),
        manual: measureTime(() => groupByLetterScan(words)),
      });
      setIsRunning(false);
    }, RUN_DELAY_MS);
  };

  useEffect(() => {
    if (results) {
      // Double rAF ensures the DOM has painted the opacity-0 state before transitioning to opacity-1
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    }
  }, [results]);

  const sortIsFaster = results ? results.sort.ms <= results.manual.ms : false;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-xl font-semibold">Anagrams</h2>
        <p className="text-muted-foreground">Group anagrams together from a list of words.</p>
        <i className="text-xs text-muted-foreground">Courtesy of ChartHop</i>
      </header>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Enter words separated by commas"
          className="flex-1"
        />
        <Button onClick={compare} disabled={isRunning} className="min-w-24 flex items-center gap-2">
          {isRunning ? (
            <>
              <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Running…
            </>
          ) : (
            "Compare"
          )}
        </Button>
      </div>

      {results && (
        <div className="flex gap-6 flex-col sm:flex-row">
          <AlgorithmColumn
            label="Sort Method"
            description="Sort each word's characters to create a canonical key."
            complexity="O(n · k log k)"
            result={results.sort}
            isFaster={sortIsFaster}
            visible={visible}
            delay={0}
          />
          <div className="w-px bg-border hidden sm:block" />
          <AlgorithmColumn
            label="Manual Method"
            description="For each word, scan existing groups to find a letter match."
            complexity="O(n² · k)"
            result={results.manual}
            isFaster={!sortIsFaster}
            visible={visible}
            delay={150}
          />
        </div>
      )}
    </div>
  );
}
