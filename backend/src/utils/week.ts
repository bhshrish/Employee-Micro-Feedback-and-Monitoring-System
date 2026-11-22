export function weekStart(date: Date = new Date()): Date {
    const day = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const weekday = (day.getUTCDay() + 6) % 7;
    day.setUTCDate(day.getUTCDate() - weekday);
    return day;
}
export function dateRange(period: "today" | "7d" | "30d" | "quarter"): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date(end);
    if (period === "today")
        start.setUTCHours(0, 0, 0, 0);
    else if (period === "7d")
        start.setUTCDate(start.getUTCDate() - 7);
    else if (period === "30d")
        start.setUTCDate(start.getUTCDate() - 30);
    else if (period === "quarter")
        start.setUTCDate(start.getUTCDate() - 90);
    else
        start.setUTCDate(start.getUTCDate() - 30);
    return { start, end };
}
export function pulseWeekRange(period: "today" | "7d" | "30d" | "quarter"): { start: Date; end: Date } {
    const { start, end } = dateRange(period);
    return { start: weekStart(start), end: weekStart(end) };
}
