export function weekStart(date = new Date()): Date {
  const day = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const weekday = (day.getUTCDay() + 6) % 7;
  day.setUTCDate(day.getUTCDate() - weekday);
  return day;
}

export function dateRange(period: string): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date(end);
  if (period === "today") start.setUTCHours(0, 0, 0, 0);
  else if (period === "7d") start.setUTCDate(start.getUTCDate() - 7);
  else if (period === "30d") start.setUTCDate(start.getUTCDate() - 30);
  else if (period === "quarter") start.setUTCDate(start.getUTCDate() - 90);
  else start.setUTCDate(start.getUTCDate() - 30);
  return { start, end };
}
