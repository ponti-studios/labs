import { useState, type ChangeEvent, type JSX } from "react";
import { Button } from "@pontistudios/ui";

type AnagramGroup = string[];

function groupAnagrams(words: string[]): AnagramGroup[] {
  const groups = new Map<string, AnagramGroup>();

  for (const word of words) {
    const sorted = word.split("").sort().join("");
    const existingGroup = groups.get(sorted);

    if (existingGroup) {
      existingGroup.push(word);
      continue;
    }

    groups.set(sorted, [word]);
  }

  return Array.from(groups.values());
}

function checkAllLetters(group: AnagramGroup, word: string): boolean {
  if (group.length === 0) {
    return false;
  }

  const [firstWord] = group;
  if (firstWord.length !== word.length) {
    return false;
  }

  return word.split("").every((letter) => firstWord.includes(letter));
}

function getAnagramArrayIndex(results: AnagramGroup[], word: string): number {
  for (let index = 0; index < results.length; index += 1) {
    if (checkAllLetters(results[index], word)) {
      return index;
    }
  }

  return -1;
}

function anagramer(initialWords: string[]): AnagramGroup[] {
  const results: AnagramGroup[] = [];

  for (const word of initialWords) {
    const groupIndex = getAnagramArrayIndex(results, word);
    if (groupIndex >= 0) {
      results[groupIndex].push(word);
    } else {
      results.push([word]);
    }
  }

  return results;
}

function parseWords(input: string): string[] {
  return input
    .split(",")
    .map((word) => word.trim())
    .filter((word) => word.length > 0);
}

export default function ChartHop(): JSX.Element {
  const [input, setInput] = useState("eat, tea, tan, ate, nat, bat");
  const [result, setResult] = useState<AnagramGroup[] | null>(null);

  const runEfficient = (): void => {
    setResult(groupAnagrams(parseWords(input)));
  };

  const runManual = (): void => {
    setResult(anagramer(parseWords(input)));
  };

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    setInput(event.target.value);
  };

  return (
    <div>
      <h2>ChartHop - Anagrams</h2>
      <p>Group anagrams together from a list of words.</p>

      <textarea
        value={input}
        onChange={handleInputChange}
        placeholder="Enter words separated by commas"
        rows={3}
        className="w-full p-2 mb-2 font-mono"
      />

      <div className="flex gap-2 mb-4">
        <Button className="btn btn-primary" onClick={runEfficient}>
          Group (Sort Method)
        </Button>
        <Button className="btn" onClick={runManual}>
          Group (Manual)
        </Button>
      </div>

      {result && (
        <div>
          <h4>Results:</h4>
          <div className="flex gap-4 flex-wrap">
            {result.map((group, groupIndex) => (
              <div key={groupIndex} className="p-3 bg-[#f0f0f0] rounded-md min-w-[120px]">
                <strong>Group {groupIndex + 1}:</strong>
                <div className="flex gap-1 flex-wrap mt-1">
                  {group.map((word, wordIndex) => (
                    <span
                      key={wordIndex}
                      className="p-[0.125rem 0.375rem] bg-[white] rounded-[2px] mt-1"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <details className="mt-4">
        <summary className="cursor-pointer text-[#666]">About the Algorithms</summary>
        <div className="mt-2 p-3 bg-[#fafafa] rounded-[4px] text-[0.9rem]">
          <p>
            <strong>Sort Method:</strong> Sort each word&apos;s characters to create a key. Words
            with the same sorted key are anagrams.
          </p>
          <p>
            <strong>Manual Method:</strong> For each word, check if it shares all letters with
            existing groups.
          </p>
        </div>
      </details>
    </div>
  );
}
