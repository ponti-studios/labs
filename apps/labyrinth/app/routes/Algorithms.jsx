import { useState } from "react";

function swap(arr, i, j) {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

function selectionSort(arr) {
  const steps = [];
  const array = [...arr];
  for (let i = 0; i < array.length; i++) {
    let minIdx = i;
    for (let j = i + 1; j < array.length; j++) {
      if (array[j] < array[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      swap(array, i, minIdx);
      steps.push([...array]);
    }
  }
  return steps;
}

function insertionSort(arr) {
  const steps = [];
  const array = [...arr];
  for (let i = 1; i < array.length; i++) {
    let j = i;
    while (j > 0 && array[j - 1] > array[j]) {
      swap(array, j - 1, j);
      steps.push([...array]);
      j--;
    }
  }
  return steps;
}

function binarySearch(arr, target) {
  const steps = [];
  let min = 0, max = arr.length - 1;
  while (max >= min) {
    const guess = Math.floor((min + max) / 2);
    steps.push({ guess, range: [min, max], array: [...arr] });
    if (arr[guess] === target) return { found: true, steps, index: guess };
    if (arr[guess] < target) min = guess + 1;
    else max = guess - 1;
  }
  return { found: false, steps, index: -1 };
}

function linearSearch(arr, target) {
  const steps = [];
  for (let i = 0; i < arr.length; i++) {
    steps.push({ index: i, found: arr[i] === target });
    if (arr[i] === target) return { found: true, steps, index: i };
  }
  return { found: false, steps, index: -1 };
}

function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) return [map.get(diff), i];
    map.set(nums[i], i);
  }
  return null;
}

function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

class Stack {
  items = {};
  count = 0;
  push(item) { this.items[this.count++] = item; }
  pop() { if (this.count === 0) return undefined; const item = this.items[--this.count]; delete this.items[this.count]; return item; }
  peek() { return this.items[0]; }
  length() { return this.count; }
}

function isPalindrome(word) {
  const letters = new Stack();
  word.split("").forEach(l => letters.push(l));
  let test = "";
  for (let i = 0; i < word.length; i++) test += letters.pop();
  return test === word;
}

export default function Algorithms() {
  const [input, setInput] = useState("5, 3, 8, 1, 9, 2, 7, 4, 6");
  const [target, setTarget] = useState("7");
  const [word, setWord] = useState("racecar");
  const [sortSteps, setSortSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [searchResult, setSearchResult] = useState(null);
  const [twoSumResult, setTwoSumResult] = useState(null);
  const [factResult, setFactResult] = useState(null);
  const [fibResult, setFibResult] = useState(null);
  const [palindromeResult, setPalindromeResult] = useState(null);

  const runSelectionSort = () => {
    const arr = input.split(",").map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    const steps = selectionSort(arr);
    setSortSteps(steps);
    setCurrentStep(-1);
    setSearchResult(null);
  };

  const runInsertionSort = () => {
    const arr = input.split(",").map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    const steps = insertionSort(arr);
    setSortSteps(steps);
    setCurrentStep(-1);
    setSearchResult(null);
  };

  const runBinarySearch = () => {
    const arr = input.split(",").map(n => parseInt(n.trim())).filter(n => !isNaN(n)).sort((a, b) => a - b);
    const t = parseInt(target);
    const result = binarySearch(arr, t);
    setSearchResult({ ...result, sortedArray: arr });
    setSortSteps([]);
    setCurrentStep(-1);
  };

  const runLinearSearch = () => {
    const arr = input.split(",").map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    const t = parseInt(target);
    const result = linearSearch(arr, t);
    setSearchResult(result);
    setSortSteps([]);
    setCurrentStep(-1);
  };

  const runTwoSum = () => {
    const arr = input.split(",").map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    const t = parseInt(target);
    setTwoSumResult(twoSum(arr, t));
  };

  const runFactorial = () => {
    const n = parseInt(target);
    setFactResult(factorial(n));
  };

  const runFibonacci = () => {
    const n = parseInt(target);
    setFibResult(fibonacci(n));
  };

  const runPalindrome = () => {
    setPalindromeResult(isPalindrome(word));
  };

  const currentArray = currentStep === -1
    ? input.split(",").map(n => parseInt(n.trim())).filter(n => !isNaN(n))
    : sortSteps[currentStep];

  return (
    <div>
      <h2>Algorithms</h2>
      <p>Interactive demos of classic algorithms and data structures.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "1rem" }}>
        <div>
          <h3>Sorting</h3>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Array (comma separated)"
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
          />
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button className="btn" onClick={runSelectionSort}>Selection Sort</button>
            <button className="btn" onClick={runInsertionSort}>Insertion Sort</button>
          </div>
          {sortSteps.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <p>Steps: {currentStep + 1} / {sortSteps.length}</p>
              <div style={{ display: "flex", gap: "0.25rem", alignItems: "center", flexWrap: "wrap" }}>
                {currentArray.map((n, i) => (
                  <div key={i} style={{
                    width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid #333", background: "#f0f0f0", fontWeight: "bold"
                  }}>{n}</div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button className="btn" onClick={() => setCurrentStep(Math.max(-1, currentStep - 1))} disabled={currentStep === -1}>Prev</button>
                <button className="btn" onClick={() => setCurrentStep(Math.min(sortSteps.length - 1, currentStep + 1))} disabled={currentStep === sortSteps.length - 1}>Next</button>
              </div>
            </div>
          )}
        </div>

        <div>
          <h3>Searching</h3>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Array (comma separated)"
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
          />
          <input
            type="text"
            value={target}
            onChange={e => setTarget(e.target.value)}
            placeholder="Target"
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
          />
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button className="btn" onClick={runBinarySearch}>Binary Search</button>
            <button className="btn" onClick={runLinearSearch}>Linear Search</button>
          </div>
          {searchResult && (
            <div style={{ marginTop: "1rem", padding: "1rem", background: "#f0f0f0", borderRadius: "4px" }}>
              <p><strong>Result:</strong> {searchResult.found ? `Found at index ${searchResult.index}` : "Not found"}</p>
              {searchResult.sortedArray && (
                <p><strong>Sorted array:</strong> {searchResult.sortedArray.join(", ")}</p>
              )}
              {searchResult.steps && searchResult.steps.length > 0 && (
                <details>
                  <summary>Steps ({searchResult.steps.length})</summary>
                  {searchResult.steps.map((step, i) => (
                    <div key={i} style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                      {step.guess !== undefined ? `Guess: ${step.guess} (range: ${step.range?.[0]}-${step.range?.[1]})` : `Checking index ${step.index}...`}
                    </div>
                  ))}
                </details>
              )}
            </div>
          )}
        </div>

        <div>
          <h3>Two Sum</h3>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Array (comma separated)"
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
          />
          <input
            type="text"
            value={target}
            onChange={e => setTarget(e.target.value)}
            placeholder="Target"
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
          />
          <button className="btn" onClick={runTwoSum}>Find Pair</button>
          {twoSumResult && (
            <p style={{ marginTop: "0.5rem" }}>Indices: [{twoSumResult[0]}, {twoSumResult[1]}]</p>
          )}
        </div>

        <div>
          <h3>Recursion</h3>
          <input
            type="text"
            value={target}
            onChange={e => setTarget(e.target.value)}
            placeholder="Number"
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
          />
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button className="btn" onClick={runFactorial}>Factorial</button>
            <button className="btn" onClick={runFibonacci}>Fibonacci</button>
          </div>
          {factResult !== null && <p style={{ marginTop: "0.5rem" }}>{target}! = {factResult}</p>}
          {fibResult !== null && <p style={{ marginTop: "0.5rem" }}>F({target}) = {fibResult}</p>}
        </div>

        <div>
          <h3>Data Structures</h3>
          <input
            type="text"
            value={word}
            onChange={e => setWord(e.target.value)}
            placeholder="Word to check"
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
          />
          <button className="btn" onClick={runPalindrome}>Check Palindrome (Stack)</button>
          {palindromeResult !== null && (
            <p style={{ marginTop: "0.5rem" }}>"{word}" is {palindromeResult ? "a palindrome" : "not a palindrome"}</p>
          )}
        </div>
      </div>
    </div>
  );
}
