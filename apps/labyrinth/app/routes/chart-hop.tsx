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
        style={{
          width: "100%",
          padding: "0.5rem",
          marginBottom: "0.5rem",
          fontFamily: "monospace",
        }}
      />

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button className="btn btn-primary" onClick={runEfficient}>
          Group (Sort Method)
        </button>
        <button className="btn" onClick={runManual}>
          Group (Manual)
        </button>
      </div>

      {result && (
        <div>
          <h4>Results:</h4>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {result.map((group, groupIndex) => (
              <div
                key={groupIndex}
                style={{
                  padding: "0.75rem",
                  background: "#f0f0f0",
                  borderRadius: "4px",
                  minWidth: "120px",
                }}
              >
                <strong>Group {groupIndex + 1}:</strong>
                <div
                  style={{
                    display: "flex",
                    gap: "0.25rem",
                    flexWrap: "wrap",
                    marginTop: "0.25rem",
                  }}
                >
                  {group.map((word, wordIndex) => (
                    <span
                      key={wordIndex}
                      style={{
                        padding: "0.125rem 0.375rem",
                        background: "white",
                        borderRadius: "2px",
                        marginTop: "0.25rem",
                      }}
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

      <details style={{ marginTop: "1rem" }}>
        <summary style={{ cursor: "pointer", color: "#666" }}>About the Algorithms</summary>
        <div
          style={{
            marginTop: "0.5rem",
            padding: "0.75rem",
            background: "#fafafa",
            borderRadius: "4px",
            fontSize: "0.9rem",
          }}
        >
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