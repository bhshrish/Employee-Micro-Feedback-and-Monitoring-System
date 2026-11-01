import { Types } from "mongoose";
import { Team } from "../models/Team";
import { User } from "../models/User";
import { Invitation } from "../models/Invitation";
import { createHmac, randomBytes } from "node:crypto";
import { getConfig } from "../config/env";
import { badRequest, forbidden, notFound } from "../utils/errors";

export async function listTeams(organizationId: Types.ObjectId) {
  return Team.find({ organizationId, archivedAt: null }).sort({ name: 1 }).lean();
}

export async function createTeam(organizationId: Types.ObjectId, name: string) {
  return Team.create({ organizationId, name });
}

export async function archiveTeam(organizationId: Types.ObjectId, teamId: string) {
  if (!Types.ObjectId.isValid(teamId)) throw notFound("Team not found");
  if (!await Team.exists({ _id: teamId, organizationId, archivedAt: null })) throw notFound("Team not found");
  if (await User.exists({ organizationId, teamId })) throw badRequest("Reassign team members before archiving this team");
  const team = await Team.findOneAndUpdate(
    { _id: teamId, organizationId, archivedAt: null },
    { $set: { archivedAt: new Date() } },
    { new: true },
  );
  if (!team) throw notFound("Team not found");
  return team;
}

export async function createInvitation(
  organizationId: Types.ObjectId,
  inviterId: Types.ObjectId,
  email: string,
  teamId: string,
) {
  if (!Types.ObjectId.isValid(teamId)) throw notFound("Team not found");
  const team = await Team.findOne({ _id: teamId, organizationId, archivedAt: null });
  if (!team) throw notFound("Team not found");
  if (await User.exists({ email: email.toLowerCase() })) throw badRequest("An account with this email already exists");
  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = createHmac("sha256", getConfig().JWT_REFRESH_SECRET).update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 7 * 86_400_000);
  await Invitation.updateMany(
    { organizationId, email: email.toLowerCase(), acceptedAt: null },
    { $set: { acceptedAt: new Date() } },
  );
  await Invitation.create({ organizationId, teamId, inviterId, email: email.toLowerCase(), tokenHash, expiresAt });
  return { email: email.toLowerCase(), teamId: teamId.toString(), expiresAt, token: rawToken };
}

export async function listMembers(organizationId: Types.ObjectId, teamId?: Types.ObjectId) {
  const users = await User.find({ organizationId, ...(teamId ? { teamId } : {}) }).select("name email role teamId createdAt").populate("teamId", "name").sort({ name: 1 }).lean();
  return users;
}

export async function updateMember(
  organizationId: Types.ObjectId,
  actorId: Types.ObjectId,
  memberId: string,
  input: { role?: "admin" | "manager" | "employee"; teamId?: string | null },
) {
  if (!Types.ObjectId.isValid(memberId)) throw notFound("Member not found");
  if (actorId.toString() === memberId && input.role) throw badRequest("You cannot change your own role");
  const update: Record<string, unknown> = {};
  if (input.role) update.role = input.role;
  if (input.teamId !== undefined) {
    if (input.teamId !== null) {
      if (!Types.ObjectId.isValid(input.teamId) || !await Team.exists({ _id: input.teamId, organizationId, archivedAt: null })) {
        throw badRequest("Team does not belong to this workspace");
      }
    }
    update.teamId = input.teamId;
  }
  const user = await User.findOneAndUpdate({ _id: memberId, organizationId }, { $set: update }, { new: true })
    .select("name email role teamId organizationId");
  if (!user) throw notFound("Member not found");
  return user;
}

export async function ensureTeamAccess(organizationId: Types.ObjectId, teamId: string, actorTeamId: Types.ObjectId | null, canViewAll: boolean) {
  if (!Types.ObjectId.isValid(teamId)) throw notFound("Team not found");
  const team = await Team.findOne({ _id: teamId, organizationId, archivedAt: null }).lean();
  if (!team) throw notFound("Team not found");
  if (!canViewAll && actorTeamId?.toString() !== teamId) throw forbidden("You can only view your assigned team");
  return team;
}
