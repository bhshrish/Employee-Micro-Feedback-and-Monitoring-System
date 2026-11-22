const mongoose_1 = require("mongoose");
const Team_1 = require("../models/Team");
const User_1 = require("../models/User");
const Invitation_1 = require("../models/Invitation");
const node_crypto_1 = require("node:crypto");
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
export async function listTeams(organizationId: string) {
    return Team_1.Team.find({ organizationId, archivedAt: null }).sort({ name: 1 }).lean();
}
export async function createTeam(organizationId: string, name: string) {
    return Team_1.Team.create({ organizationId, name });
}
export async function archiveTeam(organizationId: string, teamId: string) {
    if (!mongoose_1.Types.ObjectId.isValid(teamId))
        throw (0, errors_1.notFound)("Team not found");
    if (!await Team_1.Team.exists({ _id: teamId, organizationId, archivedAt: null }))
        throw (0, errors_1.notFound)("Team not found");
    if (await User_1.User.exists({ organizationId, teamId }))
        throw (0, errors_1.badRequest)("Reassign team members before archiving this team");
    const team = await Team_1.Team.findOneAndUpdate({ _id: teamId, organizationId, archivedAt: null }, { $set: { archivedAt: new Date() } }, { new: true });
    if (!team)
        throw (0, errors_1.notFound)("Team not found");
    return team;
}
export async function createInvitation(organizationId: string, inviterId: string, email: string, teamId: string) {
    if (email.trim().toLowerCase() === env_1.getConfig().OPS_ADMIN_EMAIL.toLowerCase())
        throw (0, errors_1.badRequest)("This email is reserved for the platform administrator");
    if (!mongoose_1.Types.ObjectId.isValid(teamId))
        throw (0, errors_1.notFound)("Team not found");
    const team = await Team_1.Team.findOne({ _id: teamId, organizationId, archivedAt: null });
    if (!team)
        throw (0, errors_1.notFound)("Team not found");
    if (await User_1.User.exists({ email }))
        throw (0, errors_1.badRequest)("An account with this email already exists");
    const rawToken = (0, node_crypto_1.randomBytes)(32).toString("base64url");
    const tokenHash = (0, node_crypto_1.createHmac)("sha256", (0, env_1.getConfig)().JWT_REFRESH_SECRET).update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 86_400_000);
    await Invitation_1.Invitation.updateMany({ organizationId, email, acceptedAt: null }, { $set: { acceptedAt: new Date() } });
    await Invitation_1.Invitation.create({ organizationId, teamId, inviterId, email, tokenHash, expiresAt });
    return { email, teamId: teamId.toString(), expiresAt, token: rawToken };
}
export async function listMembers(organizationId: string, teamId: string) {
    const users = await User_1.User.find({ organizationId, ...(teamId ? { teamId } : {}) }).select("name email role teamId createdAt").populate("teamId", "name").sort({ name: 1 }).lean();
    return users;
}
export async function updateMember(organizationId: string, actorId: string, memberId: string, input) {
    if (!mongoose_1.Types.ObjectId.isValid(memberId))
        throw (0, errors_1.notFound)("Member not found");
    if (actorId.toString() === memberId && input.role)
        throw (0, errors_1.badRequest)("You cannot change your own role");
    const update = {};
    if (input.role)
        update.role = input.role;
    if (input.teamId !== undefined) {
        if (input.teamId !== null) {
            if (!mongoose_1.Types.ObjectId.isValid(input.teamId) || !await Team_1.Team.exists({ _id: input.teamId, organizationId, archivedAt: null })) {
                throw (0, errors_1.badRequest)("Team does not belong to this workspace");
            }
        }
        update.teamId = input.teamId;
    }
    const user = await User_1.User.findOneAndUpdate({ _id: memberId, organizationId }, { $set: update }, { new: true })
        .select("name email role teamId organizationId");
    if (!user)
        throw (0, errors_1.notFound)("Member not found");
    return user;
}
export async function ensureTeamAccess(organizationId: string, teamId: string, actorTeamId: string, canViewAll: boolean) {
    if (!mongoose_1.Types.ObjectId.isValid(teamId))
        throw (0, errors_1.notFound)("Team not found");
    const team = await Team_1.Team.findOne({ _id: teamId, organizationId, archivedAt: null }).lean();
    if (!team)
        throw (0, errors_1.notFound)("Team not found");
    if (!canViewAll && actorTeamId?.toString() !== teamId)
        throw (0, errors_1.forbidden)("You can only view your assigned team");
    return team;
}
