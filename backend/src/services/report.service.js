"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportSummary = reportSummary;
exports.exportReport = exportReport;
const pdfkit_1 = __importDefault(require("pdfkit"));
const sync_1 = require("csv-stringify/sync");
const User_1 = require("../models/User");
const PulseResponse_1 = require("../models/PulseResponse");
const TeamActivity_1 = require("../models/TeamActivity");
const week_1 = require("../utils/week");
const errors_1 = require("../utils/errors");
async function reportSummary(organizationId, period, metrics, minResponses = 5, teamId) {
    const { start, end } = (0, week_1.dateRange)(period);
    const pulseRange = (0, week_1.pulseWeekRange)(period);
    const [activity, pulse] = await Promise.all([
        TeamActivity_1.TeamActivity.aggregate([
            { $match: { organizationId, ...(teamId ? { teamId } : {}), startedAt: { $gte: start, $lte: end }, status: "stopped" } },
            { $group: {
                    _id: null,
                    activeSeconds: { $sum: "$activeSeconds" },
                    idleSeconds: { $sum: "$idleSeconds" },
                    productiveSeconds: { $sum: { $cond: [{ $eq: ["$category", "Productive"] }, "$activeSeconds", 0] } },
                    sessions: { $sum: 1 },
                    users: { $addToSet: "$userId" },
                } },
        ]),
        PulseResponse_1.PulseResponse.aggregate([
            { $match: { organizationId, ...(teamId ? { teamId } : {}), weekStart: { $gte: pulseRange.start, $lte: pulseRange.end } } },
            { $group: { _id: { teamId: "$teamId", weekStart: "$weekStart" }, count: { $sum: 1 }, mood: { $avg: "$mood" }, stress: { $avg: "$stress" }, workload: { $avg: "$workload" } } },
        ]),
    ]);
    const aggregate = activity[0] ?? { activeSeconds: 0, idleSeconds: 0, sessions: 0 };
    const visiblePulseGroups = pulse.filter((group) => group.count >= minResponses);
    const atRisk = visiblePulseGroups.filter((group) => group.stress + group.workload + (6 - group.mood) >= 11).length;
    const totalPulse = visiblePulseGroups.reduce((sum, group) => sum + group.count, 0);
    const teamCount = await User_1.User.distinct("teamId", { organizationId, teamId: { $ne: null }, ...(teamId ? { teamId } : {}) }).then((ids) => ids.length);
    const activityVisible = (aggregate.users?.length ?? 0) >= minResponses;
    const activeSeconds = activityVisible ? aggregate.activeSeconds : 0;
    const idleSeconds = activityVisible ? aggregate.idleSeconds : 0;
    return {
        period,
        metrics,
        activeHours: Number((activeSeconds / 3600).toFixed(1)),
        idleHours: Number((idleSeconds / 3600).toFixed(1)),
        productivity: activeSeconds ? Math.round((aggregate.productiveSeconds / activeSeconds) * 100) : 0,
        pulseParticipationResponses: totalPulse,
        riskTeams: atRisk,
        teams: teamCount,
        sessions: activityVisible ? aggregate.sessions : 0,
        generatedAt: new Date().toISOString(),
    };
}
async function exportReport(organizationId, subscription, period, metrics, format, minResponses = 5, teamId) {
    if (subscription.status !== "active" || !["Team", "Business"].includes(subscription.plan)) {
        throw (0, errors_1.paymentRequired)("Report generation requires an active Team or Business subscription");
    }
    const summary = await reportSummary(organizationId, period, metrics, minResponses, teamId);
    const rows = [["Period", summary.period]];
    const selected = {
        "Active time (hours)": summary.activeHours,
        "Idle time (hours)": summary.idleHours,
        Productivity: `${summary.productivity}%`,
        "Pulse responses (eligible groups only)": summary.pulseParticipationResponses,
        "Teams requiring support": summary.riskTeams,
        "Activity sessions": summary.sessions,
    };
    const mapping = {
        "Active time": ["Active time (hours)"],
        "Idle time": ["Idle time (hours)"],
        Productivity: ["Productivity"],
        "Team pulse": ["Pulse responses (eligible groups only)"],
        "Burnout risk": ["Teams requiring support"],
    };
    for (const metric of metrics)
        for (const key of mapping[metric] ?? [])
            rows.push([key, selected[key]]);
    if (format === "csv")
        return { contentType: "text/csv; charset=utf-8", filename: `pulse-report-${period}.csv`, content: (0, sync_1.stringify)(rows, { header: true, columns: ["Metric", "Value"] }) };
    const pdf = new pdfkit_1.default({ size: "A4", margin: 52, info: { Title: "PULSE report", Author: "PULSE" } });
    const chunks = [];
    const finished = new Promise((resolve, reject) => {
        pdf.on("data", (chunk) => chunks.push(chunk));
        pdf.on("end", () => resolve(Buffer.concat(chunks)));
        pdf.on("error", reject);
    });
    pdf.fontSize(22).text("PULSE wellbeing report");
    pdf.moveDown().fontSize(11).fillColor("#555").text(`Period: ${period} · Generated ${new Date().toISOString()}`);
    pdf.moveDown().fillColor("#111");
    for (const [label, value] of rows.slice(1))
        pdf.fontSize(12).text(`${label}: ${value}`);
    pdf.moveDown().fontSize(9).fillColor("#666").text(`Aggregated and anonymized. Groups below ${minResponses} responses are excluded. This report is not an individual performance assessment.`);
    pdf.end();
    return { contentType: "application/pdf", filename: `pulse-report-${period}.pdf`, content: await finished };
}
