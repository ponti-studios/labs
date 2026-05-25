import { differenceInMinutes, formatISO, parseISO } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { Constraints, DEFAULT_CONSTRAINTS, Task } from "../types";

const STORAGE_KEY = "chrono-flow-data";

export function useChronoFlow() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [constraints] = useState<Constraints>(DEFAULT_CONSTRAINTS);
  const [lastBreakTime, setLastBreakTime] = useState<string>(formatISO(new Date()));
  const [isBreakRequired, setIsBreakRequired] = useState(false);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setTasks(data.tasks || []);
        setLastBreakTime(data.lastBreakTime || formatISO(new Date()));
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, lastBreakTime }));
  }, [tasks, lastBreakTime]);

  // Break Logic
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const lastBreak = parseISO(lastBreakTime);
      const minutesSinceBreak = differenceInMinutes(now, lastBreak);

      // Check if break is required based on consecutive minutes in flight
      const inFlightTasks = tasks.filter((t) => t.status === "in-flight");
      if (inFlightTasks.length > 0 && minutesSinceBreak >= constraints.breakAfterMinutes) {
        setIsBreakRequired(true);
      } else {
        setIsBreakRequired(false);
      }

      // Update actual minutes for in-flight tasks
      if (inFlightTasks.length > 0) {
        setTasks((prev) =>
          prev.map((t) => {
            if (t.status === "in-flight") {
              return { ...t, actualMinutes: t.actualMinutes + 1 / 60 }; // Simple tick increment
            }
            return t;
          }),
        );
      }
    }, 1000); // Tick every second for smooth UI, though actual time tracking is minute-based

    return () => clearInterval(interval);
  }, [lastBreakTime, tasks, constraints.breakAfterMinutes]);

  const addTask = useCallback((task: Omit<Task, "id" | "actualMinutes">) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      actualMinutes: 0,
    };
    setTasks((prev) => [...prev, newTask]);
  }, []);

  const updateTaskStatus = useCallback((taskId: string, status: Task["status"]) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          let updates: Partial<Task> = { status };
          if (status === "in-flight") {
            updates.startDateTime = formatISO(new Date());
          }
          if (status === "completed") {
            updates.completedDate = formatISO(new Date());
            updates.endDateTime = formatISO(new Date());
          }
          return { ...t, ...updates };
        }
        return t;
      }),
    );
  }, []);

  const finishBreak = useCallback(() => {
    setLastBreakTime(formatISO(new Date()));
    setIsBreakRequired(false);
  }, []);

  const splitTask = useCallback(
    (taskId: string, subTasks: { title: string; estimatedMinutes: number }[]) => {
      setTasks((prev) => {
        const original = prev.find((t) => t.id === taskId);
        if (!original) return prev;

        const newSubTasks: Task[] = subTasks.map((st) => ({
          ...original,
          id: crypto.randomUUID(),
          title: st.title,
          estimatedMinutes: st.estimatedMinutes,
          actualMinutes: 0,
          status: "on-deck" as const,
        }));

        return [...prev.filter((t) => t.id !== taskId), ...newSubTasks];
      });
    },
    [],
  );

  const reorderOnDeck = useCallback((reorderedOnDeck: Task[]) => {
    setTasks((prev) => {
      const otherTasks = prev.filter((t) => t.status !== "on-deck");
      return [...otherTasks, ...reorderedOnDeck];
    });
  }, []);

  const updateTaskDependencies = useCallback((taskId: string, dependencies: string[]) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, dependencies } : t)));
  }, []);

  return {
    tasks,
    setTasks,
    addTask,
    updateTaskStatus,
    updateTaskDependencies,
    isBreakRequired,
    finishBreak,
    constraints,
    lastBreakTime,
    splitTask,
    reorderOnDeck,
  };
}
