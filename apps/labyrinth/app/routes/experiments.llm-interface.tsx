import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@pontistudios/ui";
import {
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  HelpCircle,
  Loader2,
  LucideColumns2,
  Plus,
  Trash2,
} from "lucide-react";
import { useCallback, useMemo, useState, type JSX } from "react";

interface ContextBlock {
  id: string;
  label: string;
  content: string;
  author: "system" | "user" | "assistant";
  enabled: boolean;
}

const DEFAULT_BLOCKS_A: ContextBlock[] = [
  {
    id: "sys-a",
    label: "System",
    content: "You are a helpful travel assistant. Be concise and practical.",
    author: "system",
    enabled: true,
  },
  {
    id: "prev-a",
    label: "Previous Turn",
    content: `User: I'm planning a trip to Portland for the weekend. What should I do?
Assistant: Great choice! Portland has excellent food and outdoor activities. For a weekend, I'd suggest: Saturday morning at Powell's Books, lunch at a food cart pod, afternoon hiking in Forest Park, and dinner in the Pearl District.`,
    author: "assistant",
    enabled: true,
  },
  {
    id: "curr-a",
    label: "Current Input",
    content: "User: Where should I stay that's near good food but quiet at night?\nAssistant:",
    author: "user",
    enabled: true,
  },
];

const DEFAULT_BLOCKS_B: ContextBlock[] = [
  {
    id: "sys-b",
    label: "System",
    content: "You are a sarcastic, unhelpful travel assistant. Complain about everything.",
    author: "system",
    enabled: true,
  },
  {
    id: "prev-b",
    label: "Previous Turn",
    content: `User: I'm planning a trip to Portland for the weekend. What should I do?
Assistant: Great choice! Portland has excellent food and outdoor activities. For a weekend, I'd suggest: Saturday morning at Powell's Books, lunch at a food cart pod, afternoon hiking in Forest Park, and dinner in the Pearl District.`,
    author: "assistant",
    enabled: true,
  },
  {
    id: "curr-b",
    label: "Current Input",
    content: "User: Where should I stay that's near good food but quiet at night?\nAssistant:",
    author: "user",
    enabled: true,
  },
];

function buildFullContext(blocks: ContextBlock[]): string {
  return blocks
    .filter((b) => b.enabled)
    .map((b) => b.content)
    .join("\n\n");
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

const MAX_CONTEXT_TOKENS = 128000;

function ContextBlockCard({
  block,
  onUpdate,
  onDelete,
  onToggle,
  onMove,
  isFirst,
}: {
  block: ContextBlock;
  onUpdate: (content: string) => void;
  onDelete: () => void;
  onToggle: () => void;
  onMove: (direction: "up" | "down") => void;
  isFirst: boolean;
}) {
  const authorColors = {
    system: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100",
    user: "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100",
    assistant: "bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-100",
  };

  return (
    <div
      className={`border flex flex-col gap-2 rounded-lg border p-4 transition-opacity ${
        block.enabled ? "opacity-100" : "opacity-40"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onMove("up")}
            disabled={isFirst}
            className="hover:bg-muted rounded p-1 transition-colors disabled:opacity-30"
            title="Move up"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span
            className={`text-xs font-medium uppercase ${authorColors[block.author]} rounded px-2 py-0.5`}
          >
            {block.label}
          </span>
          <span className="text-muted-foreground text-xs">{block.author}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggle}
            className="hover:bg-muted rounded p-1 transition-colors"
            title={block.enabled ? "Disable block" : "Enable block"}
          >
            {block.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
          <button
            onClick={onDelete}
            className="hover:bg-muted rounded p-1 transition-colors"
            title="Delete block"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <textarea
        value={block.content}
        onChange={(e) => onUpdate(e.target.value)}
        className="bg-muted focus:ring-primary resize-none rounded p-2 font-mono text-sm focus:ring-1 focus:outline-none"
        rows={3}
        disabled={!block.enabled}
      />
    </div>
  );
}

function BlockColumn({
  title,
  blocks,
  setBlocks,
  onCopy,
}: {
  title: string;
  blocks: ContextBlock[];
  setBlocks: (blocks: ContextBlock[]) => void;
  onCopy?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contextString = useMemo(() => buildFullContext(blocks), [blocks]);
  const tokenCount = useMemo(() => estimateTokens(contextString), [contextString]);
  const tokenPercent = Math.min((tokenCount / MAX_CONTEXT_TOKENS) * 100, 100);

  const handleUpdate = useCallback(
    (id: string, content: string) => {
      setBlocks(blocks.map((b) => (b.id === id ? { ...b, content } : b)));
    },
    [blocks, setBlocks],
  );

  const handleDelete = useCallback(
    (id: string) => {
      setBlocks(blocks.filter((b) => b.id !== id));
    },
    [blocks, setBlocks],
  );

  const handleToggle = useCallback(
    (id: string) => {
      setBlocks(blocks.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b)));
    },
    [blocks, setBlocks],
  );

  const handleMove = useCallback(
    (id: string, direction: "up" | "down") => {
      const index = blocks.findIndex((b) => b.id === id);
      if (index === -1) return;
      if (direction === "up" && index > 0) {
        const newBlocks = [...blocks];
        [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
        setBlocks(newBlocks);
      } else if (direction === "down" && index < blocks.length - 1) {
        const newBlocks = [...blocks];
        [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
        setBlocks(newBlocks);
      }
    },
    [blocks, setBlocks],
  );

  const handleAdd = useCallback(() => {
    const newId = String(Date.now());
    setBlocks([
      ...blocks,
      {
        id: newId,
        label: "New Block",
        content: "",
        author: "user",
        enabled: true,
      },
    ]);
  }, [blocks, setBlocks]);

  const handlePredict = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/gen/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: contextString }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const newId = String(Date.now());
      setBlocks([
        ...blocks,
        {
          id: newId,
          label: "Generated",
          content: data.output,
          author: "assistant",
          enabled: true,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [blocks, setBlocks, contextString]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        {onCopy && (
          <Button onClick={onCopy} variant="outline">
            <Copy className="mr-1 h-3 w-3" />
            Copy from A
          </Button>
        )}
      </div>

      {/* Token usage bar */}
      <div className="space-y-1">
        <div className="text-muted-foreground flex justify-between text-xs">
          <span>Context tokens: {tokenCount.toLocaleString()}</span>
          <span>{tokenPercent.toFixed(1)}% of limit</span>
        </div>
        <div className="bg-muted h-2 overflow-hidden rounded-full">
          <div
            className={`h-full transition-all ${
              tokenPercent > 90 ? "bg-red-500" : tokenPercent > 70 ? "bg-amber-500" : "bg-green-500"
            }`}
            style={{ width: `${tokenPercent}%` }}
          />
        </div>
      </div>

      {/* Blocks (no scroll) */}
      <div className="flex flex-col gap-3">
        {blocks.map((block, index) => (
          <ContextBlockCard
            key={block.id}
            block={block}
            onUpdate={(content) => handleUpdate(block.id, content)}
            onDelete={() => handleDelete(block.id)}
            onToggle={() => handleToggle(block.id)}
            onMove={(dir) => handleMove(block.id, dir)}
            isFirst={index === 0}
          />
        ))}
      </div>

      <Button onClick={handleAdd} variant="outline" className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add Block
      </Button>

      <Button onClick={handlePredict} disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          "Generate Completion"
        )}
      </Button>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}

export default function ExperimentsLlmInterface(): JSX.Element {
  const [blocksA, setBlocksA] = useState<ContextBlock[]>(DEFAULT_BLOCKS_A);
  const [blocksB, setBlocksB] = useState<ContextBlock[]>(DEFAULT_BLOCKS_B);
  const [showComparison, setShowComparison] = useState(false);

  const handleCopyToB = useCallback(() => {
    setBlocksB(blocksA.map((b) => ({ ...b, id: b.id.replace("-a", "-b") })));
  }, [blocksA]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header>
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold">Context Chemistry</h1>
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger className="border text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:border-foreground inline-flex min-h-6 min-w-6 cursor-pointer items-center justify-center gap-2 rounded-md border px-3 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0">
                <HelpCircle />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Context Chemistry</DialogTitle>
                  <DialogDescription>
                    The LLM doesn't "remember" your conversation. It sees one continuous block of
                    text — the <strong>context window</strong>. Every block below contributes to the
                    prediction. Toggle blocks, reorder them, or run an A/B comparison to see how
                    context shapes output.
                  </DialogDescription>
                </DialogHeader>
                <div>
                  <h4 className="mb-2 font-semibold">What to try:</h4>
                  <ul className="text-muted-foreground list-disc space-y-2 pl-4 text-sm">
                    <li>
                      <strong>Toggle the System block</strong> — See how the assistant's personality
                      changes when you remove the system instruction.
                    </li>
                    <li>
                      <strong>Reorder blocks</strong> — Earlier context has more influence. Move the
                      "Previous Turn" after "Current Input" and see what happens.
                    </li>
                    <li>
                      <strong>A/B test</strong> — Enable comparison mode, copy A to B, then change
                      just the System block. Generate on both and compare.
                    </li>
                    <li>
                      <strong>Add examples</strong> — Give the assistant a few-shot pattern by
                      adding example Q&A blocks before the current question.
                    </li>
                  </ul>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              onClick={() => setShowComparison(!showComparison)}
              variant={showComparison ? "outline" : "default"}
              size="icon"
              aria-label="Toggle comparison"
            >
              <LucideColumns2 />
            </Button>
          </div>
        </div>
      </header>

      <div className={`grid gap-6 ${showComparison ? "grid-cols-2" : "grid-cols-1"}`}>
        <BlockColumn title="Configuration A" blocks={blocksA} setBlocks={setBlocksA} />

        {showComparison && (
          <BlockColumn
            title="Configuration B"
            blocks={blocksB}
            setBlocks={setBlocksB}
            onCopy={handleCopyToB}
          />
        )}
      </div>
    </div>
  );
}
