import { useMemo } from 'react';
import type { Task, TaskPriority } from '../types';
import { monthDays, toDate } from '../utils/date';

interface TimelineProps {
  tasks: Task[];
}

const priorityColor: Record<TaskPriority, string> = {
  critical: '#dc2626',
  high: '#f97316',
  medium: '#2563eb',
  low: '#16a34a',
};

export const TimelineView = ({ tasks }: TimelineProps) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const days = monthDays(year, month);
  const dayWidth = 34;

  const todayX = now.getDate() * dayWidth;

  const rows = useMemo(
    () =>
      tasks.map((task) => {
        const due = toDate(task.dueDate);
        const start = task.startDate ? toDate(task.startDate) : due;
        const startDay = Math.max(1, start.getDate());
        const dueDay = Math.max(startDay, due.getDate());
        return {
          ...task,
          left: (startDay - 1) * dayWidth,
          width: Math.max(dayWidth, (dueDay - startDay + 1) * dayWidth),
        };
      }),
    [tasks]
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-auto">
        <div className="relative" style={{ width: days.length * dayWidth + 280 }}>
          <div className="flex border-b border-slate-200 bg-slate-50">
            <div className="w-[280px] shrink-0 px-3 py-2 text-sm font-semibold text-slate-700">Task</div>
            <div className="flex" style={{ width: days.length * dayWidth }}>
              {days.map((d) => (
                <span
                  key={d}
                  className="inline-flex justify-center border-l border-slate-200 py-2 text-xs text-slate-600"
                  style={{ width: dayWidth }}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
          <div className="absolute bottom-0 top-0 z-10 w-0.5 bg-rose-500" style={{ left: 280 + todayX }} />
          {rows.map((task) => (
            <div key={task.id} className="flex border-b border-slate-100">
              <div className="w-[280px] shrink-0 truncate px-3 py-2 text-sm text-slate-700">{task.title}</div>
              <div className="relative flex h-10 items-center border-l border-slate-100" style={{ width: days.length * dayWidth }}>
                <div
                  className="h-3 rounded-full shadow-inner"
                  style={{ marginLeft: task.left, width: task.width, backgroundColor: priorityColor[task.priority] }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
