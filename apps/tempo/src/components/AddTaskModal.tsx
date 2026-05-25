import React, { useState } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import type { Priority, Task } from "../types";

interface AddTaskModalProps {
  onAdd: (task: Omit<Task, "id" | "actualMinutes">) => void;
  onClose: () => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ onAdd, onClose }) => {
  const [title, setTitle] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [priority, setPriority] = useState<Priority>("P1");
  const [tag, setTag] = useState("deep-work");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    onAdd({
      title,
      description: "",
      status: "on-deck",
      priority,
      estimatedMinutes,
      dependencies: [],
      tags: [tag],
      startDateTime: null,
      endDateTime: null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md overflow-hidden rounded border border-zinc-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-zinc-100 p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            Initialize Node
          </h2>
          <button onClick={onClose} className="text-zinc-400 transition-colors hover:text-zinc-950">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 p-8">
          <div>
            <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-zinc-300">
              Identifier
            </label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-b border-zinc-100 bg-transparent px-0 py-1 text-lg font-bold outline-none transition-colors placeholder:text-zinc-100 focus:border-zinc-950"
              placeholder="System objective"
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-zinc-300">
                Duration / M
              </label>
              <input
                type="number"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full rounded border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-950"
              />
            </div>
            <div>
              <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-zinc-300">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full cursor-pointer appearance-none rounded border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-950"
              >
                <option value="P0">P0 CRIT</option>
                <option value="P1">P1 HIGH</option>
                <option value="P2">P2 MED</option>
                <option value="P3">P3 LOW</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-zinc-300">
              Category
            </label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full rounded border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-950"
              placeholder="e.g. engineering, personal"
            />
          </div>

          <div className="pt-4">
            <button type="submit" className="mono-button w-full">
              Push to Flow
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
