import { useState } from "react";
import { binarySearch } from "~/lib/algorithms/binary-search";
import {
  PageHeader,
  PageSection,
  FormSection,
  InputField,
  ResultBox,
  InfoBox,
  CodeBlock,
} from "~/components/void-components";

export default function BinarySearchDemo() {
  const [target, setTarget] = useState("42");
  const [result, setResult] = useState<number | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = () => {
    setIsLoading(true);
    // Simulate async operation
    setTimeout(() => {
      const arr = Array.from({ length: 101 }, (_, i) => i);
      const res = binarySearch(parseInt(target) || 0, arr);
      setResult(res);
      setIsLoading(false);
    }, 100);
  };

  const handleReset = () => {
    setResult(undefined);
    setTarget("42");
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-12">
        <PageHeader
          title="Binary Search"
          description="An efficient algorithm for finding a target value in a sorted array"
        />

        <PageSection title="How It Works">
          <ol className="text-sm text-white/80 space-y-2 list-decimal list-inside font-mono">
            <li>Start with min = 0, max = array length - 1</li>
            <li>Calculate guess as the midpoint (min + max) / 2</li>
            <li>Compare array[guess] with target</li>
            <li>If equal, found! Otherwise adjust min or max</li>
            <li>Repeat until found or range is empty</li>
          </ol>
        </PageSection>

        <PageSection title="Complexity Analysis">
          <InfoBox>
            <div className="space-y-1 font-mono text-sm">
              <p>
                <strong>TIME COMPLEXITY:</strong> O(LOG N)
              </p>
              <p>
                <strong>SPACE COMPLEXITY:</strong> O(1)
              </p>
            </div>
          </InfoBox>
        </PageSection>

        <PageSection title="Interactive Demo">
          <FormSection onSubmit={handleSearch} isLoading={isLoading}>
            <InputField
              label="Search for (0-100)"
              type="number"
              value={target}
              onChange={setTarget}
              placeholder="Enter a number"
            />
          </FormSection>

          {result !== undefined && (
            <ResultBox label="RESULT" state={result !== null ? "success" : "error"}>
              <div className="font-mono text-sm text-white/80">
                {result !== null ? `[✓] FOUND AT INDEX: ${result}` : "[✗] VALUE NOT FOUND IN ARRAY"}
              </div>
            </ResultBox>
          )}

          {result !== undefined && (
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
            {`ARRAY: [0, 1, 2, ..., 100]
TARGET: ${target || "?"}

STEP 1: min=0, max=100
        guess=(0+100)/2=50
        arr[50]=50 > ${target} → search left half

STEP 2: min=0, max=49
        guess=(0+49)/2=24
        arr[24]=24 < ${target} → search right half

STEP 3: min=25, max=49
        ...continue until found`}
          </CodeBlock>
        </PageSection>
      </div>
    </div>
  );
}
