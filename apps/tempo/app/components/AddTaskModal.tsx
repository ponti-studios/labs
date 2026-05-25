import React, { useState } from 'react';
import { X, Clock, Flag, Hash } from 'lucide-react';
import { Priority, Task } from '../types';
import { motion } from 'framer-motion';

interface AddTaskModalProps {
  onAdd: (task: Omit<Task, 'id' | 'actualMinutes'>) => void;
  onClose: () => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ onAdd, onClose }) => {
  const [title, setTitle] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [priority, setPriority] = useState<Priority>('P1');
  const [tag, setTag] = useState('deep-work');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    onAdd({
      title,
      description: '',
      status: 'on-deck',
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
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border border-zinc-200 rounded w-full max-w-md shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Initialize Node</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-950 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-300 mb-2">Identifier</label>
            <input 
              autoFocus
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-lg font-bold bg-transparent outline-none border-b border-zinc-100 focus:border-zinc-950 transition-colors py-1 px-0 placeholder:text-zinc-100"
              placeholder="System objective"
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-300 mb-2">Duration / M</label>
              <input 
                type="number" 
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full text-sm font-mono font-bold bg-zinc-50 border border-zinc-100 rounded px-3 py-2 outline-none focus:border-zinc-950 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-300 mb-2">Priority</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full text-sm font-bold bg-zinc-50 border border-zinc-100 rounded px-3 py-2 outline-none focus:border-zinc-950 transition-colors appearance-none cursor-pointer"
              >
                <option value="P0">P0 CRIT</option>
                <option value="P1">P1 HIGH</option>
                <option value="P2">P2 MED</option>
                <option value="P3">P3 LOW</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-300 mb-2">Category</label>
            <input 
              type="text" 
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full text-sm font-bold bg-zinc-50 border border-zinc-100 rounded px-3 py-2 outline-none focus:border-zinc-950 transition-colors"
              placeholder="e.g. engineering, personal"
            />
          </div>

          <div className="pt-4">
             <button 
              type="submit"
              className="w-full mono-button"
            >
              Push to Flow
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
