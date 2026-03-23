import type { Task, TaskPriority, TaskStatus, User } from '../types';

const titles = [
  'Finalize onboarding flow',
  'Implement audit logs',
  'Refactor auth middleware',
  'Design KPI dashboard',
  'Add search filters',
  'Improve API retries',
  'Write regression tests',
  'Create release checklist',
  'Fix payment edge case',
  'Optimize image pipeline',
  'Update billing copy',
  'Migrate notification service',
  'Clean legacy endpoints',
  'Patch timezone bug',
  'Build role permissions',
  'Review sprint metrics',
];

export const users: User[] = [
  { id: 'u1', name: 'Aarav Shah', color: '#4f46e5' },
  { id: 'u2', name: 'Ira Mehta', color: '#0f766e' },
  { id: 'u3', name: 'Riya Patel', color: '#be185d' },
  { id: 'u4', name: 'Kabir Jain', color: '#ca8a04' },
  { id: 'u5', name: 'Neel Gupta', color: '#2563eb' },
  { id: 'u6', name: 'Sana Khan', color: '#7c3aed' },
];

const statuses: TaskStatus[] = ['todo', 'in_progress', 'in_review', 'done'];
const priorities: TaskPriority[] = ['critical', 'high', 'medium', 'low'];

const random = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

export const generateSeedTasks = (count = 600): Task[] => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return Array.from({ length: count }, (_, idx) => {
    const dueOffset = Math.floor(Math.random() * 45) - 15;
    const dueDate = new Date(monthStart);
    dueDate.setDate(monthStart.getDate() + dueOffset + (idx % 14));

    const missingStart = Math.random() < 0.16;
    let startDate: Date | null = null;
    if (!missingStart) {
      const startOffset = Math.floor(Math.random() * 12) + 1;
      startDate = new Date(dueDate);
      startDate.setDate(dueDate.getDate() - startOffset);
    }

    return {
      id: `task-${idx + 1}`,
      title: `${random(titles)} #${idx + 1}`,
      assigneeId: random(users).id,
      status: random(statuses),
      priority: random(priorities),
      startDate: startDate ? formatDate(startDate) : null,
      dueDate: formatDate(dueDate),
    };
  });
};