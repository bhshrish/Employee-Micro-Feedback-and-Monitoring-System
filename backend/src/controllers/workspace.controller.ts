import { asyncHandler } from "../utils/async-handler";
import * as workspace from "../services/workspace.service";
import { forbidden, unauthorized } from "../utils/errors";

export const teams = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  res.json({ teams: await workspace.listTeams(req.auth.organizationId) });
});

export const createTeam = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  const team = await workspace.createTeam(req.auth.organizationId, req.body.name);
  res.status(201).json({ team });
});

export const inviteMember = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  if (req.auth.role === "manager" && req.auth.teamId?.toString() !== req.body.teamId) {
    throw forbidden("Managers can invite members only to their assigned team");
  }
  const invitation = await workspace.createInvitation(
    req.auth.organizationId,
    req.auth.userId,
    req.body.email,
    req.body.teamId,
  );
  const result = {
      email: invitation.email,
      teamId: invitation.teamId,
      expiresAt: invitation.expiresAt,
      token: invitation.token,
  };
  res.status(201).json({ invitation: result, data: { invitation: result } });
});

export const members = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  const teamId = req.auth.role === "admin" ? undefined : req.auth.teamId ?? undefined;
  if (req.auth.role !== "admin" && !teamId) throw forbidden("A manager must be assigned to a team");
  res.json({ members: await workspace.listMembers(req.auth.organizationId, teamId) });
});

export const updateMember = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  const member = await workspace.updateMember(
    req.auth.organizationId,
    req.auth.userId,
    req.params.memberId ?? req.params.userId,
    req.body,
  );
  res.json({ member });
});

export const archiveTeam = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  const team = await workspace.archiveTeam(req.auth.organizationId, req.params.teamId);
  res.json({ team });
});
