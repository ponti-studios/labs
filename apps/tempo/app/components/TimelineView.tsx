import React, { useState } from 'react';
import { Task } from '../types';
import { motion, Reorder } from 'motion/react';
import { startOfDay } from 'date-fns';
import { cn } from '../lib/utils';
import { Link2, GripVertical, Zap } from 'lucide-react';

interface TimelineViewProps {
  tasks: Task[];
  onTaskContextMenu: (e: React.MouseEvent, taskId: string) => void;
  onOnDeckReorder: (tasks: Task[]) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ tasks, onTaskContextMenu, onOnDeckReorder }) => {
  const inFlightTasks = tasks.filter(t => t.status === 'in-flight');
  const onDeckTasks = tasks.filter(t => t.status === 'on-deck');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="space-y-16">
      {/* In Flight */}
      {inFlightTasks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-black animate-pulse" />
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Current Session</h2>
          </div>
          <div className="divide-y divide-zinc-100 border-y border-zinc-100">
            {inFlightTasks.map((task) => (
              <div 
                key={task.id}
                onContextMenu={(e) => onTaskContextMenu(e, task.id)}
                className="group py-6 flex items-center justify-between hover:bg-zinc-50/50 transition-colors cursor-context-menu"
              >
                <div className="flex items-center gap-6">
                  <div className="w-10 h-10 border border-zinc-200 rounded flex items-center justify-center bg-white">
                    <Zap size={14} className="text-zinc-950" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-950">{task.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] font-mono text-zinc-400 uppercase tracking-tight">
                      <span>{task.priority}</span>
                      <span>•</span>
                      <span>{Math.floor(task.actualMinutes)}m elapsed</span>
                      {task.tags && task.tags.length > 0 && (
                        <>
                          <span className="text-zinc-200">/</span>
                          <div className="flex gap-1.5">
                            {task.tags.map(tag => (
                              <span key={tag} className="text-zinc-400 font-bold bg-zinc-50 px-1 rounded-sm border border-zinc-100">{tag}</span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-1 bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-black"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((task.actualMinutes / task.estimatedMinutes) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono font-medium">{task.estimatedMinutes}m</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* On Deck */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-zinc-300" />
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Queue</h2>
          </div>
          <p className="text-[10px] text-zinc-300 font-mono italic">Prioritize by dragging</p>
        </div>
        
        <Reorder.Group 
          axis="y" 
          values={onDeckTasks} 
          onReorder={onOnDeckReorder} 
          className="divide-y divide-zinc-100 border-y border-zinc-100 active:border-zinc-300 transition-colors"
        >
          {onDeckTasks.map((task) => (
            <Reorder.Item 
              key={task.id} 
              value={task}
              onContextMenu={(e) => onTaskContextMenu(e, task.id)}
              whileDrag={{ 
                backgroundColor: "rgb(255, 255, 255)",
                zIndex: 50,
                boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
              }}
              className="group py-4 flex items-center justify-between cursor-grab active:cursor-grabbing hover:bg-zinc-50/50 transition-colors select-none relative"
            >
              <div className="flex items-center gap-6">
                <div className="w-10 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical size={14} className="text-zinc-300" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-zinc-700 group-hover:text-black transition-colors">{task.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-tight">{task.priority}</span>
                    <span className="text-[10px] text-zinc-200">/</span>
                    <span className={cn(
                      "text-[9px] font-mono px-1.5 py-0.5 rounded-sm border",
                      task.priority === 'P0' ? "border-zinc-200 bg-zinc-50 text-zinc-950 font-bold" : "border-zinc-100 text-zinc-400"
                    )}>
                      {task.priority === 'P0' ? '+0' : task.priority === 'P1' ? '+15' : task.priority === 'P2' ? '+30' : '+60'}m buffer
                    </span>
                    {task.tags && task.tags.length > 0 && (
                      <>
                        <span className="text-[10px] text-zinc-200">/</span>
                        <div className="flex gap-1.5 overflow-hidden max-w-[120px] sm:max-w-none">
                          {task.tags.map(tag => (
                            <span key={tag} className="text-[9px] font-mono text-zinc-400 bg-zinc-50 px-1 rounded-sm border border-zinc-100 whitespace-nowrap">{tag}</span>
                          ))}
                        </div>
                      </>
                    )}
                    {task.dependencies.length > 0 && (
                      <>
                        <span className="text-[10px] text-zinc-200">/</span>
                        <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-400">
                          <Link2 size={10} />
                          {task.dependencies.length} deps
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-mono text-zinc-400">{task.estimatedMinutes}m</span>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {onDeckTasks.length === 0 && inFlightTasks.length === 0 && (
          <div className="py-20 text-center border-t border-zinc-100">
            <p className="text-sm text-zinc-300 font-medium italic">Pipeline clear. Ready for input.</p>
          </div>
        )}
      </div>

      {/* Completed */}
      {completedTasks.length > 0 && (
        <div className="space-y-4 pt-12">
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-zinc-100" />
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-zinc-200">Archive</h2>
          </div>
          <div className="space-y-2 opacity-30 group hover:opacity-100 transition-opacity duration-500">
            {completedTasks.slice(0, 5).map(task => (
              <div key={task.id} className="flex items-center justify-between py-2 text-[11px] font-medium border-b border-zinc-50 last:border-0">
                <span className="line-through">{task.title}</span>
                <span className="font-mono text-zinc-400">{task.estimatedMinutes}m</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
