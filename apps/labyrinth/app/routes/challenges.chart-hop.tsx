import { Button } from "@pontistudios/ui";
import { useState, type ChangeEvent, type JSX } from "react";

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
        <div className="flex gap-4 flex-wrap">
          {result.map((group, groupIndex) => (
            <div
              key={groupIndex}
              className="flex flex-col gap-2 p-3 border bg-secondary rounded min-w-30"
            >
              <strong>Group {groupIndex + 1}:</strong>
              <div className="flex gap-2 flex-wrap">
                {group.map((word, wordIndex) => (
                  <span key={wordIndex} className="p-2 bg-[white] rounded">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <details className="space-x-4">
        <summary className="cursor-pointer text-[#666]">About the Algorithms</summary>
        <div className="flex flex-col gap-3 text-[0.9rem] pt-2 pl-3">
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
