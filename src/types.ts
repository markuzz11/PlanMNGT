export type TaskStage = 'planned' | 'in_progress' | 'completed' | 'deferred';

export interface CustomCategory {
  id: string;
  label: string;
  color: string;
}

export type TaskCategory = string;

export type TaskPriority = 'high' | 'medium' | 'normal';

export interface CRMTask {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm (e.g. "10:00")
  durationMinutes: number; // e.g. 30, 60, 90, 120
  category: string;
  stage: TaskStage;
  priority: TaskPriority;
  clientOrProject?: string;
  notes?: string;
  dealValue?: number; // Optional numerical value/estimate
  createdAt: string;
  completedAt?: string;
}

export type NoteTag = 'daily_log' | 'meeting' | 'idea' | 'todo' | 'general';

export interface CRMNote {
  id: string;
  title: string;
  content: string;
  date?: string; // YYYY-MM-DD (linked to a date or global)
  tag: NoteTag;
  isPinned: boolean;
  updatedAt: string;
}

export interface DaySummary {
  totalTasks: number;
  completedTasks: number;
  totalDurationMinutes: number;
  completedDurationMinutes: number;
  workloadPercentage: number;
}
