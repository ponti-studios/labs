import { useState, useCallback, type JSX } from "react";
import { Button } from "@pontistudios/ui";
import { Trash2, Plus } from "lucide-react";

interface ContextBlock {
  id: string;
  label: string;
  content: string;
  author: "system" | "user";
}

interface PredictionState {
  isLoading: boolean;
  output: string;
  error?: string;
}

const DEFAULT_BLOCKS: ContextBlock[] = [
  {
    id: "1",
    label: "System Instruction",
    content:
      "You are a JavaScript code generator. Write clean, readable functions using modern ES6+ syntax.",
    author: "system",
  },
  {
    id: "2",
    label: "Example 1: Declarative Style",
    content: `Example task: Write a function that filters even numbers
// Output:
const filterEven = (numbers) => numbers.filter(n => n % 2 === 0);`,
    author: "user",
  },
  {
    id: "3",
    label: "Example 2: Declarative Style",
    content: `Example task: Write a function that sums an array
// Output:
const sum = (numbers) => numbers.reduce((acc, n) => acc + n, 0);`,
    author: "user",
  },
  {
    id: "4",
    label: "Current Task",
    content: `Write a function that finds the maximum value in an array`,
    author: "user",
  },
];

function buildFullContext(blocks: ContextBlock[]): string {
  return blocks.map((b) => b.content).join("\n\n");
}

export default function ExperimentsLlmInterface(): JSX.Element {
  const [blocks, setBlocks] = useState<ContextBlock[]>(DEFAULT_BLOCKS);
  const [prediction, setPrediction] = useState<PredictionState>({
    isLoading: false,
    output: "",
  });

  const handleUpdateBlock = useCallback((id: string, content: string) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content } : b)));
  }, []);

  const handleDeleteBlock = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const handleAddBlock = useCallback(() => {
    const newId = String(Date.now());
    setBlocks((prev) => [
      ...prev,
      {
        id: newId,
        label: "New Block",
        content: "",
        author: "user",
      },
    ]);
  }, []);

  const handlePredict = useCallback(async () => {
    setPrediction({ isLoading: true, output: "" });
    try {
      const response = await fetch("/api/gen/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: buildFullContext(blocks) }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      setPrediction({ isLoading: false, output: data.output });
    } catch (error) {
      setPrediction({
        isLoading: false,
        output: "",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }, [blocks]);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto p-6">
      <header>
        <h1 className="text-2xl font-bold mb-2">Context Window as Data</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Edit the blocks on the left to see how context changes token prediction. Notice how the
          LLM is not "understanding" your changes — it's predicting the next tokens based on the
          statistical weight of all text in the context window.
        </p>
        <p className="text-xs text-muted-foreground italic">
          The chat interface hides this by making messages immutable. This interface treats the
          entire context as editable data.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-6">
        {/* Left: Context Blocks */}
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold">Context Window (Editable)</h2>
          <div className="flex flex-col gap-3 max-h-150 overflow-y-auto">
            {blocks.map((block) => (
              <div
                key={block.id}
                className="border border-border rounded-lg p-4 bg-background flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground uppercase">
                      {block.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {block.author === "system" ? "System" : "User added"}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteBlock(block.id)}
                    className="p-1 hover:bg-muted rounded transition-colors"
                    title="Delete block"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={block.content}
                  onChange={(e) => handleUpdateBlock(block.id, e.target.value)}
                  className="text-sm bg-muted rounded p-2 font-mono resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  rows={4}
                />
              </div>
            ))}
          </div>
          <Button onClick={handleAddBlock} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Block
          </Button>
          <Button onClick={handlePredict} disabled={prediction.isLoading} className="w-full">
            {prediction.isLoading ? "Predicting..." : "Predict Next Tokens"}
          </Button>
        </div>

        {/* Right: Output */}
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold">LLM Output</h2>
          <div className="border border-border rounded-lg p-4 bg-muted flex-1 min-h-100 overflow-y-auto">
            {prediction.error ? (
              <div className="text-sm text-red-600">{prediction.error}</div>
            ) : prediction.output ? (
              <pre className="text-sm whitespace-pre-wrap font-mono">{prediction.output}</pre>
            ) : (
              <div className="text-sm text-muted-foreground italic">
                Click "Predict Next Tokens" to generate output based on the context above.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
