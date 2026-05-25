import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import type { Task } from "../types";

interface DependencyManagerProps {
  task: Task;
  allTasks: Task[];
  onUpdate: (dependencies: string[]) => void;
  onClose: () => void;
}

export const DependencyManager: React.FC<DependencyManagerProps> = ({
  task,
  allTasks,
  onUpdate,
  onClose,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(task.dependencies || []);
  const otherTasks = allTasks.filter((t) => t.id !== task.id && t.status !== "completed");

  const toggleDependency = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleSave = () => {
    onUpdate(selectedIds);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-white/80 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md overflow-hidden rounded border border-zinc-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-zinc-100 p-6">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Dependency Graph
            </h2>
            <p className="mt-1 text-sm font-semibold">Blocking "{task.title}"</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 transition-colors hover:text-zinc-950">
            <X size={16} />
          </button>
        </div>

        <div className="custom-scrollbar max-h-[400px] space-y-2 overflow-y-auto p-6">
          {otherTasks.length > 0 ? (
            otherTasks.map((currentTask) => (
              <button
                key={currentTask.id}
                onClick={() => toggleDependency(currentTask.id)}
                className={cn(
                  "w-full rounded border p-4 text-left transition-all",
                  selectedIds.includes(currentTask.id)
                    ? "border-zinc-950 bg-zinc-950 text-white shadow-lg"
                    : "border-zinc-100 bg-white text-zinc-600 hover:border-zinc-300",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold tracking-tight">{currentTask.title}</span>
                    <span className="mt-1 text-[9px] uppercase tracking-widest opacity-60">
                      {currentTask.status} • {currentTask.priority}
                    </span>
                  </div>
                  {selectedIds.includes(currentTask.id) && <Check size={14} />}
                </div>
              </button>
            ))
          ) : (
            <div className="py-12 text-center text-sm font-medium italic text-zinc-300">
              No active nodes available for clustering.
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-zinc-100 p-6">
          <button onClick={handleSave} className="mono-button flex-1">
            Update
          </button>
          <button onClick={onClose} className="mono-button-outline">
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};
