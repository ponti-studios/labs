/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useChronoFlow } from './hooks/useChronoFlow';
import { TaskCard } from './components/TaskCard';
import { AIPrompt } from './components/AIPrompt';
import { AddTaskModal } from './components/AddTaskModal';
import { VoiceRecorderOverlay } from './components/VoiceRecorderOverlay';
import { ContextMenu } from './components/ContextMenu';
import { DependencyManager } from './components/DependencyManager';
import { TimelineView } from './components/TimelineView';
import { 
  Plus, 
  Coffee, 
  Zap,
  CheckCircle2,
  Maximize2,
  Link as LinkIcon,
  Split,
  Trash2,
  GitBranch,
  Mic
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { format } from 'date-fns';

export default function App() {
  const { 
    tasks, 
    setTasks,
    addTask, 
    updateTaskStatus, 
    updateTaskDependencies,
    isBreakRequired, 
    finishBreak, 
    constraints,
    splitTask,
    reorderOnDeck
  } = useChronoFlow();

  const [splittingTask, setSplittingTask] = useState<string | null>(null);
  const [managingDeps, setManagingDeps] = useState<string | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, taskId: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const existingTags = useMemo(() => {
    const tags = new Set<string>();
    tasks.forEach(t => t.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           t.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesTag = !selectedTag || t.tags?.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [tasks, searchQuery, selectedTag]);

  const flowStats = useMemo(() => {
    const activeTasks = tasks.filter(t => t.status !== 'completed');
    const rawTime = activeTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0);
    const bufferTime = activeTasks.reduce((acc, t) => {
      const b = t.priority === 'P0' ? 0 : t.priority === 'P1' ? 15 : t.priority === 'P2' ? 30 : 60;
      return acc + b;
    }, 0);
    const totalRequired = rawTime + bufferTime;
    const remainingDay = constraints.maxDailyMinutes - tasks.filter(t => t.status === 'completed').reduce((acc, t) => acc + t.estimatedMinutes, 0);
    
    return {
      rawTime,
      bufferTime,
      totalRequired,
      remainingDay,
      isOverloaded: totalRequired > remainingDay,
      health: totalRequired > remainingDay ? 'critical' : totalRequired > remainingDay * 0.8 ? 'warning' : 'optimal'
    };
  }, [tasks, constraints.maxDailyMinutes]);

  const dailyMinutesLeft = flowStats.remainingDay;

  const handleContextMenu = (e: React.MouseEvent, taskId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, taskId });
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans selection:bg-zinc-950 selection:text-white pb-20">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-6 py-4">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 bg-black rounded-sm flex items-center justify-center text-white">
              <GitBranch size={14} />
            </div>
            <h1 className="text-sm font-semibold tracking-tight">Timeline</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono text-zinc-300 uppercase tracking-widest leading-none mb-1">Internal Health</span>
                <div className="flex items-center gap-1.5">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    flowStats.health === 'critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                    flowStats.health === 'warning' ? 'bg-amber-400' : 'bg-emerald-500'
                  )} />
                  <span className="text-[11px] font-bold uppercase tracking-tight text-zinc-500">{flowStats.health}</span>
                </div>
              </div>
              <div className="w-px h-8 bg-zinc-100 mx-2" />
              <div className="flex flex-col items-end text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                <span>{Math.floor(dailyMinutesLeft / 60)}h remaining</span>
                <span className="text-[9px] font-mono mt-0.5 text-zinc-300">Net: {flowStats.totalRequired}M (w/ Buffer)</span>
              </div>
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-zinc-200" />
            <div className="hidden sm:block text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              {format(new Date(), 'MMM dd')}
            </div>
            <button 
              onClick={() => setIsVoiceRecording(true)}
              className="mono-button"
            >
              <Mic size={14} className="inline-block mr-1.5" />
              New
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-screen-xl mx-auto px-6 py-12">
        {/* Search and Filters */}
        <div className="mb-12 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative group flex-1 max-w-md">
              <input 
                type="text"
                placeholder="Search flow..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-100 rounded px-3 py-2 text-sm focus:border-zinc-900 transition-colors outline-none"
              />
            </div>
            {existingTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setSelectedTag(null)}
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded transition-colors",
                    !selectedTag ? "bg-black text-white" : "bg-zinc-50 text-zinc-400 hover:text-zinc-950"
                  )}
                >
                  All
                </button>
                {existingTags.map(tag => (
                  <button 
                    key={tag}
                    onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded transition-colors",
                      tag === selectedTag ? "bg-black text-white" : "bg-zinc-50 text-zinc-400 hover:text-zinc-950"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {isBreakRequired && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 p-4 bg-zinc-50 border border-zinc-200 rounded flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <Coffee size={18} className="text-zinc-400" />
              <div className="text-sm">
                <span className="font-semibold">Reset required.</span> Take a 15-minute break.
              </div>
            </div>
            <button 
              onClick={finishBreak}
              className="text-sm font-bold hover:underline"
            >
              Done
            </button>
          </motion.div>
        )}

        <section onContextMenu={(e) => {
          if (contextMenu) setContextMenu(null);
        }}>
          <TimelineView 
            tasks={filteredTasks} 
            onTaskContextMenu={handleContextMenu}
            onOnDeckReorder={reorderOnDeck}
          />
          
          <footer className="mt-16 pt-8 border-t border-zinc-100 flex justify-center">
             <p className="text-[10px] font-mono text-zinc-300 uppercase tracking-[0.3em]">
               Right-click for precision controls
             </p>
          </footer>
        </section>
      </main>

      <AnimatePresence>
        {splittingTask && (
          <AIPrompt 
            taskTitle={tasks.find(t => t.id === splittingTask)?.title || ""}
            estimatedMinutes={tasks.find(t => t.id === splittingTask)?.estimatedMinutes || 0}
            onAccept={(subTasks) => {
              splitTask(splittingTask, subTasks);
              setSplittingTask(null);
            }}
            onCancel={() => setSplittingTask(null)}
          />
        )}
        {isVoiceRecording && (
          <VoiceRecorderOverlay 
            onClose={() => setIsVoiceRecording(false)}
            existingTags={existingTags}
            onSwitchToManual={() => {
              setIsVoiceRecording(false);
              setIsAddingTask(true);
            }}
            onTaskCreated={(voiceTask) => {
              addTask({
                ...voiceTask,
                status: 'on-deck',
                dependencies: [],
                tags: [...(voiceTask.tags || []), 'voice-input'],
                startDateTime: null,
                endDateTime: null,
              });
              setIsVoiceRecording(false);
            }}
          />
        )}
        {isAddingTask && (
          <AddTaskModal 
            onAdd={addTask}
            onClose={() => setIsAddingTask(false)}
          />
        )}
        {managingDeps && (
          <DependencyManager 
            task={tasks.find(t => t.id === managingDeps)!}
            allTasks={tasks}
            onUpdate={(deps) => updateTaskDependencies(managingDeps, deps)}
            onClose={() => setManagingDeps(null)}
          />
        )}
        {contextMenu && (
          <ContextMenu 
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            options={[
              { 
                label: 'Manage Dependencies', 
                icon: <LinkIcon size={14} />, 
                onClick: () => setManagingDeps(contextMenu.taskId) 
              },
              { 
                label: 'Split with AI', 
                icon: <Split size={14} />, 
                onClick: () => setSplittingTask(contextMenu.taskId) 
              },
              { 
                label: 'Start Task', 
                icon: <Zap size={14} />, 
                onClick: () => updateTaskStatus(contextMenu.taskId, 'in-flight')
              },
              { 
                label: 'Mark Done', 
                icon: <CheckCircle2 size={14} />, 
                onClick: () => updateTaskStatus(contextMenu.taskId, 'completed')
              },
              { 
                label: 'Delete Task', 
                icon: <Trash2 size={14} />, 
                destructive: true,
                onClick: () => deleteTask(contextMenu.taskId)
              },
            ]}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

