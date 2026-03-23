export const toDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const isOverdue = (value: string) => {
  const due = toDate(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
};

export const dayDiff = (a: Date, b: Date) =>
  Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));

export const getDueLabel = (value: string) => {
  const due = toDate(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = dayDiff(today, due);

  if (diff === 0) return 'Due Today';
  if (diff > 7) return `${diff} days overdue`;
  return due.toLocaleDateString();
};

export const monthDays = (year: number, monthIndex: number) => {
  const days = new Date(year, monthIndex + 1, 0).getDate();
  return Array.from({ length: days }, (_, i) => i + 1);
};
