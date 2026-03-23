import { useEffect, useMemo } from 'react';
import { useTaskStore, getFilteredTasks, getSortedTasks } from './store/useTaskStore';
import { users } from './utils/dataGenerator';
import type { PresenceUser, TaskFilters, ViewMode } from './types';
import { KanbanView } from './components/KanbanView';
import { ListView } from './components/ListView';
import { TimelineView } from './components/TimelineView';
import { FilterBar } from './components/FilterBar';
import { initials } from './utils/ui';

const parseList = <T extends string>(params: URLSearchParams, key: string, valid: T[]): T[] => {
  const raw = params.get(key);
  if (!raw) return [];
  return raw.split(',').filter((item): item is T => valid.includes(item as T));
};

const parseFiltersFromUrl = (): TaskFilters => {
  const params = new URLSearchParams(window.location.search);
  return {
    statuses: parseList(params, 'status', ['todo', 'in_progress', 'in_review', 'done']),
    priorities: parseList(params, 'priority', ['critical', 'high', 'medium', 'low']),
    assigneeIds: parseList(params, 'assignee', users.map((u) => u.id)),
    dueFrom: params.get('dueFrom') ?? '',
    dueTo: params.get('dueTo') ?? '',
  };
};

const serializeFiltersToUrl = (filters: TaskFilters) => {
  const params = new URLSearchParams();
  if (filters.statuses.length) params.set('status', filters.statuses.join(','));
  if (filters.priorities.length) params.set('priority', filters.priorities.join(','));
  if (filters.assigneeIds.length) params.set('assignee', filters.assigneeIds.join(','));
  if (filters.dueFrom) params.set('dueFrom', filters.dueFrom);
  if (filters.dueTo) params.set('dueTo', filters.dueTo);
  const query = params.toString();
  return query ? `?${query}` : window.location.pathname;
};

const nextPresence = (current: PresenceUser[], taskIds: string[]) =>
  current.map((user) => {
    if (taskIds.length === 0) return user;
    const randomTask = taskIds[Math.floor(Math.random() * taskIds.length)];
    return { ...user, taskId: randomTask };
  });

const viewLabels: Record<ViewMode, string> = {
  kanban: 'Kanban',
  list: 'List',
  timeline: 'Timeline',
};

export default function App() {
  const {
    tasks,
    filters,
    view,
    setView,
    setFilters,
    clearFilters,
    sortColumn,
    sortDirection,
    toggleSort,
    setStatus,
    presence,
    setPresence,
  } = useTaskStore();

  useEffect(() => {
    setFilters(parseFiltersFromUrl());
    const onPop = () => setFilters(parseFiltersFromUrl());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [setFilters]);

  useEffect(() => {
    const nextUrl = serializeFiltersToUrl(filters);
    window.history.pushState({}, '', nextUrl);
  }, [filters]);

  const filteredTasks = useMemo(() => getFilteredTasks(tasks, filters), [tasks, filters]);
  const sortedTasks = useMemo(
    () => getSortedTasks(filteredTasks, sortColumn, sortDirection),
    [filteredTasks, sortColumn, sortDirection]
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      const targetCount = 2 + Math.floor(Math.random() * 3);
      const currentPool = users.slice(0, targetCount);
      const active = currentPool.map((user, index) => ({
        id: `presence-${user.id}-${index}`,
        name: user.name,
        color: user.color,
        taskId: filteredTasks[Math.floor(Math.random() * (filteredTasks.length || 1))]?.id ?? 'task-1',
      }));
      setPresence(nextPresence(active, filteredTasks.map((t) => t.id)));
    }, 2400);
    return () => window.clearInterval(timer);
  }, [filteredTasks, setPresence]);

  const hasActiveFilters =
    filters.statuses.length > 0 ||
    filters.priorities.length > 0 ||
    filters.assigneeIds.length > 0 ||
    Boolean(filters.dueFrom) ||
    Boolean(filters.dueTo);

  const doneCount = filteredTasks.filter((task) => task.status === 'done').length;
  const overdueCount = filteredTasks.filter((task) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(task.dueDate) < today && task.status !== 'done';
  }).length;

  const viewMap: Record<ViewMode, React.JSX.Element> = {
    kanban: <KanbanView tasks={filteredTasks} onStatusChange={setStatus} presence={presence} />,
    list: (
      <ListView
        tasks={sortedTasks}
        onSort={toggleSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onStatusChange={setStatus}
        onClearFilters={clearFilters}
      />
    ),
    timeline: <TimelineView tasks={filteredTasks} />,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 p-4 md:p-6">
      <header className="mb-4 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="m-0 text-2xl font-bold tracking-tight text-slate-900">Velozity Project Tracker</h1>
          <p className="mt-1 text-sm text-slate-600">
            {presence.length} people are viewing this board right now
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="min-w-28 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <span>Tasks in view</span>
              <strong className="block text-lg">{filteredTasks.length}</strong>
            </div>
            <div className="min-w-28 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <span>Completed</span>
              <strong className="block text-lg">{doneCount}</strong>
            </div>
            <div className="min-w-28 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <span>Overdue</span>
              <strong className="block text-lg">{overdueCount}</strong>
            </div>
          </div>
        </div>
        <div className="flex items-center pl-2">
          {presence.slice(0, 4).map((user) => (
            <span
              key={user.id}
              className="-ml-2 grid h-9 w-9 place-items-center rounded-full border-2 border-white text-xs font-semibold text-white shadow"
              style={{ backgroundColor: user.color }}
            >
              {initials(user.name)}
            </span>
          ))}
        </div>
      </header>

      <FilterBar
        users={users}
        filters={filters}
        onChange={setFilters}
        onClear={clearFilters}
        canClear={hasActiveFilters}
      />

      <nav className="mb-4 flex gap-2">
        {(['kanban', 'list', 'timeline'] as ViewMode[]).map((item) => (
          <button
            key={item}
            className={
              item === view
                ? 'rounded-lg border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white'
                : 'rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50'
            }
            onClick={() => setView(item)}
            type="button"
          >
            {viewLabels[item]}
          </button>
        ))}
      </nav>

      <main className="min-h-[620px]">{viewMap[view]}</main>
    </div>
  );
}
