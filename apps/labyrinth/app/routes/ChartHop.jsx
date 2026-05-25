import { useState } from "react";

function groupAnagrams(words) {
  const groups = new Map();

  for (const word of words) {
    const sorted = word.split("").sort().join("");
    if (!groups.has(sorted)) {
      groups.set(sorted, []);
    }
    groups.get(sorted).push(word);
  }

  return Array.from(groups.values());
}

function checkAllLetters(arr, word) {
  if (arr.length === 0) return false;
  const firstWord = arr[0];
  if (firstWord.length !== word.length) return false;

  return word.split("").every((letter) => firstWord.includes(letter));
}

function getAnagramArrayIndex(results, word) {
  for (let i = 0; i < results.length; i++) {
    if (checkAllLetters(results[i], word)) return i;
  }
  return -1;
}

function anagramer(initial) {
  const results = [];

  for (const word of initial) {
    const index = getAnagramArrayIndex(results, word);
    if (index >= 0) {
      results[index].push(word);
    } else {
      results.push([word]);
    }
  }

  return results;
}

export default function ChartHop() {
  const [input, setInput] = useState("eat, tea, tan, ate, nat, bat");
  const [result, setResult] = useState(null);

  const runEfficient = () => {
    const words = input
      .split(",")
      .map((w) => w.trim())
      .filter((w) => w.length > 0);
    setResult(groupAnagrams(words));
  };

  const runManual = () => {
    const words = input
      .split(",")
      .map((w) => w.trim())
      .filter((w) => w.length > 0);
    setResult(anagramer(words));
  };

  return (
    <div>
      <h2>ChartHop - Anagrams</h2>
      <p>Group anagrams together from a list of words.</p>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
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
            {result.map((group, i) => (
              <div
                key={i}
                style={{
                  padding: "0.75rem",
                  background: "#f0f0f0",
                  borderRadius: "4px",
                  minWidth: "120px",
                }}
              >
                <strong>Group {i + 1}:</strong>
                <div
                  style={{
                    display: "flex",
                    gap: "0.25rem",
                    flexWrap: "wrap",
                    marginTop: "0.25rem",
                  }}
                >
                  {group.map((word, j) => (
                    <span
                      key={j}
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
