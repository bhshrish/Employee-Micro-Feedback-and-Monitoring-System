"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.weekStart = weekStart;
exports.dateRange = dateRange;
function weekStart(date) {
    if (date === void 0) { date = new Date(); }
    var day = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    var weekday = (day.getUTCDay() + 6) % 7;
    day.setUTCDate(day.getUTCDate() - weekday);
    return day;
}
function dateRange(period) {
    var end = new Date();
    var start = new Date(end);
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
    return { start: start, end: end };
}
