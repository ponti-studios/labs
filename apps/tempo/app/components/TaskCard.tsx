import React from 'react';
import { Task, Priority } from '../types';
import { cn } from '../lib/utils';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Play, 
  Pause, 
  ChevronRight,
  MoreVertical,
  Link as LinkIcon
} from 'lucide-react';
import { motion } from 'motion/react';

interface TaskCardProps {
  task: Task;
  onStatusChange?: (status: Task['status']) => void;
  onSplit?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  className?: string;
}

const PRIORITY_COLORS: Record<Priority, string> = {
  P0: 'bg-red-500',
  P1: 'bg-amber-500',
  P2: 'bg-blue-500',
  P3: 'bg-slate-500',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange, onSplit, onContextMenu, className }) => {
  const progress = Math.min((task.actualMinutes / task.estimatedMinutes) * 100, 100);
  const isInFlight = task.status === 'in-flight';
  const isOnDeck = task.status === 'on-deck';

  return (
    <motion.div 
      layout
      onContextMenu={onContextMenu}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all select-none",
        isInFlight && "ring-2 ring-slate-900 border-transparent",
        className
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", PRIORITY_COLORS[task.priority])} />
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
            {task.priority} • {task.tags?.[0] || 'Task'} • {task.estimatedMinutes}m total
          </span>
        </div>
        <button className="text-slate-400 hover:text-slate-600 transition-colors">
          <MoreVertical size={16} />
        </button>
      </div>

      <h3 className="font-semibold text-slate-900 mb-1 leading-tight">{task.title}</h3>
      {task.description && (
        <p className="text-sm text-slate-500 line-clamp-2 mb-3">{task.description}</p>
      )}

      {isInFlight && (
        <div className="space-y-3 mb-4">
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-slate-900"
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-500">
            <span>{Math.floor(task.actualMinutes)}m done</span>
            <span>{Math.max(0, Math.ceil(task.estimatedMinutes - task.actualMinutes))}m left</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-50 border-dashed">
        <div className="flex items-center gap-3">
          {isInFlight ? (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-900 bg-slate-50 px-2 py-1 rounded">
              <Clock size={12} className="animate-pulse" />
              Ends ~3:{30}pm {/* Mock calculation for now */}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <LinkIcon size={12} />
              <span>{task.dependencies.length > 0 ? `${task.dependencies.length} deps` : 'No blocks'}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {isOnDeck && (
            <button 
              onClick={() => onStatusChange?.('in-flight')}
              className="px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 hover:bg-slate-800 transition-colors"
            >
              <Play size={12} />
              Start
            </button>
          )}
          {isInFlight && (
            <button 
              onClick={() => onStatusChange?.('completed')}
              className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 hover:bg-green-600 transition-colors"
            >
              <CheckCircle2 size={12} />
              Done
            </button>
          )}
          {task.estimatedMinutes > 240 && (
            <button 
              onClick={onSplit}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1.5 hover:bg-slate-200 transition-colors"
            >
              Split
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
