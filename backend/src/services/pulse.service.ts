import { Types } from "mongoose";
import { Alert } from "../models/Alert";
import { PulseReceipt } from "../models/PulseReceipt";
import { PulseResponse } from "../models/PulseResponse";
import { Team } from "../models/Team";
import { User } from "../models/User";
import { Organization } from "../models/Organization";
import { conflict, notFound } from "../utils/errors";
import { weekStart } from "../utils/week";
import { calculateBurnoutScore } from "./burnout";
import { logger } from "../utils/logger";

export async function submitPulse(scope: { userId: Types.ObjectId; organizationId: Types.ObjectId; teamId: Types.ObjectId | null }, input: { mood: number; stress: number; workload: number }) {
  if (!scope.teamId) throw notFound("Assign a team before submitting the weekly pulse");
  if (!await Team.exists({ _id: scope.teamId, organizationId: scope.organizationId, archivedAt: null })) {
    throw notFound("Assign an active team before submitting the weekly pulse");
  }
  const week = weekStart();
  try {
    await PulseReceipt.create({
      organizationId: scope.organizationId,
      teamId: scope.teamId,
      userId: scope.userId,
      weekStart: week,
      expiresAt: new Date(week.getTime() + 14 * 86_400_000),
    });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      throw conflict("You have already submitted this week's pulse", "PULSE_ALREADY_SUBMITTED");
    }
    throw error;
  }
  try {
    await PulseResponse.create({
      organizationId: scope.organizationId,
      teamId: scope.teamId,
      weekStart: week,
      mood: input.mood,
      stress: input.stress,
      workload: input.workload,
    });
  } catch (error) {
    await PulseReceipt.deleteOne({ userId: scope.userId, weekStart: week });
    throw error;
  }
  try {
    await scoreTeamAlerts(scope.organizationId);
  } catch (error) {
    logger.error({ err: error }, "Failed to evaluate team wellbeing alerts after pulse submission");
  }
  return { submitted: true, submittedAt: new Date().toISOString(), weekStart: week.toISOString() };
}

export async function hasSubmitted(userId: Types.ObjectId) {
  return Boolean(await PulseReceipt.exists({ userId, weekStart: weekStart() }));
}

export async function teamPulse(organizationId: Types.ObjectId, teamId?: string, minResponses = 5) {
  const currentWeek = weekStart();
  const teams = await Team.find({
    organizationId,
    archivedAt: null,
    ...(teamId ? { _id: teamId } : {}),
  }).select("_id name").lean();
  const result = [];
  for (const team of teams) {
    const weekly = await PulseResponse.aggregate([
      { $match: { organizationId, teamId: team._id as Types.ObjectId, weekStart: { $gte: new Date(currentWeek.getTime() - 6 * 7 * 86_400_000), $lte: currentWeek } } },
      { $group: { _id: "$weekStart", responses: { $sum: 1 }, mood: { $avg: "$mood" }, stress: { $avg: "$stress" }, workload: { $avg: "$workload" } } },
      { $sort: { _id: 1 } },
    ]);
    const latest = weekly.find((entry) => new Date(entry._id).getTime() === currentWeek.getTime());
    if (!latest || latest.responses < minResponses) continue;
    const memberCount = await User.countDocuments({ organizationId, teamId: team._id });
    const trend = weekly.filter((entry) => entry.responses >= minResponses).map((entry) => ({
      weekStart: entry._id,
      responses: entry.responses,
      mood: Number(entry.mood.toFixed(2)),
      stress: Number(entry.stress.toFixed(2)),
      workload: Number(entry.workload.toFixed(2)),
    }));
    result.push({
      teamId: (team._id as Types.ObjectId).toString(),
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

export async function listAlerts(organizationId: Types.ObjectId, status?: "open" | "acknowledged" | "dismissed", teamId?: Types.ObjectId) {
  return Alert.find({ organizationId, ...(status ? { status } : {}), ...(teamId ? { teamId } : {}) })
    .populate("teamId", "name")
    .sort({ createdAt: -1 })
    .lean();
}

export async function updateAlert(
  organizationId: Types.ObjectId,
  alertId: string,
  status: "acknowledged" | "dismissed",
  acknowledgedBy: Types.ObjectId,
  teamId?: Types.ObjectId,
) {
  if (!Types.ObjectId.isValid(alertId)) throw notFound("Alert not found");
  const alert = await Alert.findOneAndUpdate(
    { _id: alertId, organizationId, ...(teamId ? { teamId } : {}) },
    { $set: { status, acknowledgedBy: status === "acknowledged" ? acknowledgedBy : null } },
    { new: true },
  );
  if (!alert) throw notFound("Alert not found");
  return alert;
}

export async function scoreTeamAlerts(organizationId: Types.ObjectId, configuredMinResponses?: number): Promise<number> {
  const minResponses = configuredMinResponses ?? await organizationMinGroupSize(organizationId);
  const week = weekStart();
  const priorWeek = new Date(week.getTime() - 7 * 86_400_000);
  const fourWeeksAgo = new Date(week.getTime() - 3 * 7 * 86_400_000);
  const teams = await Team.find({ organizationId, archivedAt: null }).select("_id name").lean();
  let created = 0;
  for (const team of teams) {
    const values = await PulseResponse.aggregate([
      { $match: { organizationId, teamId: team._id as Types.ObjectId, weekStart: { $gte: fourWeeksAgo, $lte: week } } },
      { $group: { _id: "$weekStart", count: { $sum: 1 }, stress: { $avg: "$stress" }, workload: { $avg: "$workload" }, mood: { $avg: "$mood" } } },
      { $sort: { _id: 1 } },
    ]);
    const current = values.find((row) => new Date(row._id).getTime() === week.getTime());
    if (!current || current.count < minResponses) continue;
    const previous = values.find((row) => new Date(row._id).getTime() === priorWeek.getTime());
    const memberCount = await User.countDocuments({ organizationId, teamId: team._id });
    const currentParticipation = memberCount ? current.count / memberCount : 0;
    const previousParticipation = previous && memberCount ? previous.count / memberCount : undefined;
    const burnout = calculateBurnoutScore({
      stress: current.stress,
      workload: current.workload,
      mood: current.mood,
      participation: currentParticipation,
      ...(previous ? {
        previousStress: previous.stress,
        previousWorkload: previous.workload,
        previousMood: previous.mood,
        ...(previousParticipation !== undefined ? { previousParticipation } : {}),
      } : {}),
    });
    const recent = values.filter((row) => row.count >= minResponses).slice(-4);
    const consecutiveStressIncrease = recent.length === 4 && recent.slice(1).every((row, index) =>
      recent[index].stress > 0 && row.stress >= recent[index].stress * 1.15,
    );
    const candidates = [
      ...(burnout.score >= 40 ? [{
        type: "burnout_risk" as const,
        title: `${team.name} wellbeing signals need attention`,
        detail: "Aggregated stress, workload, mood, participation, and week-over-week change crossed the support threshold.",
      }] : []),
      ...(consecutiveStressIncrease ? [{
        type: "stress_trend" as const,
        title: `${team.name} stress has increased for three weeks`,
        detail: "Average stress has increased by at least 15% for three consecutive eligible weeks.",
      }] : []),
      ...(current.mood <= 2.5 ? [{
        type: "low_mood" as const,
        title: `${team.name} mood is low`,
        detail: "The team's aggregated mood score is at or below 2.5.",
      }] : []),
      ...(previousParticipation !== undefined && previousParticipation >= 0.7 && currentParticipation <= 0.5 ? [{
        type: "participation_collapse" as const,
        title: `${team.name} pulse participation has fallen`,
        detail: "Participation has fallen from at least 70% to 50% or less.",
      }] : []),
    ];
    for (const candidate of candidates) {
      const update = await Alert.updateOne(
        { organizationId, teamId: team._id, type: candidate.type, status: "open" },
        {
          $set: {
            key: `${(team._id as Types.ObjectId).toString()}:${week.toISOString()}:${candidate.type}`,
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
            },
          },
          $setOnInsert: { organizationId, teamId: team._id, type: candidate.type },
        },
        { upsert: true },
      );
      if (update.upsertedCount) created += 1;
    }
  }
  return created;
}

export async function analyticsTrends(
  organizationId: Types.ObjectId,
  teamId: Types.ObjectId | undefined,
  weeks: number,
  minResponses: number,
) {
  const start = weekStart();
  start.setUTCDate(start.getUTCDate() - (weeks - 1) * 7);
  const teams = await Team.find({
    organizationId,
    archivedAt: null,
    ...(teamId ? { _id: teamId } : {}),
  }).select("_id name").lean();
  const results = [];
  for (const team of teams) {
    const series = await PulseResponse.aggregate([
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
        teamId: (team._id as Types.ObjectId).toString(),
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

export async function analyticsHeatmap(
  organizationId: Types.ObjectId,
  teamId: Types.ObjectId | undefined,
  weeks: number,
  minResponses: number,
) {
  const start = weekStart();
  start.setUTCDate(start.getUTCDate() - (weeks - 1) * 7);
  const rows = await PulseResponse.aggregate([
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
  const teams = await Team.find({
    organizationId,
    _id: { $in: rows.map((row) => row._id.teamId) },
  }).select("_id name").lean();
  const names = new Map(teams.map((team) => [(team._id as Types.ObjectId).toString(), team.name]));
  return rows.map((entry) => ({
    teamId: (entry._id.teamId as Types.ObjectId).toString(),
    teamName: names.get((entry._id.teamId as Types.ObjectId).toString()) ?? "Team",
    weekStart: entry._id.weekStart,
    responses: entry.responses,
    mood: Number(entry.mood.toFixed(2)),
    stress: Number(entry.stress.toFixed(2)),
    workload: Number(entry.workload.toFixed(2)),
    riskScore: Math.round(((entry.stress + entry.workload + (6 - entry.mood)) / 15) * 100),
  }));
}

export async function organizationMinGroupSize(organizationId: Types.ObjectId) {
  const organization = await Organization.findOne({ _id: organizationId })
    .select("minGroupSize").lean() as { minGroupSize?: number } | null;
  return organization?.minGroupSize ?? 5;
}

export async function analyticsTeams(
  organizationId: Types.ObjectId,
  minResponses: number,
) {
  const teams = await Team.find({ organizationId, archivedAt: null }).select("_id name").lean();
  const currentWeek = weekStart();
  return Promise.all(teams.map(async (team) => {
    const latest = await PulseResponse.aggregate([
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

export async function analyticsTeamTrend(
  organizationId: Types.ObjectId,
  teamId: Types.ObjectId,
  weeks: number,
  minResponses: number,
) {
  const start = weekStart();
  start.setUTCDate(start.getUTCDate() - (weeks - 1) * 7);
  const rows = await PulseResponse.aggregate([
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
