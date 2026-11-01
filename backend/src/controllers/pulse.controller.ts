import { asyncHandler } from "../utils/async-handler";
import * as pulse from "../services/pulse.service";
import * as workspace from "../services/workspace.service";
import { unauthorized } from "../utils/errors";

export const submit = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  const { mood, stress, workload } = req.body;
  const result = await pulse.submitPulse(req.auth, { mood, stress, workload });
  res.status(201).json({ ...result, data: result });
});

export const submissionStatus = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  const result = { submittedThisWeek: await pulse.hasSubmitted(req.auth.userId) };
  res.json({ ...result, data: result });
});

export const teamScores = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  const query = req.validatedQuery as { teamId?: string };
  const canViewAll = req.auth.role === "admin";
  const teamId = query.teamId ?? (!canViewAll ? req.auth.teamId?.toString() : undefined);
  if (!canViewAll && !teamId) throw unauthorized("A manager must be assigned to a team");
  if (teamId) await workspace.ensureTeamAccess(req.auth.organizationId, teamId, req.auth.teamId, canViewAll);
  const minGroupSize = await pulse.organizationMinGroupSize(req.auth.organizationId);
  const teams = await pulse.teamPulse(req.auth.organizationId, teamId, minGroupSize);
  res.json({ teams, minimumGroupSize: minGroupSize, data: { teams, minimumGroupSize: minGroupSize } });
});

export const alerts = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  const query = req.validatedQuery as { status?: "open" | "acknowledged" | "dismissed" };
  const teamId = req.auth.role === "admin" ? undefined : req.auth.teamId ?? undefined;
  if (req.auth.role !== "admin" && !teamId) throw unauthorized("A manager must be assigned to a team");
  const alerts = await pulse.listAlerts(req.auth.organizationId, query.status, teamId);
  res.json({ alerts });
});

export const updateAlert = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  const teamId = req.auth.role === "admin" ? undefined : req.auth.teamId ?? undefined;
  if (req.auth.role !== "admin" && !teamId) throw unauthorized("A manager must be assigned to a team");
  const result = await pulse.updateAlert(req.auth.organizationId, req.params.alertId, req.body.status, req.auth.userId, teamId);
  res.json({ alert: result });
});
