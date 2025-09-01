
export enum Priority {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum RecurrenceFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export interface Recurrence {
  frequency: RecurrenceFrequency;
  interval?: number; // e.g., every 2 weeks
  daysOfWeek?: number[]; // For weekly recurrence, 0 = Sunday, 6 = Saturday
  daysOfMonth?: number[]; // For monthly recurrence, e.g., [1, 15]
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  dueDate: Date | null;
  projectId: string | null;
  tags: string[];
  estimatedMinutes: number;
  completedAt: Date | null;
  createdAt: Date;
  recurrence?: Recurrence;
}

export interface Project {
  id: string;
  name: string;
  color: string;
}

export enum ViewType {
  TODAY,
  OVERDUE,
  TOMORROW,
  THIS_WEEK,
  NEXT_7_DAYS,
  HIGH_PRIORITY,
  COMPLETED,
  ALL,
  PROJECT,
  CALENDAR,
}

export type View = 
  | { type: ViewType.TODAY; title: string }
  | { type: ViewType.OVERDUE; title: string }
  | { type: ViewType.TOMORROW; title: string }
  | { type: ViewType.THIS_WEEK; title: string }
  | { type: ViewType.NEXT_7_DAYS; title: string }
  | { type: ViewType.HIGH_PRIORITY; title: string }
  | { type: ViewType.COMPLETED; title: string }
  | { type: ViewType.ALL; title: string }
  | { type: ViewType.PROJECT; id: string; title: string }
  | { type: ViewType.CALENDAR; title: string };

export type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

export type SidebarViewSettings = Partial<Record<ViewType, boolean>>;

export type Theme = 'light' | 'dark';
