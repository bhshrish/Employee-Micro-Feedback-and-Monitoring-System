import * as pulse from "../services/pulse.service";
import * as workspace from "../services/workspace.service";
import { asyncHandler } from "../utils/async-handler";
import { forbidden, notFound, unauthorized } from "../utils/errors";
import { Types } from "mongoose";
import { Team } from "../models/Team";

async function teamScope(req: import("express").Request, requested?: string) {
  if (!req.auth) throw unauthorized();
  const canViewAll = req.auth.role === "admin";
  const teamId = requested ?? (!canViewAll ? req.auth.teamId?.toString() : undefined);
  if (!canViewAll && req.auth.role !== "manager") throw forbidden("Analytics are available to workspace managers only");
  if (!canViewAll && !teamId) throw forbidden("A manager must be assigned to a team");
  if (teamId) {
    await workspace.ensureTeamAccess(req.auth.organizationId, teamId, req.auth.teamId, canViewAll);
  }
  return teamId ? new Types.ObjectId(teamId) : undefined;
}

export const trends = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  const query = req.validatedQuery as { weeks: number; teamId?: string };
  const teamId = await teamScope(req, query.teamId);
  const minGroupSize = await pulse.organizationMinGroupSize(req.auth.organizationId);
  res.json({
    minimumGroupSize: minGroupSize,
    trends: await pulse.analyticsTrends(
      req.auth.organizationId,
      teamId,
      query.weeks,
      minGroupSize,
    ),
  });
});

export const heatmap = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  const query = req.validatedQuery as { weeks: number; teamId?: string };
  const teamId = await teamScope(req, query.teamId);
  const minGroupSize = await pulse.organizationMinGroupSize(req.auth.organizationId);
  const teams = await Team.find({
    organizationId: req.auth.organizationId,
    archivedAt: null,
    ...(teamId ? { _id: teamId } : {}),
  }).select("_id name").lean();
  const teamIds = new Set(teams.map((team) => (team._id as Types.ObjectId).toString()));
  res.json({
    minimumGroupSize: minGroupSize,
    teams: teams.map((team) => ({ teamId: (team._id as Types.ObjectId).toString(), name: team.name })),
    cells: (await pulse.analyticsHeatmap(req.auth.organizationId, teamId, query.weeks, minGroupSize))
      .filter((cell) => teamIds.has(cell.teamId)),
  });
});

export const teams = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  const teamId = await teamScope(req);
  const minGroupSize = await pulse.organizationMinGroupSize(req.auth.organizationId);
  const teams = await pulse.analyticsTeams(req.auth.organizationId, minGroupSize, teamId);
  res.json({ minimumGroupSize: minGroupSize, teams, data: { minimumGroupSize: minGroupSize, teams } });
});

export const teamTrend = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  const id = req.params.teamId;
  if (!Types.ObjectId.isValid(id)) throw notFound("Team not found");
  const teamId = new Types.ObjectId(id);
  const scopedId = await teamScope(req, id);
  if (!scopedId || !await Team.exists({ _id: teamId, organizationId: req.auth.organizationId, archivedAt: null })) {
    throw notFound("Team not found");
  }
  const query = req.validatedQuery as { weeks: number };
  const minGroupSize = await pulse.organizationMinGroupSize(req.auth.organizationId);
  const trend = await pulse.analyticsTeamTrend(req.auth.organizationId, teamId, query.weeks, minGroupSize);
  res.json({ minimumGroupSize: minGroupSize, trend, data: { minimumGroupSize: minGroupSize, trend } });
});
