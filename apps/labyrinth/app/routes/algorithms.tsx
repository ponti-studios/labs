import { useState, type ChangeEvent, type JSX } from "react";

type SortStep = number[];
type Range = [number, number];
type TwoSumResult = [number, number] | null;

interface BinarySearchStep {
  array: number[];
  guess: number;
  range: Range;
}

interface LinearSearchStep {
  found: boolean;
  index: number;
}

type SearchStep = BinarySearchStep | LinearSearchStep;

interface SearchResult {
  found: boolean;
  index: number;
  steps: SearchStep[];
  sortedArray?: number[];
}

function parseNumberList(input: string): number[] {
  return input
    .split(",")
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => !Number.isNaN(value));
}

function swap(values: number[], fromIndex: number, toIndex: number): void {
  const temp = values[fromIndex];
  values[fromIndex] = values[toIndex];
  values[toIndex] = temp;
}

function selectionSort(values: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const array = [...values];

  for (let index = 0; index < array.length; index += 1) {
    let minIndex = index;
    for (let comparisonIndex = index + 1; comparisonIndex < array.length; comparisonIndex += 1) {
      if (array[comparisonIndex] < array[minIndex]) {
        minIndex = comparisonIndex;
      }
    }

    if (minIndex !== index) {
      swap(array, index, minIndex);
      steps.push([...array]);
    }
  }

  return steps;
}

function insertionSort(values: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const array = [...values];

  for (let index = 1; index < array.length; index += 1) {
    let currentIndex = index;
    while (currentIndex > 0 && array[currentIndex - 1] > array[currentIndex]) {
      swap(array, currentIndex - 1, currentIndex);
      steps.push([...array]);
      currentIndex -= 1;
    }
  }

  return steps;
}

function binarySearch(values: number[], target: number): SearchResult {
  const steps: BinarySearchStep[] = [];
  let min = 0;
  let max = values.length - 1;

  while (max >= min) {
    const guess = Math.floor((min + max) / 2);
    steps.push({ guess, range: [min, max], array: [...values] });

    if (values[guess] === target) {
      return { found: true, index: guess, steps };
    }

    if (values[guess] < target) {
      min = guess + 1;
    } else {
      max = guess - 1;
    }
  }

  return { found: false, index: -1, steps };
}

function linearSearch(values: number[], target: number): SearchResult {
  const steps: LinearSearchStep[] = [];

  for (let index = 0; index < values.length; index += 1) {
    const found = values[index] === target;
    steps.push({ found, index });
    if (found) {
      return { found: true, index, steps };
    }
  }

  return { found: false, index: -1, steps };
}

function twoSum(values: number[], target: number): TwoSumResult {
  const indicesByValue = new Map<number, number>();

  for (let index = 0; index < values.length; index += 1) {
    const difference = target - values[index];
    const matchingIndex = indicesByValue.get(difference);
    if (matchingIndex !== undefined) {
      return [matchingIndex, index];
    }

    indicesByValue.set(values[index], index);
  }

  return null;
}

function factorial(value: number): number {
  if (value <= 1) {
    return 1;
  }

  return value * factorial(value - 1);
}

function fibonacci(value: number): number {
  if (value <= 1) {
    return value;
  }

  return fibonacci(value - 1) + fibonacci(value - 2);
}

class Stack<T> {
  private readonly items: Record<number, T> = {};

  private count = 0;

  push(item: T): void {
    this.items[this.count] = item;
    this.count += 1;
  }

  pop(): T | undefined {
    if (this.count === 0) {
      return undefined;
    }

    this.count -= 1;
    const item = this.items[this.count];
    delete this.items[this.count];
    return item;
  }
}

function isPalindrome(word: string): boolean {
  const letters = new Stack<string>();
  word.split("").forEach((letter) => letters.push(letter));

  let reversedWord = "";
  for (let index = 0; index < word.length; index += 1) {
    reversedWord += letters.pop() ?? "";
  }

  return reversedWord === word;
}

function isBinarySearchStep(step: SearchStep): step is BinarySearchStep {
  return "guess" in step;
}

export default function Algorithms(): JSX.Element {
  const [input, setInput] = useState("5, 3, 8, 1, 9, 2, 7, 4, 6");
  const [target, setTarget] = useState("7");
  const [word, setWord] = useState("racecar");
  const [sortSteps, setSortSteps] = useState<SortStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [twoSumResult, setTwoSumResult] = useState<TwoSumResult>(null);
  const [factResult, setFactResult] = useState<number | null>(null);
  const [fibResult, setFibResult] = useState<number | null>(null);
  const [palindromeResult, setPalindromeResult] = useState<boolean | null>(null);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setInput(event.target.value);
  };

  const handleTargetChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setTarget(event.target.value);
  };

  const handleWordChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setWord(event.target.value);
  };

  const runSelectionSort = (): void => {
    const steps = selectionSort(parseNumberList(input));
    setSortSteps(steps);
    setCurrentStep(-1);
    setSearchResult(null);
  };

  const runInsertionSort = (): void => {
    const steps = insertionSort(parseNumberList(input));
    setSortSteps(steps);
    setCurrentStep(-1);
    setSearchResult(null);
  };

  const runBinarySearch = (): void => {
    const sortedArray = parseNumberList(input).sort((left, right) => left - right);
    const parsedTarget = Number.parseInt(target, 10);
    const result = binarySearch(sortedArray, parsedTarget);
    setSearchResult({ ...result, sortedArray });
    setSortSteps([]);
    setCurrentStep(-1);
  };

  const runLinearSearch = (): void => {
    const result = linearSearch(parseNumberList(input), Number.parseInt(target, 10));
    setSearchResult(result);
    setSortSteps([]);
    setCurrentStep(-1);
  };

  const runTwoSum = (): void => {
    setTwoSumResult(twoSum(parseNumberList(input), Number.parseInt(target, 10)));
  };

  const runFactorial = (): void => {
    setFactResult(factorial(Number.parseInt(target, 10)));
  };

  const runFibonacci = (): void => {
    setFibResult(fibonacci(Number.parseInt(target, 10)));
  };

  const runPalindrome = (): void => {
    setPalindromeResult(isPalindrome(word));
  };

  const currentArray = currentStep === -1 ? parseNumberList(input) : sortSteps[currentStep];

  return (
    <div>
      <h2>Algorithms</h2>
      <p>Interactive demos of classic algorithms and data structures.</p>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "1rem" }}
      >
        <div>
          <h3>Sorting</h3>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Array (comma separated)"
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
          />
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button className="btn" onClick={runSelectionSort}>
              Selection Sort
            </button>
            <button className="btn" onClick={runInsertionSort}>
              Insertion Sort
            </button>
          </div>
          {sortSteps.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <p>
                Steps: {currentStep + 1} / {sortSteps.length}
              </p>
              <div
                style={{ display: "flex", gap: "0.25rem", alignItems: "center", flexWrap: "wrap" }}
              >
                {currentArray.map((value, index) => (
                  <div
                    key={index}
                    style={{
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid #333",
                      background: "#f0f0f0",
                      fontWeight: "bold",
                    }}
                  >
                    {value}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button
                  className="btn"
                  onClick={() => setCurrentStep(Math.max(-1, currentStep - 1))}
                  disabled={currentStep === -1}
                >
                  Prev
                </button>
                <button
                  className="btn"
                  onClick={() => setCurrentStep(Math.min(sortSteps.length - 1, currentStep + 1))}
                  disabled={currentStep === sortSteps.length - 1}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <h3>Searching</h3>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Array (comma separated)"
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
          />
          <input
            type="text"
            value={target}
            onChange={handleTargetChange}
            placeholder="Target"
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
          />
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button className="btn" onClick={runBinarySearch}>
              Binary Search
            </button>
            <button className="btn" onClick={runLinearSearch}>
              Linear Search
            </button>
          </div>
          {searchResult && (
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                background: "#f0f0f0",
                borderRadius: "4px",
              }}
            >
              <p>
                <strong>Result:</strong>{" "}
                {searchResult.found ? `Found at index ${searchResult.index}` : "Not found"}
              </p>
              {searchResult.sortedArray && (
                <p>
                  <strong>Sorted array:</strong> {searchResult.sortedArray.join(", ")}
                </p>
              )}
              {searchResult.steps.length > 0 && (
                <details>
                  <summary>Steps ({searchResult.steps.length})</summary>
                  {searchResult.steps.map((step, index) => (
                    <div key={index} style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                      {isBinarySearchStep(step)
                        ? `Guess: ${step.guess} (range: ${step.range[0]}-${step.range[1]})`
                        : `Checking index ${step.index}...`}
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
            onChange={handleInputChange}
            placeholder="Array (comma separated)"
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
          />
          <input
            type="text"
            value={target}
            onChange={handleTargetChange}
            placeholder="Target"
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
          />
          <button className="btn" onClick={runTwoSum}>
            Find Pair
          </button>
          {twoSumResult && (
            <p style={{ marginTop: "0.5rem" }}>
              Indices: [{twoSumResult[0]}, {twoSumResult[1]}]
            </p>
          )}
        </div>

        <div>
          <h3>Recursion</h3>
          <input
            type="text"
            value={target}
            onChange={handleTargetChange}
            placeholder="Number"
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
          />
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button className="btn" onClick={runFactorial}>
              Factorial
            </button>
            <button className="btn" onClick={runFibonacci}>
              Fibonacci
            </button>
          </div>
          {factResult !== null && (
            <p style={{ marginTop: "0.5rem" }}>
              {target}! = {factResult}
            </p>
          )}
          {fibResult !== null && (
            <p style={{ marginTop: "0.5rem" }}>
              F({target}) = {fibResult}
            </p>
          )}
        </div>

        <div>
          <h3>Data Structures</h3>
          <input
            type="text"
            value={word}
            onChange={handleWordChange}
            placeholder="Word to check"
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
          />
          <button className="btn" onClick={runPalindrome}>
            Check Palindrome (Stack)
          </button>
          {palindromeResult !== null && (
            <p style={{ marginTop: "0.5rem" }}>
              "{word}" is {palindromeResult ? "a palindrome" : "not a palindrome"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}