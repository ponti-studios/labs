import React from "react";
import { Link2, GripVertical, Zap } from "lucide-react";
import { motion, Reorder } from "framer-motion";
import { cn } from "../lib/utils";
import type { Task } from "../types";

interface TimelineViewProps {
  tasks: Task[];
  onTaskContextMenu: (e: React.MouseEvent, taskId: string) => void;
  onOnDeckReorder: (tasks: Task[]) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  tasks,
  onTaskContextMenu,
  onOnDeckReorder,
}) => {
  const inFlightTasks = tasks.filter((t) => t.status === "in-flight");
  const onDeckTasks = tasks.filter((t) => t.status === "on-deck");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  return (
    <div className="space-y-16">
      {inFlightTasks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="h-1 w-1 animate-pulse rounded-full bg-black" />
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
              Current Session
            </h2>
          </div>
          <div className="divide-y divide-zinc-100 border-y border-zinc-100">
            {inFlightTasks.map((task) => (
              <div
                key={task.id}
                onContextMenu={(e) => onTaskContextMenu(e, task.id)}
                className="group flex cursor-context-menu items-center justify-between py-6 transition-colors hover:bg-zinc-50/50"
              >
                <div className="flex items-center gap-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded border border-zinc-200 bg-white">
                    <Zap size={14} className="text-zinc-950" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-950">{task.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-tight text-zinc-400">
                      <span>{task.priority}</span>
                      <span>•</span>
                      <span>{Math.floor(task.actualMinutes)}m elapsed</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-1 w-32 overflow-hidden rounded-full bg-zinc-100">
                    <motion.div
                      className="h-full bg-black"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min((task.actualMinutes / task.estimatedMinutes) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-zinc-400">
                    {task.estimatedMinutes}m
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-zinc-300" />
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Queue</h2>
          </div>
          <p className="text-[10px] italic text-zinc-300">Prioritize by dragging</p>
        </div>

        <Reorder.Group
          axis="y"
          values={onDeckTasks}
          onReorder={onOnDeckReorder}
          className="divide-y divide-zinc-100 border-y border-zinc-100 transition-colors active:border-zinc-300"
        >
          {onDeckTasks.map((task) => (
            <Reorder.Item
              key={task.id}
              value={task}
              onContextMenu={(e) => onTaskContextMenu(e, task.id)}
              whileDrag={{
                backgroundColor: "rgb(255, 255, 255)",
                zIndex: 50,
                boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
              }}
              className="group relative flex cursor-grab select-none items-center justify-between py-4 transition-colors hover:bg-zinc-50/50 active:cursor-grabbing"
            >
              <div className="flex items-center gap-6">
                <div className="flex w-10 flex-col items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <GripVertical size={14} className="text-zinc-300" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-zinc-700 transition-colors group-hover:text-black">
                    {task.title}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] uppercase tracking-tight text-zinc-400">
                      {task.priority}
                    </span>
                    <span className="text-[10px] text-zinc-200">/</span>
                    <span
                      className={cn(
                        "rounded-sm border px-1.5 py-0.5 text-[9px] text-zinc-400",
                        task.priority === "P0"
                          ? "border-zinc-200 bg-zinc-50 font-bold text-zinc-950"
                          : "border-zinc-100",
                      )}
                    >
                      {task.priority === "P0"
                        ? "+0"
                        : task.priority === "P1"
                          ? "+15"
                          : task.priority === "P2"
                            ? "+30"
                            : "+60"}
                      m buffer
                    </span>
                    {task.dependencies.length > 0 && (
                      <>
                        <span className="text-[10px] text-zinc-200">/</span>
                        <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                          <Link2 size={10} />
                          {task.dependencies.length} deps
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-zinc-400">{task.estimatedMinutes}m</span>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {onDeckTasks.length === 0 && inFlightTasks.length === 0 && (
          <div className="border-t border-zinc-100 py-20 text-center">
            <p className="text-sm font-medium italic text-zinc-300">
              Pipeline clear. Ready for input.
            </p>
          </div>
        )}
      </div>

      {completedTasks.length > 0 && (
        <div className="space-y-4 pt-12">
          <div className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-zinc-100" />
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-zinc-200">
              Archive
            </h2>
          </div>
          <div className="group space-y-2 opacity-30 transition-opacity duration-500 hover:opacity-100">
            {completedTasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between border-b border-zinc-50 py-2 text-[11px] font-medium last:border-0"
              >
                <span className="line-through">{task.title}</span>
                <span className="text-zinc-400">{task.estimatedMinutes}m</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
