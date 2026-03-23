import type { TaskFilters, TaskPriority, TaskStatus, User } from '../types';

interface FilterBarProps {
  users: User[];
  filters: TaskFilters;
  onChange: (filters: Partial<TaskFilters>) => void;
  onClear: () => void;
  canClear: boolean;
}

const statusOptions: { label: string; value: TaskStatus }[] = [
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Done', value: 'done' },
];

const priorityOptions: { label: string; value: TaskPriority }[] = [
  { label: 'Critical', value: 'critical' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

const MultiSelect = <T extends string>({
  title,
  selected,
  options,
  onToggle,
}: {
  title: string;
  selected: T[];
  options: { label: string; value: T }[];
  onToggle: (value: T) => void;
}) => (
  <div>
    <span className="mb-1 block text-xs font-medium text-slate-600">{title}</span>
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          className={
            selected.includes(opt.value)
              ? 'rounded-lg border border-indigo-400 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700'
              : 'rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-400'
          }
          onClick={() => onToggle(opt.value)}
          type="button"
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

export const FilterBar = ({ users, filters, onChange, onClear, canClear }: FilterBarProps) => (
  <section className="mb-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-2">
    <MultiSelect
      title="Status"
      selected={filters.statuses}
      options={statusOptions}
      onToggle={(value) =>
        onChange({
          statuses: filters.statuses.includes(value)
            ? filters.statuses.filter((s) => s !== value)
            : [...filters.statuses, value],
        })
      }
    />
    <MultiSelect
      title="Priority"
      selected={filters.priorities}
      options={priorityOptions}
      onToggle={(value) =>
        onChange({
          priorities: filters.priorities.includes(value)
            ? filters.priorities.filter((p) => p !== value)
            : [...filters.priorities, value],
        })
      }
    />
    <MultiSelect
      title="Assignee"
      selected={filters.assigneeIds}
      options={users.map((u) => ({ label: u.name, value: u.id }))}
      onToggle={(value) =>
        onChange({
          assigneeIds: filters.assigneeIds.includes(value)
            ? filters.assigneeIds.filter((id) => id !== value)
            : [...filters.assigneeIds, value],
        })
      }
    />
    <div>
      <span className="mb-1 block text-xs font-medium text-slate-600">Due date range</span>
      <div className="flex flex-wrap gap-2">
        <input
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none"
          type="date"
          value={filters.dueFrom}
          onChange={(e) => onChange({ dueFrom: e.target.value })}
        />
        <input
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none"
          type="date"
          value={filters.dueTo}
          onChange={(e) => onChange({ dueTo: e.target.value })}
        />
      </div>
    </div>
    {canClear && (
      <button
        className="self-end justify-self-start rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-400"
        onClick={onClear}
        type="button"
      >
        Clear all filters
      </button>
    )}
  </section>
);
