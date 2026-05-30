import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@pontistudios/ui";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, RefreshCw, X } from "lucide-react";
import { useEffect, useState } from "react";

interface SubTask {
  title: string;
  estimatedMinutes: number;
}

interface AISplitProps {
  taskTitle: string;
  estimatedMinutes: number;
  onAccept: (subTasks: SubTask[]) => void;
  onCancel: () => void;
}

export function AIPrompt({ taskTitle, estimatedMinutes, onAccept, onCancel }: AISplitProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SubTask[]>([]);

  const handleAISplit = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskTitle, estimatedMinutes }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate breakdown");
      }

      const data = (await response.json()) as SubTask[];
      setSuggestions(data);
    } catch (err) {
      console.error("AI Split failed", err);
      setError("Failed to generate breakdown. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleAISplit();
  }, []);

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            Flow Splitter
          </DialogTitle>
          <DialogDescription className="text-sm font-semibold mt-1">{taskTitle}</DialogDescription>
        </DialogHeader>

        <div className="p-2">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Loader2 className="animate-spin text-zinc-200 mb-4" size={24} />
              <p className="text-sm font-medium text-zinc-400">Calculating Nodes...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-xs text-red-500 mb-6" role="alert">
                {error}
              </p>
              <button onClick={handleAISplit} className="text-sm underline">
                Retry
              </button>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-6">
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {suggestions.map((st, i) => (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      key={i}
                      className="flex justify-between items-center p-4 border border-zinc-100 rounded hover:bg-zinc-50 transition-all"
                    >
                      <span className="text-sm font-medium text-zinc-950">{st.title}</span>
                      <span className="text-[10px] font-mono font-bold text-zinc-400">
                        {st.estimatedMinutes}M
                      </span>
                    </motion.div>
                  ))}
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => onAccept(suggestions)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-zinc-950 text-white text-sm rounded"
                  >
                    <Check size={14} /> Accept
                  </button>
                  <button
                    onClick={handleAISplit}
                    className="flex items-center gap-2 px-4 py-2 border border-zinc-200 text-sm rounded"
                  >
                    <RefreshCw size={14} /> Regenerate
                  </button>
                  <button
                    onClick={onCancel}
                    className="p-2 border border-zinc-200 text-sm rounded"
                    aria-label="Cancel"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </AnimatePresence>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
