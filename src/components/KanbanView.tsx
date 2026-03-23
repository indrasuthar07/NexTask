import { useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { PresenceUser, Task, TaskPriority, TaskStatus } from '../types';
import { users } from '../utils/dataGenerator';
import { getDueLabel, isOverdue } from '../utils/date';
import { initials } from '../utils/ui';

const statusOrder: { label: string; value: TaskStatus }[] = [
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Done', value: 'done' },
];

const priorityColor: Record<TaskPriority, string> = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#2563eb',
  low: '#16a34a',
};

interface KanbanProps {
  tasks: Task[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  presence: PresenceUser[];
}

interface DragState {
  taskId: string;
  originStatus: TaskStatus;
  originX: number;
  originY: number;
  x: number;
  y: number;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  overStatus: TaskStatus | null;
}

export const KanbanView = ({ tasks, onStatusChange, presence }: KanbanProps) => {
  const [drag, setDrag] = useState<DragState | null>(null);
  const [snapBack, setSnapBack] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const grouped = useMemo(
    () =>
      statusOrder.reduce<Record<TaskStatus, Task[]>>((acc, status) => {
        acc[status.value] = tasks.filter((t) => t.status === status.value);
        return acc;
      }, { todo: [], in_progress: [], in_review: [], done: [] }),
    [tasks]
  );

  const presenceByTask = useMemo(
    () =>
      presence.reduce<Record<string, PresenceUser[]>>((acc, user) => {
        acc[user.taskId] = [...(acc[user.taskId] ?? []), user];
        return acc;
      }, {}),
    [presence]
  );

  const onPointerMove = (event: PointerEvent) => {
    const current = dragRef.current;
    if (!current) return;
    const x = event.clientX - current.offsetX;
    const y = event.clientY - current.offsetY;
    const over = document
      .elementsFromPoint(event.clientX, event.clientY)
      .find((el) => (el as HTMLElement).dataset.dropStatus) as HTMLElement | undefined;
    const overStatus = (over?.dataset.dropStatus as TaskStatus | undefined) ?? null;
    const next = { ...current, x, y, overStatus };
    dragRef.current = next;
    setDrag(next);
  };

  const onPointerUp = () => {
    const current = dragRef.current;
    if (!current) return;

    if (current.overStatus) {
      onStatusChange(current.taskId, current.overStatus);
    } else {
      setSnapBack(current);
      window.requestAnimationFrame(() => {
        setSnapBack((prev) => (prev ? { ...prev, x: prev.originX, y: prev.originY } : null));
      });
      window.setTimeout(() => setSnapBack(null), 180);
    }

    dragRef.current = null;
    setDrag(null);
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
  };

  const beginDrag = (event: ReactPointerEvent<HTMLElement>, task: Task) => {
    const card = event.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    const next: DragState = {
      taskId: task.id,
      originStatus: task.status,
      originX: rect.left,
      originY: rect.top,
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      overStatus: null,
    };
    dragRef.current = next;
    setDrag(next);
    card.setPointerCapture(event.pointerId);
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };

  return (
    <section className="grid gap-3 lg:grid-cols-4 md:grid-cols-2">
      {statusOrder.map((column) => (
        <article
          key={column.value}
          data-drop-status={column.value}
          className={`min-h-[560px] rounded-2xl border bg-white p-3 shadow-sm ${
            drag?.overStatus === column.value ? 'border-indigo-300 bg-indigo-50/40' : 'border-slate-200'
          }`}
        >
          <header className="flex items-center justify-between">
            <h3 className="m-0 text-xs font-semibold uppercase tracking-[0.4px] text-slate-600">
              {column.label}
            </h3>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700">
              {grouped[column.value].length}
            </span>
          </header>
          <div className="mt-2 flex max-h-[500px] flex-col gap-2 overflow-auto pr-1">
            {grouped[column.value].length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 px-3 py-8 text-center text-sm text-slate-500">
                No tasks here yet
              </div>
            )}
            {grouped[column.value].map((task) => {
              const assignee = users.find((u) => u.id === task.assigneeId);
              const viewers = presenceByTask[task.id] ?? [];
              const hidden = drag?.taskId === task.id;
              return (
                <div key={task.id} className={hidden ? 'pointer-events-none' : ''}>
                  {hidden && (
                    <div
                      style={{ height: drag?.height ?? 92 }}
                      className="rounded-xl border border-dashed border-indigo-300 bg-indigo-100/50"
                    />
                  )}
                  <article
                    className="rounded-xl border border-slate-200 bg-white p-3 transition hover:border-indigo-300 hover:shadow-md"
                    onPointerDown={(e) => beginDrag(e, task)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="mb-2 text-sm font-semibold text-slate-900">{task.title}</div>
                    <div className="flex items-center justify-between">
                      <span
                        className="grid h-7 w-7 place-items-center rounded-full text-[11px] font-semibold text-white"
                        style={{ backgroundColor: assignee?.color }}
                      >
                        {initials(assignee?.name ?? 'NA')}
                      </span>
                      <span
                        className="rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase"
                        style={{ color: priorityColor[task.priority], borderColor: priorityColor[task.priority] }}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <div className={`mt-2 text-xs ${isOverdue(task.dueDate) ? 'text-red-600' : 'text-slate-600'}`}>
                      {getDueLabel(task.dueDate)}
                    </div>
                    {viewers.length > 0 && (
                      <div className="mt-2 flex items-center">
                        {viewers.slice(0, 2).map((viewer) => (
                          <span
                            key={viewer.id}
                            className="-ml-1 grid h-5 w-5 place-items-center rounded-full border border-white text-[9px] font-semibold text-white"
                            style={{ backgroundColor: viewer.color }}
                          >
                            {initials(viewer.name)}
                          </span>
                        ))}
                        {viewers.length > 2 && (
                          <span className="-ml-1 grid h-5 w-5 place-items-center rounded-full border border-white bg-slate-700 text-[9px] font-semibold text-white">
                            +{viewers.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </article>
                </div>
              );
            })}
          </div>
        </article>
      ))}

      {(drag || snapBack) && (
        <article
          className={`pointer-events-none fixed left-0 top-0 z-[999] rounded-xl border border-indigo-500 bg-white/85 shadow-2xl ${
            snapBack ? 'transition-transform duration-150 ease-out' : 'transition-transform duration-75 ease-linear'
          }`}
          style={{
            width: (drag ?? snapBack)?.width,
            height: (drag ?? snapBack)?.height,
            transform: `translate(${(drag ?? snapBack)?.x}px, ${(drag ?? snapBack)?.y}px)`,
          }}
        />
      )}
    </section>
  );
};
