import type { Types } from "mongoose";
import { TeamActivity } from "../models/TeamActivity";
import { badRequest, notFound } from "../utils/errors";
import { dateRange } from "../utils/week";

type ActivityInput = { task: string; category: "Productive" | "Neutral" | "Distracting"; startedAt?: string };

export async function startActivity(
  scope: { userId: Types.ObjectId; organizationId: Types.ObjectId; teamId: Types.ObjectId | null },
  input: ActivityInput,
) {
  const running = await TeamActivity.findOne({ userId: scope.userId, status: { $in: ["running", "paused"] } });
  if (running) throw badRequest("Stop the current activity session before starting another", "SESSION_ALREADY_OPEN");
  const startedAt = new Date();
  return TeamActivity.create({
    ...scope,
    task: input.task,
    category: input.category,
    startedAt,
    heartbeatAt: startedAt,
    openSessionUserId: scope.userId,
  });
}

export async function heartbeatActivity(userId: Types.ObjectId, organizationId: Types.ObjectId, sessionId: string) {
  const session = await TeamActivity.findOneAndUpdate(
    { _id: sessionId, userId, organizationId, status: "running" },
    { $set: { heartbeatAt: new Date() } },
    { new: true },
  );
  if (!session) throw notFound("Running activity session not found");
  return session;
}

export async function setActivityIdle(
  userId: Types.ObjectId,
  organizationId: Types.ObjectId,
  sessionId: string,
  idle: boolean,
) {
  const session = await TeamActivity.findOne({ _id: sessionId, userId, organizationId });
  if (!session) throw notFound("Activity session not found");
  if (session.status !== "running") throw badRequest("Idle state can only change while a session is running");
  const now = new Date();
  if (idle && !session.idleStartedAt) session.idleStartedAt = now;
  if (!idle && session.idleStartedAt) {
    session.idleSeconds += Math.max(0, Math.floor((now.getTime() - session.idleStartedAt.getTime()) / 1000));
    session.idleStartedAt = null;
  }
  session.heartbeatAt = now;
  await session.save();
  return session;
}

export async function setActivityTags(
  userId: Types.ObjectId,
  organizationId: Types.ObjectId,
  sessionId: string,
  input: { tags?: string[]; category?: "Productive" | "Neutral" | "Distracting" },
) {
  const session = await TeamActivity.findOne({ _id: sessionId, userId, organizationId, status: { $ne: "stopped" } });
  if (!session) throw notFound("Active activity session not found");
  if (input.tags) session.tags = [...new Set(input.tags.map((tag) => tag.trim()).filter(Boolean))];
  if (input.category) session.category = input.category;
  await session.save();
  return session;
}

export async function pauseActivity(userId: Types.ObjectId, organizationId: Types.ObjectId, sessionId: string) {
  const session = await TeamActivity.findOne({ _id: sessionId, userId, organizationId });
  if (!session) throw notFound("Activity session not found");
  if (session.status !== "running") throw badRequest("Only a running activity can be paused");
  if (session.idleStartedAt) {
    session.idleSeconds += Math.max(0, Math.floor((Date.now() - session.idleStartedAt.getTime()) / 1000));
    session.idleStartedAt = null;
  }
  session.status = "paused";
  session.pausedAt = new Date();
  await session.save();
  return session;
}

export async function resumeActivity(userId: Types.ObjectId, organizationId: Types.ObjectId, sessionId: string) {
  const session = await TeamActivity.findOne({ _id: sessionId, userId, organizationId });
  if (!session) throw notFound("Activity session not found");
  if (session.status !== "paused" || !session.pausedAt) throw badRequest("Only a paused activity can be resumed");
  session.pausedSeconds += Math.max(0, Math.floor((Date.now() - session.pausedAt.getTime()) / 1000));
  session.pausedAt = null;
  session.heartbeatAt = new Date();
  session.status = "running";
  await session.save();
  return session;
}

export async function finishActivity(userId: Types.ObjectId, organizationId: Types.ObjectId, sessionId: string) {
  const session = await TeamActivity.findOne({ _id: sessionId, userId, organizationId });
  if (!session) throw notFound("Activity session not found");
  if (session.status === "stopped") throw badRequest("Activity session is already stopped");
  if (session.idleStartedAt) {
    session.idleSeconds += Math.max(0, Math.floor((Date.now() - session.idleStartedAt.getTime()) / 1000));
    session.idleStartedAt = null;
  }
  let pausedSeconds = session.pausedSeconds;
  if (session.pausedAt) pausedSeconds += Math.max(0, Math.floor((Date.now() - session.pausedAt.getTime()) / 1000));
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - session.startedAt.getTime()) / 1000));
  const unpausedSeconds = Math.max(0, elapsedSeconds - pausedSeconds);
  session.activeSeconds = Math.max(0, unpausedSeconds - session.idleSeconds);
  session.pausedSeconds = pausedSeconds;
  session.pausedAt = null;
  if (session.activeSeconds + session.idleSeconds > unpausedSeconds + 300) throw badRequest("Session durations exceed elapsed time");
  session.status = "stopped";
  session.endedAt = new Date();
  session.openSessionUserId = null;
  await session.save();
  return session;
}

export async function activityHistory(
  userId: Types.ObjectId,
  organizationId: Types.ObjectId,
  query: { page: number; limit: number; from?: string; to?: string },
) {
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
    TeamActivity.find(filter).sort({ startedAt: -1 }).skip((query.page - 1) * query.limit).limit(query.limit).lean(),
    TeamActivity.countDocuments(filter),
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

export async function dashboard(userId: Types.ObjectId, organizationId: Types.ObjectId, range: string) {
  const { start, end } = dateRange(range);
  const sessions = await TeamActivity.find({ userId, organizationId, startedAt: { $gte: start, $lte: end } }).lean();
  const now = Date.now();
  const durations = sessions.map((item) => {
    if (item.status === "stopped") return { item, activeSeconds: item.activeSeconds, idleSeconds: item.idleSeconds };
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
  const days = new Map<string, { active: number; idle: number; productive: number; neutral: number }>();
  for (const { item: session, activeSeconds, idleSeconds } of durations) {
    const key = session.startedAt.toISOString().slice(0, 10);
    const current = days.get(key) ?? { active: 0, idle: 0, productive: 0, neutral: 0 };
    current.active += activeSeconds;
    current.idle += idleSeconds;
    if (session.category === "Productive") current.productive += activeSeconds;
    else current.neutral += activeSeconds;
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
      id: (item._id as Types.ObjectId).toString(),
      task: item.task,
      category: item.category,
      startedAt: item.startedAt,
      endedAt: item.endedAt,
      activeSeconds,
      idleSeconds,
      status: item.status,
    })),
  };
}
