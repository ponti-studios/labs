export type TaskStatus = "in-flight" | "on-deck" | "blocked" | "completed";
export type Priority = "P0" | "P1" | "P2" | "P3";
export type Tag = "deep-work" | "admin" | "meeting" | string;

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  estimatedMinutes: number;
  actualMinutes: number;
  startDateTime: string | null; // ISO string
  endDateTime: string | null; // ISO string
  dependencies: string[];
  dueDate?: string; // ISO string
  completedDate?: string; // ISO string
  tags?: Tag[];
}

export interface Constraints {
  maxTaskMinutes: number;
  minTaskMinutes: number;
  maxInFlight: number;
  maxOnDeck: number;
  onDeckVisible: number;
  maxDailyMinutes: number;
  maxWeeklyMinutes: number;
  maxConsecutiveMinutes: number;
  breakAfterMinutes: number;
  breakDurationMinutes: number;
  dailyRestStart: string; // "18:00"
  dailyRestEnd: string; // "09:00"
  skipWeekends: boolean;
  bufferMinutes: Record<Priority, number>;
}

export const DEFAULT_CONSTRAINTS: Constraints = {
  maxTaskMinutes: 240,
  minTaskMinutes: 15,
  maxInFlight: 2,
  maxOnDeck: 10,
  onDeckVisible: 3,
  maxDailyMinutes: 480,
  maxWeeklyMinutes: 2400,
  maxConsecutiveMinutes: 120,
  breakAfterMinutes: 120,
  breakDurationMinutes: 15,
  dailyRestStart: "18:00",
  dailyRestEnd: "09:00",
  skipWeekends: true,
  bufferMinutes: {
    P0: 15,
    P1: 30,
    P2: 60,
    P3: 120,
  },
};
