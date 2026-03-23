import { create } from 'zustand';
import { generateSeedTasks, users } from '../utils/dataGenerator';
import type { PresenceUser, Task, TaskFilters, TaskPriority, TaskStatus, ViewMode } from '../types';
import { toDate } from '../utils/date';

type SortColumn = 'title' | 'priority' | 'dueDate';
type SortDirection = 'asc' | 'desc';

interface TaskState {
  tasks: Task[];
  view: ViewMode;
  filters: TaskFilters;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  presence: PresenceUser[];
  setView: (view: ViewMode) => void;
  setStatus: (taskId: string, status: TaskStatus) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  clearFilters: () => void;
  toggleSort: (column: SortColumn) => void;
  setPresence: (presence: PresenceUser[]) => void;
}

const defaultFilters: TaskFilters = {
  statuses: [],
  priorities: [],
  assigneeIds: [],
  dueFrom: '',
  dueTo: '',
};

const priorityRank: Record<TaskPriority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export const useTaskStore = create<TaskState>((set) => ({
  tasks: generateSeedTasks(),
  view: 'kanban',
  filters: defaultFilters,
  sortColumn: 'dueDate',
  sortDirection: 'asc',
  presence: users.slice(0, 3).map((u, idx) => ({
    id: `presence-${u.id}`,
    name: u.name,
    color: u.color,
    taskId: `task-${idx + 1}`,
  })),
  setView: (view) => set({ view }),
  setStatus: (taskId, status) =>
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, status } : task)),
    })),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  clearFilters: () => set({ filters: defaultFilters }),
  toggleSort: (column) =>
    set((state) => {
      if (state.sortColumn !== column) {
        return { sortColumn: column, sortDirection: 'asc' };
      }
      return { sortDirection: state.sortDirection === 'asc' ? 'desc' : 'asc' };
    }),
  setPresence: (presence) => set({ presence }),
}));

export const getFilteredTasks = (tasks: Task[], filters: TaskFilters) =>
  tasks.filter((task) => {
    const statusOk = filters.statuses.length === 0 || filters.statuses.includes(task.status);
    const priorityOk =
      filters.priorities.length === 0 || filters.priorities.includes(task.priority);
    const assigneeOk =
      filters.assigneeIds.length === 0 || filters.assigneeIds.includes(task.assigneeId);
    const fromOk = !filters.dueFrom || toDate(task.dueDate) >= toDate(filters.dueFrom);
    const toOk = !filters.dueTo || toDate(task.dueDate) <= toDate(filters.dueTo);
    return statusOk && priorityOk && assigneeOk && fromOk && toOk;
  });

export const getSortedTasks = (
  tasks: Task[],
  column: SortColumn,
  direction: SortDirection
) => {
  const sorted = [...tasks].sort((a, b) => {
    if (column === 'title') return a.title.localeCompare(b.title);
    if (column === 'priority') return priorityRank[b.priority] - priorityRank[a.priority];
    return toDate(a.dueDate).getTime() - toDate(b.dueDate).getTime();
  });

  return direction === 'asc' ? sorted : sorted.reverse();
};
