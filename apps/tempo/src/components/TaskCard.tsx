import React from "react";
import { CheckCircle2, Clock, Link as LinkIcon, MoreVertical, Play } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import type { Priority, Task } from "../types";

interface TaskCardProps {
  task: Task;
  onStatusChange?: (status: Task["status"]) => void;
  onSplit?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  className?: string;
}

const PRIORITY_COLORS: Record<Priority, string> = {
  P0: "bg-red-500",
  P1: "bg-amber-500",
  P2: "bg-blue-500",
  P3: "bg-slate-500",
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onStatusChange,
  onSplit,
  onContextMenu,
  className,
}) => {
  const progress = Math.min((task.actualMinutes / task.estimatedMinutes) * 100, 100);
  const isInFlight = task.status === "in-flight";
  const isOnDeck = task.status === "on-deck";

  return (
    <motion.div
      layout
      onContextMenu={onContextMenu}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all select-none hover:shadow-md",
        isInFlight && "border-transparent ring-2 ring-slate-900",
        className,
      )}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", PRIORITY_COLORS[task.priority])} />
          <span className="text-[10px] uppercase tracking-widest text-slate-400">
            {task.priority} • {task.tags?.[0] || "Task"} • {task.estimatedMinutes}m total
          </span>
        </div>
        <button className="text-slate-400 transition-colors hover:text-slate-600">
          <MoreVertical size={16} />
        </button>
      </div>

      <h3 className="mb-1 leading-tight text-slate-900">{task.title}</h3>
      {task.description && (
        <p className="mb-3 line-clamp-2 text-sm text-slate-500">{task.description}</p>
      )}

      {isInFlight && (
        <div className="mb-4 space-y-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-slate-900"
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>{Math.floor(task.actualMinutes)}m done</span>
            <span>{Math.max(0, Math.ceil(task.estimatedMinutes - task.actualMinutes))}m left</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-dashed border-slate-50 pt-3">
        <div className="flex items-center gap-3">
          {isInFlight ? (
            <div className="flex items-center gap-1.5 rounded bg-slate-50 px-2 py-1 text-[11px] text-slate-900">
              <Clock size={12} className="animate-pulse" />
              Ends ~3:30pm
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <LinkIcon size={12} />
              <span>
                {task.dependencies.length > 0 ? `${task.dependencies.length} deps` : "No blocks"}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {isOnDeck && (
            <button
              onClick={() => onStatusChange?.("in-flight")}
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white transition-colors hover:bg-slate-800"
            >
              <Play size={12} />
              Start
            </button>
          )}
          {isInFlight && (
            <button
              onClick={() => onStatusChange?.("completed")}
              className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-1.5 text-xs text-white transition-colors hover:bg-green-600"
            >
              <CheckCircle2 size={12} />
              Done
            </button>
          )}
          {task.estimatedMinutes > 240 && (
            <button
              onClick={onSplit}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-700 transition-colors hover:bg-slate-200"
            >
              Split
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
