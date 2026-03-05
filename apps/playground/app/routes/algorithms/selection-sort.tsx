import { useState } from "react";
import { selectionSort } from "~/lib/algorithms/selection-sort";
import {
  PageHeader,
  PageSection,
  FormSection,
  InputField,
  ResultBox,
  InfoBox,
  DiffDisplay,
  CodeBlock,
} from "~/components/void-components";

export default function SelectionSortDemo() {
  const [arrayInput, setArrayInput] = useState("64,25,12,22,11");
  const [result, setResult] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const handleSort = () => {
    setIsLoading(true);
    setTimeout(() => {
      try {
        const arr = arrayInput.split(",").map((n) => parseInt(n.trim()));
        const sorted = selectionSort([...arr]);
        setResult({ original: arr, sorted });
      } catch (error) {
        setResult({ error: "INVALID INPUT" });
      }
      setIsLoading(false);
    }, 100);
  };

  const handleReset = () => {
    setResult(undefined);
    setArrayInput("64,25,12,22,11");
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-12">
        <PageHeader
          title="Selection Sort"
          description="A sorting algorithm that divides the array into sorted and unsorted regions"
        />

        <PageSection title="How It Works">
          <ol className="text-sm text-white/80 space-y-2 list-decimal list-inside font-mono">
            <li>Find the minimum element in the unsorted region</li>
            <li>Swap it with the first element of the unsorted region</li>
            <li>Move the boundary between sorted and unsorted regions one element right</li>
            <li>Repeat until the entire array is sorted</li>
          </ol>
        </PageSection>

        <PageSection title="Complexity Analysis">
          <InfoBox>
            <div className="space-y-1 font-mono text-sm">
              <p>
                <strong>TIME COMPLEXITY:</strong> O(N²)
              </p>
              <p>
                <strong>SPACE COMPLEXITY:</strong> O(1)
              </p>
            </div>
          </InfoBox>
        </PageSection>

        <PageSection title="Interactive Demo">
          <FormSection onSubmit={handleSort} isLoading={isLoading}>
            <InputField
              label="Array to Sort (comma-separated numbers)"
              value={arrayInput}
              onChange={setArrayInput}
              placeholder="64,25,12,22,11"
            />
          </FormSection>

          {result && !result.error && (
            <ResultBox label="SORTED RESULT" state="success">
              <DiffDisplay
                before={`[${result.original.join(", ")}]`}
                after={`[${result.sorted.join(", ")}]`}
                beforeLabel="ORIGINAL"
                afterLabel="SORTED"
              />
            </ResultBox>
          )}

          {result?.error && (
            <ResultBox label="ERROR" state="error">
              <div className="font-mono text-sm text-white/80">{result.error}</div>
            </ResultBox>
          )}

          {result && (
            <button
              onClick={handleReset}
              className="text-xs font-mono uppercase tracking-widest border border-white/20 text-white/80 px-4 py-2 hover:bg-white/5 hover:border-white/40 transition-all duration-100 cursor-crosshair"
            >
              Reset
            </button>
          )}
        </PageSection>

        <PageSection title="Algorithm Visualization">
          <CodeBlock>
            {`PASS 1: 64  25  12  22  11
        ↑min=11, swap with 64
        11  25  12  22  64

PASS 2: 11  25  12  22  64
              ↑min=12, swap with 25
        11  12  25  22  64

PASS 3: 11  12  25  22  64
                    ↑min=22, swap with 25
        11  12  22  25  64

RESULT: [11, 12, 22, 25, 64]`}
          </CodeBlock>
        </PageSection>
      </div>
    </div>
  );
}
