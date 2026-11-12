"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitPulse = submitPulse;
exports.hasSubmitted = hasSubmitted;
exports.teamPulse = teamPulse;
exports.listAlerts = listAlerts;
exports.updateAlert = updateAlert;
exports.scoreTeamAlerts = scoreTeamAlerts;
exports.analyticsTrends = analyticsTrends;
exports.analyticsHeatmap = analyticsHeatmap;
exports.organizationMinGroupSize = organizationMinGroupSize;
exports.analyticsTeams = analyticsTeams;
exports.analyticsTeamTrend = analyticsTeamTrend;
const mongoose_1 = require("mongoose");
const Alert_1 = require("../models/Alert");
const PulseReceipt_1 = require("../models/PulseReceipt");
const PulseResponse_1 = require("../models/PulseResponse");
const Team_1 = require("../models/Team");
const User_1 = require("../models/User");
const Organization_1 = require("../models/Organization");
const EmployeeTool_1 = require("../models/EmployeeTool");
const errors_1 = require("../utils/errors");
const week_1 = require("../utils/week");
const burnout_1 = require("./burnout");
const logger_1 = require("../utils/logger");
async function submitPulse(scope, input) {
    if (!scope.teamId)
        throw (0, errors_1.notFound)("Assign a team before submitting the weekly pulse");
    if (!await Team_1.Team.exists({ _id: scope.teamId, organizationId: scope.organizationId, archivedAt: null })) {
        throw (0, errors_1.notFound)("Assign an active team before submitting the weekly pulse");
    }
    const week = (0, week_1.weekStart)();
    try {
        await PulseReceipt_1.PulseReceipt.create({
            organizationId: scope.organizationId,
            teamId: scope.teamId,
            userId: scope.userId,
            weekStart: week,
            expiresAt: new Date(week.getTime() + 14 * 86_400_000),
        });
    }
    catch (error) {
        if (error && typeof error === "object" && "code" in error && error.code === 11000) {
            throw (0, errors_1.conflict)("You have already submitted this week's pulse", "PULSE_ALREADY_SUBMITTED");
        }
        throw error;
    }
    try {
        await PulseResponse_1.PulseResponse.create({
            organizationId: scope.organizationId,
            teamId: scope.teamId,
            weekStart: week,
            mood: input.mood,
            stress: input.stress,
            workload: input.workload,
        });
    }
    catch (error) {
        await PulseReceipt_1.PulseReceipt.deleteOne({ userId: scope.userId, weekStart: week });
        throw error;
    }
    try {
        await scoreTeamAlerts(scope.organizationId);
    }
    catch (error) {
        logger_1.logger.error({ err: error }, "Failed to evaluate team wellbeing alerts after pulse submission");
    }
    return { submitted: true, submittedAt: new Date().toISOString(), weekStart: week.toISOString() };
}
async function hasSubmitted(userId) {
    return Boolean(await PulseReceipt_1.PulseReceipt.exists({ userId, weekStart: (0, week_1.weekStart)() }));
}
async function teamPulse(organizationId, teamId, minResponses = 5) {
    const currentWeek = (0, week_1.weekStart)();
    const teams = await Team_1.Team.find({
        organizationId,
        archivedAt: null,
        ...(teamId ? { _id: teamId } : {}),
    }).select("_id name").lean();
    const result = [];
    for (const team of teams) {
        const weekly = await PulseResponse_1.PulseResponse.aggregate([
            { $match: { organizationId, teamId: team._id, weekStart: { $gte: new Date(currentWeek.getTime() - 6 * 7 * 86_400_000), $lte: currentWeek } } },
            { $group: { _id: "$weekStart", responses: { $sum: 1 }, mood: { $avg: "$mood" }, stress: { $avg: "$stress" }, workload: { $avg: "$workload" } } },
            { $sort: { _id: 1 } },
        ]);
        const latest = weekly.find((entry) => new Date(entry._id).getTime() === currentWeek.getTime());
        if (!latest || latest.responses < minResponses)
            continue;
        const memberCount = await User_1.User.countDocuments({ organizationId, teamId: team._id });
        const trend = weekly.filter((entry) => entry.responses >= minResponses).map((entry) => ({
            weekStart: entry._id,
            responses: entry.responses,
            mood: Number(entry.mood.toFixed(2)),
            stress: Number(entry.stress.toFixed(2)),
            workload: Number(entry.workload.toFixed(2)),
        }));
        result.push({
            teamId: team._id.toString(),
            name: team.name,
            responses: latest.responses,
            participation: memberCount ? Math.min(100, Math.round((latest.responses / memberCount) * 100)) : 0,
            mood: Number(latest.mood.toFixed(1)),
            stress: Number(latest.stress.toFixed(1)),
            workload: Number(latest.workload.toFixed(1)),
            trend,
        });
    }
    return result;
}
async function listAlerts(organizationId, status, teamId) {
    return Alert_1.Alert.find({ organizationId, ...(status ? { status } : {}), ...(teamId ? { teamId } : {}) })
        .populate("teamId", "name")
        .sort({ createdAt: -1 })
        .lean();
}
async function updateAlert(organizationId, alertId, status, acknowledgedBy, teamId) {
    if (!mongoose_1.Types.ObjectId.isValid(alertId))
        throw (0, errors_1.notFound)("Alert not found");
    const alert = await Alert_1.Alert.findOneAndUpdate({ _id: alertId, organizationId, ...(teamId ? { teamId } : {}) }, { $set: { status, acknowledgedBy: status === "acknowledged" ? acknowledgedBy : null } }, { new: true });
    if (!alert)
        throw (0, errors_1.notFound)("Alert not found");
    return alert;
}
async function teamOperationalWorkload(organizationId, teamId, week) {
    const members = await User_1.User.find({ organizationId, teamId, isActive: { $ne: false } }).select("_id").lean();
    if (!members.length)
        return null;
    const weekEnd = new Date(week.getTime() + 7 * 86_400_000);
    const tools = await EmployeeTool_1.EmployeeTool.find({
        organizationId,
        userId: { $in: members.map((member) => member._id) },
        $or: [
            { kind: "planner_task", startsAt: { $gte: week, $lt: weekEnd } },
            { kind: "meeting", startsAt: { $gte: week, $lt: weekEnd } },
            { kind: "leave_request", status: "approved", startsAt: { $lt: weekEnd }, endsAt: { $gt: week } },
        ],
    }).select("kind estimatedMinutes startsAt endsAt").lean();
    if (!tools.length)
        return null;
    let plannedMinutes = 0;
    let meetingMinutes = 0;
    let leaveDays = 0;
    for (const tool of tools) {
        if (tool.kind === "planner_task")
            plannedMinutes += tool.estimatedMinutes || 0;
        if (tool.kind === "meeting")
            meetingMinutes += tool.estimatedMinutes || 0;
        if (tool.kind === "leave_request") {
            const overlapStart = Math.max(new Date(tool.startsAt).getTime(), week.getTime());
            const overlapEnd = Math.min(new Date(tool.endsAt).getTime(), weekEnd.getTime());
            leaveDays += Math.max(0, (overlapEnd - overlapStart) / 86_400_000);
        }
    }
    const averageLeaveDays = leaveDays / members.length;
    const capacityHours = members.length * Math.max(8, (5 - Math.min(5, averageLeaveDays)) * 8);
    const plannedAndMeetingHours = (plannedMinutes + meetingMinutes) / 60;
    const loadRatio = plannedAndMeetingHours / capacityHours;
    const workload = Math.min(5, Math.max(1, 1 + loadRatio * 4 + Math.min(0.5, averageLeaveDays * 0.1)));
    return {
        workload,
        plannedMinutes,
        meetingMinutes,
        leaveDays: Number(leaveDays.toFixed(2)),
    };
}
async function scoreTeamAlerts(organizationId, configuredMinResponses) {
    const minResponses = configuredMinResponses ?? await organizationMinGroupSize(organizationId);
    const week = (0, week_1.weekStart)();
    const priorWeek = new Date(week.getTime() - 7 * 86_400_000);
    const fourWeeksAgo = new Date(week.getTime() - 3 * 7 * 86_400_000);
    const teams = await Team_1.Team.find({ organizationId, archivedAt: null }).select("_id name").lean();
    let created = 0;
    for (const team of teams) {
        const values = await PulseResponse_1.PulseResponse.aggregate([
            { $match: { organizationId, teamId: team._id, weekStart: { $gte: fourWeeksAgo, $lte: week } } },
            { $group: { _id: "$weekStart", count: { $sum: 1 }, stress: { $avg: "$stress" }, workload: { $avg: "$workload" }, mood: { $avg: "$mood" } } },
            { $sort: { _id: 1 } },
        ]);
        const current = values.find((row) => new Date(row._id).getTime() === week.getTime());
        if (!current || current.count < minResponses)
            continue;
        const previous = values.find((row) => new Date(row._id).getTime() === priorWeek.getTime());
        const memberCount = await User_1.User.countDocuments({ organizationId, teamId: team._id });
        const currentParticipation = memberCount ? current.count / memberCount : 0;
        const previousParticipation = previous && memberCount ? previous.count / memberCount : undefined;
        const [currentOperations, previousOperations] = await Promise.all([
            teamOperationalWorkload(organizationId, team._id, week),
            previous ? teamOperationalWorkload(organizationId, team._id, priorWeek) : Promise.resolve(null),
        ]);
        const burnout = (0, burnout_1.calculateBurnoutScore)({
            stress: current.stress,
            workload: current.workload,
            mood: current.mood,
            participation: currentParticipation,
            ...(currentOperations ? { operationalWorkload: currentOperations.workload } : {}),
            ...(previous ? {
                previousStress: previous.stress,
                previousWorkload: previous.workload,
                previousMood: previous.mood,
                ...(previousOperations ? { previousOperationalWorkload: previousOperations.workload } : {}),
                ...(previousParticipation !== undefined ? { previousParticipation } : {}),
            } : {}),
        });
        const recent = values.filter((row) => row.count >= minResponses).slice(-4);
        const consecutiveStressIncrease = recent.length === 4 && recent.slice(1).every((row, index) => recent[index].stress > 0 && row.stress >= recent[index].stress * 1.15);
        const candidates = [
            ...(burnout.score >= 40 ? [{
                    type: "burnout_risk",
                    title: `${team.name} wellbeing signals need attention`,
                    detail: "Aggregated stress, workload, mood, participation, and week-over-week change crossed the support threshold.",
                }] : []),
            ...(consecutiveStressIncrease ? [{
                    type: "stress_trend",
                    title: `${team.name} stress has increased for three weeks`,
                    detail: "Average stress has increased by at least 15% for three consecutive eligible weeks.",
                }] : []),
            ...(current.mood <= 2.5 ? [{
                    type: "low_mood",
                    title: `${team.name} mood is low`,
                    detail: "The team's aggregated mood score is at or below 2.5.",
                }] : []),
            ...(previousParticipation !== undefined && previousParticipation >= 0.7 && currentParticipation <= 0.5 ? [{
                    type: "participation_collapse",
                    title: `${team.name} pulse participation has fallen`,
                    detail: "Participation has fallen from at least 70% to 50% or less.",
                }] : []),
        ];
        for (const candidate of candidates) {
            const update = await Alert_1.Alert.updateOne({ organizationId, teamId: team._id, type: candidate.type, status: "open" }, {
                $set: {
                    key: `${team._id.toString()}:${week.toISOString()}:${candidate.type}`,
                    title: candidate.title,
                    detail: candidate.detail,
                    severity: burnout.severity,
                    score: burnout.score,
                    metrics: {
                        ...burnout.components,
                        stress: current.stress,
                        workload: current.workload,
                        mood: current.mood,
                        participation: currentParticipation,
                        ...(currentOperations ? {
                            plannedMinutes: currentOperations.plannedMinutes,
                            meetingMinutes: currentOperations.meetingMinutes,
                            leaveDays: currentOperations.leaveDays,
                        } : {}),
                    },
                },
                $setOnInsert: { organizationId, teamId: team._id, type: candidate.type },
            }, { upsert: true });
            if (update.upsertedCount)
                created += 1;
        }
    }
    return created;
}
async function analyticsTrends(organizationId, teamId, weeks, minResponses) {
    const start = (0, week_1.weekStart)();
    start.setUTCDate(start.getUTCDate() - (weeks - 1) * 7);
    const teams = await Team_1.Team.find({
        organizationId,
        archivedAt: null,
        ...(teamId ? { _id: teamId } : {}),
    }).select("_id name").lean();
    const results = [];
    for (const team of teams) {
        const series = await PulseResponse_1.PulseResponse.aggregate([
            { $match: { organizationId, teamId: team._id, weekStart: { $gte: start } } },
            { $group: {
                    _id: "$weekStart",
                    responses: { $sum: 1 },
                    mood: { $avg: "$mood" },
                    stress: { $avg: "$stress" },
                    workload: { $avg: "$workload" },
                } },
            { $match: { responses: { $gte: minResponses } } },
            { $sort: { _id: 1 } },
        ]);
        if (series.length) {
            results.push({
                teamId: team._id.toString(),
                teamName: team.name,
                weeks: series.map((entry) => ({
                    weekStart: entry._id,
                    responses: entry.responses,
                    mood: Number(entry.mood.toFixed(2)),
                    stress: Number(entry.stress.toFixed(2)),
                    workload: Number(entry.workload.toFixed(2)),
                })),
            });
        }
    }
    return results;
}
async function analyticsHeatmap(organizationId, teamId, weeks, minResponses) {
    const start = (0, week_1.weekStart)();
    start.setUTCDate(start.getUTCDate() - (weeks - 1) * 7);
    const rows = await PulseResponse_1.PulseResponse.aggregate([
        { $match: {
                organizationId,
                ...(teamId ? { teamId } : {}),
                weekStart: { $gte: start },
            } },
        { $group: {
                _id: { teamId: "$teamId", weekStart: "$weekStart" },
                responses: { $sum: 1 },
                mood: { $avg: "$mood" },
                stress: { $avg: "$stress" },
                workload: { $avg: "$workload" },
            } },
        { $match: { responses: { $gte: minResponses } } },
        { $sort: { "_id.weekStart": 1 } },
    ]);
    const teams = await Team_1.Team.find({
        organizationId,
        _id: { $in: rows.map((row) => row._id.teamId) },
    }).select("_id name").lean();
    const names = new Map(teams.map((team) => [team._id.toString(), team.name]));
    return rows.map((entry) => ({
        teamId: entry._id.teamId.toString(),
        teamName: names.get(entry._id.teamId.toString()) ?? "Team",
        weekStart: entry._id.weekStart,
        responses: entry.responses,
        mood: Number(entry.mood.toFixed(2)),
        stress: Number(entry.stress.toFixed(2)),
        workload: Number(entry.workload.toFixed(2)),
        riskScore: Math.round(((entry.stress + entry.workload + (6 - entry.mood)) / 15) * 100),
    }));
}
async function organizationMinGroupSize(organizationId) {
    const organization = await Organization_1.Organization.findOne({ _id: organizationId })
        .select("minGroupSize").lean();
    return organization?.minGroupSize ?? 5;
}
async function analyticsTeams(organizationId, minResponses, teamId) {
    const teams = await Team_1.Team.find({
        organizationId,
        archivedAt: null,
        ...(teamId ? { _id: teamId } : {}),
    }).select("_id name").lean();
    const currentWeek = (0, week_1.weekStart)();
    return Promise.all(teams.map(async (team) => {
        const latest = await PulseResponse_1.PulseResponse.aggregate([
            { $match: { organizationId, teamId: team._id, weekStart: currentWeek } },
            { $group: { _id: "$weekStart", responses: { $sum: 1 }, mood: { $avg: "$mood" }, stress: { $avg: "$stress" }, workload: { $avg: "$workload" } } },
        ]);
        const group = latest[0];
        if (!group || group.responses < minResponses) {
            return { teamId: String(team._id), name: team.name, suppressed: true, reason: "MINIMUM_GROUP_SIZE" };
        }
        return {
            teamId: String(team._id),
            name: team.name,
            suppressed: false,
            responses: group.responses,
            mood: Number(group.mood.toFixed(1)),
            stress: Number(group.stress.toFixed(1)),
            workload: Number(group.workload.toFixed(1)),
        };
    }));
}
async function analyticsTeamTrend(organizationId, teamId, weeks, minResponses) {
    const start = (0, week_1.weekStart)();
    start.setUTCDate(start.getUTCDate() - (weeks - 1) * 7);
    const rows = await PulseResponse_1.PulseResponse.aggregate([
        { $match: { organizationId, teamId, weekStart: { $gte: start } } },
        { $group: { _id: "$weekStart", responses: { $sum: 1 }, mood: { $avg: "$mood" }, stress: { $avg: "$stress" }, workload: { $avg: "$workload" } } },
        { $sort: { _id: 1 } },
    ]);
    if (!rows.length || rows.some((row) => row.responses < minResponses)) {
        return { teamId: teamId.toString(), suppressed: true, reason: "MINIMUM_GROUP_SIZE" };
    }
    return {
        teamId: teamId.toString(),
        suppressed: false,
        weeks: rows.map((row) => ({
            weekStart: row._id,
            responses: row.responses,
            mood: Number(row.mood.toFixed(2)),
            stress: Number(row.stress.toFixed(2)),
            workload: Number(row.workload.toFixed(2)),
        })),
    };
}
