import React, { useState } from 'react';
import { Task } from '../types';
import { X, Link as LinkIcon, Check, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface DependencyManagerProps {
  task: Task;
  allTasks: Task[];
  onUpdate: (dependencies: string[]) => void;
  onClose: () => void;
}

export const DependencyManager: React.FC<DependencyManagerProps> = ({ task, allTasks, onUpdate, onClose }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(task.dependencies || []);

  const otherTasks = allTasks.filter(t => t.id !== task.id && t.status !== 'completed');

  const toggleDependency = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    onUpdate(selectedIds);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border border-zinc-200 rounded w-full max-w-md shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Dependency Graph</h2>
            <p className="text-sm font-semibold mt-1">Blocking "{task.title}"</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-950 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 max-h-[400px] overflow-y-auto space-y-2 custom-scrollbar">
          {otherTasks.length > 0 ? (
            otherTasks.map(t => (
              <button
                key={t.id}
                onClick={() => toggleDependency(t.id)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded border transition-all text-left",
                  selectedIds.includes(t.id) 
                    ? "bg-zinc-950 border-zinc-950 text-white shadow-lg" 
                    : "bg-white border-zinc-100 hover:border-zinc-300 text-zinc-600"
                )}
              >
                <div className="flex flex-col">
                  <span className="font-bold text-sm tracking-tight">{t.title}</span>
                  <span className={cn(
                    "text-[9px] uppercase tracking-widest font-mono mt-1 opacity-60",
                  )}>
                    {t.status} • {t.priority}
                  </span>
                </div>
                {selectedIds.includes(t.id) && <Check size={14} />}
              </button>
            ))
          ) : (
            <div className="py-12 text-center text-zinc-300 font-medium italic text-sm">
              No active nodes available for clustering.
            </div>
          )}
        </div>

        <div className="p-6 border-t border-zinc-100 flex gap-3">
          <button 
            onClick={handleSave}
            className="flex-1 mono-button"
          >
            Update
          </button>
          <button 
            onClick={onClose}
            className="mono-button-outline"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};
