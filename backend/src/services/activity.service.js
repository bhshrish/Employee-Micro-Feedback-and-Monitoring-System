"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startActivity = startActivity;
exports.heartbeatActivity = heartbeatActivity;
exports.setActivityIdle = setActivityIdle;
exports.setActivityTags = setActivityTags;
exports.pauseActivity = pauseActivity;
exports.resumeActivity = resumeActivity;
exports.finishActivity = finishActivity;
exports.activityHistory = activityHistory;
exports.dashboard = dashboard;
const TeamActivity_1 = require("../models/TeamActivity");
const errors_1 = require("../utils/errors");
const week_1 = require("../utils/week");
async function startActivity(scope, input) {
    const running = await TeamActivity_1.TeamActivity.findOne({ userId: scope.userId, status: { $in: ["running", "paused"] } });
    if (running)
        throw (0, errors_1.badRequest)("Stop the current activity session before starting another", "SESSION_ALREADY_OPEN");
    const startedAt = new Date();
    return TeamActivity_1.TeamActivity.create({
        ...scope,
        task: input.task,
        category: input.category,
        startedAt,
        heartbeatAt: startedAt,
        openSessionUserId: scope.userId,
    });
}
async function heartbeatActivity(userId, organizationId, sessionId) {
    const session = await TeamActivity_1.TeamActivity.findOneAndUpdate({ _id: sessionId, userId, organizationId, status: "running" }, { $set: { heartbeatAt: new Date() } }, { new: true });
    if (!session)
        throw (0, errors_1.notFound)("Running activity session not found");
    return session;
}
async function setActivityIdle(userId, organizationId, sessionId, idle) {
    const session = await TeamActivity_1.TeamActivity.findOne({ _id: sessionId, userId, organizationId });
    if (!session)
        throw (0, errors_1.notFound)("Activity session not found");
    if (session.status !== "running")
        throw (0, errors_1.badRequest)("Idle state can only change while a session is running");
    const now = new Date();
    if (idle && !session.idleStartedAt)
        session.idleStartedAt = now;
    if (!idle && session.idleStartedAt) {
        session.idleSeconds += Math.max(0, Math.floor((now.getTime() - session.idleStartedAt.getTime()) / 1000));
        session.idleStartedAt = null;
    }
    session.heartbeatAt = now;
    await session.save();
    return session;
}
async function setActivityTags(userId, organizationId, sessionId, input) {
    const session = await TeamActivity_1.TeamActivity.findOne({ _id: sessionId, userId, organizationId, status: { $ne: "stopped" } });
    if (!session)
        throw (0, errors_1.notFound)("Active activity session not found");
    if (input.task && session.status === "running")
        throw (0, errors_1.badRequest)("Pause the activity before changing its project or task");
    if (input.tags)
        session.tags = [...new Set(input.tags.map((tag) => tag.trim()).filter(Boolean))];
    if (input.category)
        session.category = input.category;
    if (input.task)
        session.task = input.task;
    await session.save();
    return session;
}
async function pauseActivity(userId, organizationId, sessionId) {
    const session = await TeamActivity_1.TeamActivity.findOne({ _id: sessionId, userId, organizationId });
    if (!session)
        throw (0, errors_1.notFound)("Activity session not found");
    if (session.status !== "running")
        throw (0, errors_1.badRequest)("Only a running activity can be paused");
    if (session.idleStartedAt) {
        session.idleSeconds += Math.max(0, Math.floor((Date.now() - session.idleStartedAt.getTime()) / 1000));
        session.idleStartedAt = null;
    }
    session.status = "paused";
    session.pausedAt = new Date();
    await session.save();
    return session;
}
async function resumeActivity(userId, organizationId, sessionId) {
    const session = await TeamActivity_1.TeamActivity.findOne({ _id: sessionId, userId, organizationId });
    if (!session)
        throw (0, errors_1.notFound)("Activity session not found");
    if (session.status !== "paused" || !session.pausedAt)
        throw (0, errors_1.badRequest)("Only a paused activity can be resumed");
    session.pausedSeconds += Math.max(0, Math.floor((Date.now() - session.pausedAt.getTime()) / 1000));
    session.pausedAt = null;
    session.heartbeatAt = new Date();
    session.status = "running";
    await session.save();
    return session;
}
async function finishActivity(userId, organizationId, sessionId) {
    const session = await TeamActivity_1.TeamActivity.findOne({ _id: sessionId, userId, organizationId });
    if (!session)
        throw (0, errors_1.notFound)("Activity session not found");
    if (session.status === "stopped")
        throw (0, errors_1.badRequest)("Activity session is already stopped");
    if (session.idleStartedAt) {
        session.idleSeconds += Math.max(0, Math.floor((Date.now() - session.idleStartedAt.getTime()) / 1000));
        session.idleStartedAt = null;
    }
    let pausedSeconds = session.pausedSeconds;
    if (session.pausedAt)
        pausedSeconds += Math.max(0, Math.floor((Date.now() - session.pausedAt.getTime()) / 1000));
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - session.startedAt.getTime()) / 1000));
    const unpausedSeconds = Math.max(0, elapsedSeconds - pausedSeconds);
    session.activeSeconds = Math.max(0, unpausedSeconds - session.idleSeconds);
    session.pausedSeconds = pausedSeconds;
    session.pausedAt = null;
    if (session.activeSeconds + session.idleSeconds > unpausedSeconds + 300)
        throw (0, errors_1.badRequest)("Session durations exceed elapsed time");
    session.status = "stopped";
    session.endedAt = new Date();
    session.openSessionUserId = null;
    await session.save();
    return session;
}
async function activityHistory(userId, organizationId, query) {
    const filter = {
        userId,
        organizationId,
        ...(query.from || query.to ? {
            startedAt: {
                ...(query.from ? { $gte: new Date(query.from) } : {}),
                ...(query.to ? { $lte: new Date(query.to) } : {}),
            },
        } : {}),
    };
    const [items, total] = await Promise.all([
        TeamActivity_1.TeamActivity.find(filter).sort({ startedAt: -1 }).skip((query.page - 1) * query.limit).limit(query.limit).lean(),
        TeamActivity_1.TeamActivity.countDocuments(filter),
    ]);
    return {
        items: items.map((item) => ({
            id: String(item._id),
            task: item.task,
            category: item.category,
            tags: item.tags,
            startedAt: item.startedAt,
            endedAt: item.endedAt,
            activeSeconds: item.activeSeconds,
            idleSeconds: item.idleSeconds,
            status: item.status,
        })),
        pagination: { page: query.page, limit: query.limit, total, pages: Math.ceil(total / query.limit) },
    };
}
async function dashboard(userId, organizationId, range) {
    const { start, end } = (0, week_1.dateRange)(range);
    const sessions = await TeamActivity_1.TeamActivity.find({ userId, organizationId, startedAt: { $gte: start, $lte: end } }).lean();
    const now = Date.now();
    const durations = sessions.map((item) => {
        if (item.status === "stopped")
            return { item, activeSeconds: item.activeSeconds, idleSeconds: item.idleSeconds };
        const elapsed = Math.max(0, Math.floor((now - item.startedAt.getTime()) / 1000));
        const paused = item.pausedSeconds + (item.pausedAt ? Math.max(0, Math.floor((now - item.pausedAt.getTime()) / 1000)) : 0);
        const unpaused = Math.max(0, elapsed - paused);
        const idleSeconds = item.idleSeconds + (item.idleStartedAt
            ? Math.max(0, Math.floor((now - item.idleStartedAt.getTime()) / 1000))
            : 0);
        return { item, activeSeconds: Math.max(0, unpaused - idleSeconds), idleSeconds };
    });
    const active = durations.reduce((sum, session) => sum + session.activeSeconds, 0);
    const idle = durations.reduce((sum, session) => sum + session.idleSeconds, 0);
    const total = active + idle;
    const productive = durations.filter(({ item }) => item.category === "Productive")
        .reduce((sum, session) => sum + session.activeSeconds, 0);
    const days = new Map();
    for (const { item: session, activeSeconds, idleSeconds } of durations) {
        const key = session.startedAt.toISOString().slice(0, 10);
        const current = days.get(key) ?? { active: 0, idle: 0, productive: 0, neutral: 0 };
        current.active += activeSeconds;
        current.idle += idleSeconds;
        if (session.category === "Productive")
            current.productive += activeSeconds;
        else
            current.neutral += activeSeconds;
        days.set(key, current);
    }
    return {
        range,
        summary: {
            totalSeconds: total,
            activeSeconds: active,
            idleSeconds: idle,
            productivityPercent: active ? Math.round((productive / active) * 100) : 0,
            sessionCount: sessions.length,
        },
        daily: [...days.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date, ...value })),
        sessions: durations.map(({ item, activeSeconds, idleSeconds }) => ({
            id: item._id.toString(),
            task: item.task,
            category: item.category,
            startedAt: item.startedAt,
            endedAt: item.endedAt,
            pausedAt: item.pausedAt,
            pausedSeconds: item.pausedSeconds,
            activeSeconds,
            idleSeconds,
            status: item.status,
        })),
    };
}
