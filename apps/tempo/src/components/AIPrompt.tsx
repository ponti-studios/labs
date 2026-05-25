import React, { useEffect, useState } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import { Loader2, X } from "lucide-react";
import { motion } from "framer-motion";

interface AISplitProps {
  taskTitle: string;
  estimatedMinutes: number;
  onAccept: (subTasks: { title: string; estimatedMinutes: number }[]) => void;
  onCancel: () => void;
}

export const AIPrompt: React.FC<AISplitProps> = ({
  taskTitle,
  estimatedMinutes,
  onAccept,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<{ title: string; estimatedMinutes: number }[]>([]);

  const handleAISplit = async () => {
    setLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Decompose the following task into a logical sequence of sub-tasks for a deep work session.
Original Task: "${taskTitle}"
Total Available Time: ${estimatedMinutes} minutes.

Requirements:
1. Every sub-task must have a clear, actionable title.
2. The sum of sub-task durations should equal approximately ${estimatedMinutes} minutes.
3. Sub-tasks should be between 30 and 90 minutes each if possible.
4. Ensure the sequence is logical for completion.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                estimatedMinutes: { type: Type.NUMBER },
              },
              required: ["title", "estimatedMinutes"],
            },
          },
        },
      });

      setSuggestions(JSON.parse(response.text || "[]"));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="w-full max-w-lg overflow-hidden rounded border border-zinc-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-zinc-100 p-6">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Flow Splitter
            </h2>
            <p className="mt-1 text-sm font-semibold">{taskTitle}</p>
          </div>
          <button
            onClick={onCancel}
            className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 className="mb-4 animate-spin text-zinc-200" size={24} />
              <p className="text-sm font-medium text-zinc-400">Calculating Nodes...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="mb-6 text-xs text-red-500">{error}</p>
              <button onClick={handleAISplit} className="mono-button">
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="custom-scrollbar max-h-[300px] space-y-2 overflow-y-auto pr-2">
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    key={`${suggestion.title}-${index}`}
                    className="group flex items-center justify-between rounded border border-zinc-100 p-4 transition-all hover:bg-zinc-50"
                  >
                    <span className="text-sm font-medium text-zinc-950">{suggestion.title}</span>
                    <span className="text-[10px] font-bold text-zinc-400">
                      {suggestion.estimatedMinutes}M
                    </span>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => onAccept(suggestions)} className="mono-button flex-1">
                  Accept
                </button>
                <button onClick={handleAISplit} className="mono-button-outline">
                  Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
