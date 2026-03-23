export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type ViewMode = 'kanban' | 'list' | 'timeline';

export interface User {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  assigneeId: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string | null;
  dueDate: string;
}

export interface TaskFilters {
  statuses: TaskStatus[];
  priorities: TaskPriority[];
  assigneeIds: string[];
  dueFrom: string;
  dueTo: string;
}

export interface PresenceUser {
  id: string;
  name: string;
  color: string;
  taskId: string;
}
