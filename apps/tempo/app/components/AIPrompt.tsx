import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Sparkles, Loader2, X, RefreshCw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AISplitProps {
  taskTitle: string;
  estimatedMinutes: number;
  onAccept: (subTasks: { title: string; estimatedMinutes: number }[]) => void;
  onCancel: () => void;
}

export const AIPrompt: React.FC<AISplitProps> = ({ taskTitle, estimatedMinutes, onAccept, onCancel }) => {
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
                estimatedMinutes: { type: Type.NUMBER }
              },
              required: ["title", "estimatedMinutes"]
            }
          }
        }
      });

      const text = response.text || "[]";
      const data = JSON.parse(text);
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
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="bg-white border border-zinc-200 rounded w-full max-w-lg shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Flow Splitter</h2>
            <p className="text-sm font-semibold mt-1">{taskTitle}</p>
          </div>
          <button onClick={onCancel} className="p-1 hover:bg-zinc-100 rounded transition-colors text-zinc-400">
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
               <Loader2 className="animate-spin text-zinc-200 mb-4" size={24} />
               <p className="text-sm font-medium text-zinc-400">Calculating Nodes...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-xs text-red-500 mb-6">{error}</p>
              <button 
                onClick={handleAISplit}
                className="mono-button"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {suggestions.map((st, i) => (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    key={i} 
                    className="flex justify-between items-center p-4 border border-zinc-100 rounded hover:bg-zinc-50 transition-all group"
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
                  className="flex-1 mono-button"
                >
                  Accept
                </button>
                <button 
                  onClick={handleAISplit}
                  className="mono-button-outline"
                >
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
