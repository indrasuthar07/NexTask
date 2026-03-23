import { useMemo, useState } from 'react';
import type { Task, TaskStatus } from '../types';
import { users } from '../utils/dataGenerator';
import { getDueLabel } from '../utils/date';

interface ListViewProps {
  tasks: Task[];
  onSort: (column: 'title' | 'priority' | 'dueDate') => void;
  sortColumn: 'title' | 'priority' | 'dueDate';
  sortDirection: 'asc' | 'desc';
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onClearFilters: () => void;
}

const rowHeight = 58;
const viewportHeight = 540;
const bufferRows = 5;

export const ListView = ({
  tasks,
  onSort,
  sortColumn,
  sortDirection,
  onStatusChange,
  onClearFilters,
}: ListViewProps) => {
  const [scrollTop, setScrollTop] = useState(0);
  const totalHeight = tasks.length * rowHeight;
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - bufferRows);
  const visibleCount = Math.ceil(viewportHeight / rowHeight) + bufferRows * 2;
  const end = Math.min(tasks.length, start + visibleCount);

  const visible = useMemo(() => tasks.slice(start, end), [tasks, start, end]);

  const sortMarker = (column: 'title' | 'priority' | 'dueDate') =>
    sortColumn === column ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : '';

  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center shadow-sm">
        <p className="text-slate-600">No tasks match these filters.</p>
        <button
          className="mt-3 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-400"
          onClick={onClearFilters}
          type="button"
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid h-14 grid-cols-[2.4fr_1fr_1fr_1fr] items-center gap-2 border-b border-slate-200 bg-slate-50 px-3">
        <button
          onClick={() => onSort('title')}
          className={`text-left text-sm font-semibold ${sortColumn === 'title' ? 'text-indigo-700' : 'text-slate-700'}`}
          type="button"
        >
          Title{sortMarker('title')}
        </button>
        <button
          onClick={() => onSort('priority')}
          className={`text-left text-sm font-semibold ${
            sortColumn === 'priority' ? 'text-indigo-700' : 'text-slate-700'
          }`}
          type="button"
        >
          Priority{sortMarker('priority')}
        </button>
        <button
          onClick={() => onSort('dueDate')}
          className={`text-left text-sm font-semibold ${
            sortColumn === 'dueDate' ? 'text-indigo-700' : 'text-slate-700'
          }`}
          type="button"
        >
          Due Date{sortMarker('dueDate')}
        </button>
        <span className="text-sm font-semibold text-slate-700">Status</span>
      </div>
      <div
        className="overflow-auto"
        style={{ height: viewportHeight }}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${start * rowHeight}px)` }}>
            {visible.map((task) => {
              const assignee = users.find((u) => u.id === task.assigneeId);
              return (
                <div
                  key={task.id}
                  className="grid grid-cols-[2.4fr_1fr_1fr_1fr] items-center gap-2 border-b border-slate-100 px-3"
                  style={{ height: rowHeight }}
                >
                  <div>
                    <strong>{task.title}</strong>
                    <div className="text-xs text-slate-500">{assignee?.name}</div>
                  </div>
                  <div className="text-sm capitalize text-slate-700">{task.priority}</div>
                  <div>{getDueLabel(task.dueDate)}</div>
                  <select
                    value={task.status}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700"
                    onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="in_review">In Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
