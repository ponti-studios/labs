import { useState } from "react";
import { swap, functionalSwap } from "~/lib/problems/swap";
import {
  PageHeader,
  PageSection,
  FormSection,
  InputField,
  ResultBox,
  CodeBlock,
  GridSection,
  DiffDisplay,
} from "~/components/void-components";

export default function SwapRoute() {
  const [array, setArray] = useState("1,2,3");
  const [firstIndex, setFirstIndex] = useState("0");
  const [secondIndex, setSecondIndex] = useState("2");
  const [result, setResult] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const handleSwap = () => {
    setIsLoading(true);
    setTimeout(() => {
      try {
        const arr = array.split(",").map((n) => {
          const trimmed = n.trim();
          return isNaN(parseInt(trimmed)) ? trimmed : parseInt(trimmed);
        });
        const res = swap([...arr], parseInt(firstIndex) || 0, parseInt(secondIndex) || 0);
        setResult(res);
      } catch (error) {
        setResult(null);
      }
      setIsLoading(false);
    }, 100);
  };

  const handleReset = () => {
    setResult(undefined);
    setArray("1,2,3");
    setFirstIndex("0");
    setSecondIndex("2");
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-12">
        <PageHeader
          title="Swap Array Elements"
          description="Learn different approaches to swapping elements in an array"
        />

        <PageSection title="Swap Approaches">
          <GridSection cols={1} gap="lg">
            <div className="border border-white/20 bg-white/2 p-6 space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-widest text-white/80">
                [1] BROKEN APPROACH
              </h4>
              <CodeBlock>{`array[i] = array[j];
array[j] = array[i]; // WRONG! VALUE ALREADY OVERWRITTEN`}</CodeBlock>
            </div>

            <div className="border border-white/20 bg-white/3 p-6 space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-widest text-white/90">
                [2] STANDARD APPROACH
              </h4>
              <CodeBlock>{`const temp = array[i];
array[i] = array[j];
array[j] = temp;`}</CodeBlock>
            </div>

            <div className="border border-white/20 bg-white/2 p-6 space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-widest text-white/80">
                [3] FUNCTIONAL APPROACH
              </h4>
              <CodeBlock>{`array.reduce((acc, val, idx) => { ... })`}</CodeBlock>
              <p className="text-xs text-white/60">IMMUTABLE - DOESN'T MODIFY ORIGINAL ARRAY</p>
            </div>
          </GridSection>
        </PageSection>

        <PageSection title="Interactive Swapper">
          <FormSection onSubmit={handleSwap} isLoading={isLoading}>
            <InputField
              label="Array (comma-separated)"
              value={array}
              onChange={setArray}
              placeholder="1,2,3"
            />
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="First Index"
                type="number"
                value={firstIndex}
                onChange={setFirstIndex}
              />
              <InputField
                label="Second Index"
                type="number"
                value={secondIndex}
                onChange={setSecondIndex}
              />
            </div>
          </FormSection>

          {result !== undefined && (
            <ResultBox label="RESULT" state={result ? "success" : "error"}>
              <div className="font-mono text-sm text-white/80">[{result?.join(", ")}]</div>
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
      </div>
    </div>
  );
}
