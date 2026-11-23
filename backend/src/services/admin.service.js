"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePage = normalizePage;
exports.escapeRegex = escapeRegex;
exports.normalizeEmail = normalizeEmail;
exports.pagination = pagination;
exports.asObjectId = asObjectId;
exports.publicMember = publicMember;
exports.hashInvitationToken = hashInvitationToken;
exports.recordAudit = recordAudit;
exports.actorFor = actorFor;
exports.loadMember = loadMember;
exports.activeBusinessCount = activeBusinessCount;
exports.revokeMemberSessions = revokeMemberSessions;
exports.resolveTeam = resolveTeam;
exports.adminOverview = adminOverview;
exports.listMembers = listMembers;
exports.updateMember = updateMember;
exports.issueInvitation = issueInvitation;
exports.inviteMember = inviteMember;
exports.resendInvitation = resendInvitation;
exports.listInvitations = listInvitations;
exports.cancelInvitation = cancelInvitation;
exports.listTeams = listTeams;
exports.createTeam = createTeam;
exports.renameTeam = renameTeam;
exports.archiveTeam = archiveTeam;
exports.listAlerts = listAlerts;
exports.updateAlert = updateAlert;
exports.listReports = listReports;
exports.getSettings = getSettings;
exports.updateSettings = updateSettings;
exports.listAuditLogs = listAuditLogs;
const node_crypto_1 = require("node:crypto");
const mongoose_1 = require("mongoose");
const env_1 = require("../config/env");
const Alert_1 = require("../models/Alert");
const Attendance_1 = require("../models/Attendance");
const AuditLog_1 = require("../models/AuditLog");
const GeneratedReport_1 = require("../models/GeneratedReport");
const Invitation_1 = require("../models/Invitation");
const Organization_1 = require("../models/Organization");
const PulseResponse_1 = require("../models/PulseResponse");
const RefreshToken_1 = require("../models/RefreshToken");
const Team_1 = require("../models/Team");
const User_1 = require("../models/User");
const errors_1 = require("../utils/errors");
const week_1 = require("../utils/week");
const PAGE_SIZE = 25;
const INVITATION_DAYS = 7;
const MAX_PAGE = 1000;
/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
function normalizePage(page) {
    const parsed = Number(page);
    if (!Number.isFinite(parsed) || parsed < 1)
        return 1;
    return Math.min(MAX_PAGE, Math.floor(parsed));
}
function escapeRegex(value) {
    return new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}
function normalizeEmail(email) {
    return String(email ?? "").trim().toLowerCase();
}
function pagination(total, page) {
    return { total, page, pageSize: PAGE_SIZE, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}
function asObjectId(value) {
    return value instanceof mongoose_1.Types.ObjectId ? value : new mongoose_1.Types.ObjectId(String(value));
}
function isDuplicateKey(error) {
    return typeof error === "object" && error !== null && error.code === 11000;
}
/** Returns the populated document if `ref` was populated, otherwise null. */
function populatedRef(ref) {
    if (ref && typeof ref === "object" && "name" in ref && "_id" in ref) {
        return ref;
    }
    return null;
}
function publicMember(user) {
    const team = populatedRef(user.teamId);
    return {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive !== false,
        createdAt: user.createdAt,
        teamId: team ? String(team._id) : user.teamId ? String(user.teamId) : null,
        teamName: team?.name ?? null,
    };
}
function hashInvitationToken(token) {
    return (0, node_crypto_1.createHmac)("sha256", (0, env_1.getConfig)().JWT_REFRESH_SECRET).update(token).digest("hex");
}
async function recordAudit(entry) {
    await AuditLog_1.AuditLog.create({
        organizationId: entry.organizationId,
        actorId: entry.actorId,
        actorName: entry.actorName,
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId ?? null,
        targetLabel: (entry.targetLabel ?? "").slice(0, 180),
        summary: entry.summary.slice(0, 300),
        metadata: entry.metadata ?? {},
    });
}
async function actorFor(organizationId, actorId) {
    const actor = await User_1.User.findOne({ _id: actorId, organizationId }).select("name").lean();
    if (!actor)
        throw (0, errors_1.forbidden)("Your business account is unavailable");
    return actor;
}
async function loadMember(organizationId, memberId) {
    if (!mongoose_1.Types.ObjectId.isValid(memberId))
        throw (0, errors_1.notFound)("Member not found");
    const member = await User_1.User.findOne({ _id: memberId, organizationId }).populate("teamId", "name");
    if (!member)
        throw (0, errors_1.notFound)("Member not found");
    return member;
}
async function activeBusinessCount(organizationId, excludeId) {
    return User_1.User.countDocuments({
        organizationId,
        role: "business",
        isActive: { $ne: false },
        ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });
}
async function revokeMemberSessions(userId) {
    await RefreshToken_1.RefreshToken.updateMany({ userId, revokedAt: null }, { $set: { revokedAt: new Date() } });
}
async function resolveTeam(organizationId, teamId) {
    if (!mongoose_1.Types.ObjectId.isValid(teamId))
        throw (0, errors_1.notFound)("Team not found");
    const team = await Team_1.Team.findOne({ _id: teamId, organizationId, archivedAt: null }).lean();
    if (!team)
        throw (0, errors_1.notFound)("Team not found");
    return team;
}
/* ------------------------------------------------------------------ */
/* Overview                                                            */
/* ------------------------------------------------------------------ */
async function adminOverview(organizationId) {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const currentWeek = (0, week_1.weekStart)();
    const [members, activeMembers, businesses, individuals, teams, pendingInvitations, openAlerts, pulseResponses, checkedInToday, currentlyIn,] = await Promise.all([
        User_1.User.countDocuments({ organizationId }),
        User_1.User.countDocuments({ organizationId, isActive: { $ne: false } }),
        User_1.User.countDocuments({ organizationId, role: "business", isActive: { $ne: false } }),
        User_1.User.countDocuments({ organizationId, role: "individual", isActive: { $ne: false } }),
        Team_1.Team.countDocuments({ organizationId, archivedAt: null }),
        Invitation_1.Invitation.countDocuments({ organizationId, acceptedAt: null, expiresAt: { $gt: new Date() } }),
        Alert_1.Alert.countDocuments({ organizationId, status: "open" }),
        PulseResponse_1.PulseResponse.countDocuments({ organizationId, weekStart: currentWeek }),
        Attendance_1.Attendance.countDocuments({ organizationId, checkedInAt: { $gte: startOfDay } }),
        Attendance_1.Attendance.countDocuments({ organizationId, checkedInAt: { $gte: startOfDay }, checkedOutAt: null }),
    ]);
    const participation = activeMembers
        ? Math.min(100, Math.round((pulseResponses / activeMembers) * 100))
        : 0;
    const week = currentWeek.toISOString().slice(0, 10);
    return {
        members,
        activeMembers,
        businesses,
        individuals,
        teams,
        pendingInvitations,
        openAlerts,
        pulse: { weekStart: week, responses: pulseResponses, participation },
        calmwork: { weekStart: week, responses: pulseResponses, participation },
        attendance: { checkedInToday, currentlyIn },
    };
}
/* ------------------------------------------------------------------ */
/* Members                                                             */
/* ------------------------------------------------------------------ */
async function listMembers(organizationId, query = {}) {
    const page = normalizePage(query.page);
    const filter = { organizationId };
    if (query.role)
        filter.role = query.role;
    if (query.status === "active")
        filter.isActive = { $ne: false };
    else if (query.status === "inactive")
        filter.isActive = false;
    if (query.q) {
        const search = escapeRegex(query.q);
        filter.$or = [{ name: search }, { email: search }];
    }
    const [users, total] = await Promise.all([
        User_1.User.find(filter)
            .select("name email role isActive teamId createdAt")
            .populate("teamId", "name")
            .sort({ name: 1 })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .lean(),
        User_1.User.countDocuments(filter),
    ]);
    return { members: users.map((user) => publicMember(user)), ...pagination(total, page) };
}
async function updateMember(organizationId, actorId, memberId, input) {
    const member = await loadMember(organizationId, memberId);
    const actor = await actorFor(organizationId, actorId);
    const isSelf = String(member._id) === String(actorId);
    if (isSelf && input.role && input.role !== member.role) {
        throw (0, errors_1.badRequest)("You cannot change your own role");
    }
    if (isSelf && input.isActive === false) {
        throw (0, errors_1.badRequest)("You cannot deactivate your own account");
    }
    const update = {};
    if (input.role)
        update.role = input.role;
    if (input.isActive !== undefined)
        update.isActive = input.isActive;
    if (input.teamId !== undefined) {
        if (input.teamId !== null)
            await resolveTeam(organizationId, input.teamId);
        update.teamId = input.teamId;
    }
    if (!Object.keys(update).length) {
        throw (0, errors_1.badRequest)("Provide a role, team, or account status to update");
    }
    const losesBusinessAccess = member.role === "business" && ((input.role && input.role !== "business") || input.isActive === false);
    if (losesBusinessAccess && !(await activeBusinessCount(organizationId, member._id))) {
        throw (0, errors_1.badRequest)("At least one active Business account is required");
    }
    const wasInactive = member.isActive === false;
    member.set(update);
    await member.save();
    if (update.isActive === false)
        await revokeMemberSessions(member._id);
    const deactivated = update.isActive === false;
    const reactivated = update.isActive === true && wasInactive;
    await recordAudit({
        organizationId,
        actorId,
        actorName: actor.name,
        action: deactivated ? "member.deactivated" : reactivated ? "member.reactivated" : "member.updated",
        targetType: "user",
        targetId: member._id,
        targetLabel: member.email,
        summary: deactivated
            ? `Deactivated ${member.name}`
            : reactivated
                ? `Reactivated ${member.name}`
                : `Updated ${member.name}`,
        metadata: { changes: update },
    });
    await member.populate("teamId", "name");
    return publicMember(member);
}
/* ------------------------------------------------------------------ */
/* Invitations                                                         */
/* ------------------------------------------------------------------ */
// NOTE: types go AFTER the destructuring pattern. Writing `inviterId: string`
// inside the pattern renames the property to `string` instead of typing it.
async function issueInvitation({ organizationId, inviterId, email, teamId, }) {
    const normalized = normalizeEmail(email);
    if (!normalized)
        throw (0, errors_1.badRequest)("A work email is required");
    if (normalized === (0, env_1.getConfig)().OPS_ADMIN_EMAIL.toLowerCase()) {
        throw (0, errors_1.badRequest)("This email is reserved for the platform administrator");
    }
    const team = await resolveTeam(organizationId, teamId);
    if (await User_1.User.exists({ email: normalized })) {
        throw (0, errors_1.conflict)("An account with this email already exists", "EMAIL_IN_USE");
    }
    const rawToken = (0, node_crypto_1.randomBytes)(32).toString("base64url");
    const expiresAt = new Date(Date.now() + INVITATION_DAYS * 86_400_000);
    await Invitation_1.Invitation.updateMany({ organizationId, email: normalized, acceptedAt: null }, { $set: { acceptedAt: new Date() } });
    const invitation = await Invitation_1.Invitation.create({
        organizationId,
        teamId: team._id,
        inviterId,
        email: normalized,
        role: "individual",
        tokenHash: hashInvitationToken(rawToken),
        expiresAt,
    });
    return {
        id: invitation._id.toString(),
        email: normalized,
        role: invitation.role,
        teamId: team._id.toString(),
        teamName: team.name,
        expiresAt,
        token: rawToken,
    };
}
async function inviteMember(organizationId, actorId, input) {
    const actor = await actorFor(organizationId, actorId);
    const invitation = await issueInvitation({
        organizationId,
        inviterId: actorId,
        email: input.email,
        teamId: input.teamId,
    });
    await recordAudit({
        organizationId,
        actorId,
        actorName: actor.name,
        action: "invitation.created",
        targetType: "invitation",
        targetId: invitation.id,
        targetLabel: invitation.email,
        summary: `Invited ${invitation.email} as ${invitation.role}`,
        metadata: { teamId: invitation.teamId, role: invitation.role },
    });
    return invitation;
}
async function resendInvitation(organizationId, actorId, email) {
    const actor = await actorFor(organizationId, actorId);
    const normalized = normalizeEmail(email);
    const pending = await Invitation_1.Invitation.findOne({
        organizationId,
        email: normalized,
        acceptedAt: null,
        expiresAt: { $gt: new Date() },
    })
        .sort({ createdAt: -1 })
        .lean();
    if (!pending)
        throw (0, errors_1.notFound)("No pending invitation for this email");
    const invitation = await issueInvitation({
        organizationId,
        inviterId: actorId,
        email: normalized,
        teamId: String(pending.teamId),
    });
    await recordAudit({
        organizationId,
        actorId,
        actorName: actor.name,
        action: "invitation.resent",
        targetType: "invitation",
        targetId: invitation.id,
        targetLabel: invitation.email,
        summary: `Reissued the invitation for ${invitation.email}`,
        metadata: { teamId: invitation.teamId },
    });
    return invitation;
}
async function listInvitations(organizationId) {
    const invitations = await Invitation_1.Invitation.find({
        organizationId,
        acceptedAt: null,
        expiresAt: { $gt: new Date() },
    })
        .populate("teamId", "name")
        .sort({ createdAt: -1 })
        .lean();
    return invitations.map((invitation) => {
        const team = populatedRef(invitation.teamId);
        return {
            id: invitation._id.toString(),
            email: invitation.email,
            role: "individual",
            teamId: team ? String(team._id) : null,
            teamName: team?.name ?? null,
            expiresAt: invitation.expiresAt,
            createdAt: invitation.createdAt,
        };
    });
}
async function cancelInvitation(organizationId, actorId, invitationId) {
    if (!mongoose_1.Types.ObjectId.isValid(invitationId))
        throw (0, errors_1.notFound)("Invitation not found");
    const actor = await actorFor(organizationId, actorId);
    const invitation = await Invitation_1.Invitation.findOneAndUpdate({ _id: invitationId, organizationId, acceptedAt: null }, { $set: { acceptedAt: new Date() } }, { new: false });
    if (!invitation)
        throw (0, errors_1.notFound)("Invitation not found");
    await recordAudit({
        organizationId,
        actorId,
        actorName: actor.name,
        action: "invitation.cancelled",
        targetType: "invitation",
        targetId: invitation._id,
        targetLabel: invitation.email,
        summary: `Cancelled the invitation for ${invitation.email}`,
    });
    return { id: invitation._id.toString(), email: invitation.email };
}
/* ------------------------------------------------------------------ */
/* Teams                                                               */
/* ------------------------------------------------------------------ */
async function listTeams(organizationId) {
    const teams = await Team_1.Team.aggregate([
        { $match: { organizationId: asObjectId(organizationId), archivedAt: null } },
        {
            $lookup: {
                from: "users",
                let: { teamId: "$_id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$teamId", "$$teamId"] }, isActive: { $ne: false } } },
                    { $count: "count" },
                ],
                as: "memberCount",
            },
        },
        { $project: { name: 1, createdAt: 1, members: { $ifNull: [{ $first: "$memberCount.count" }, 0] } } },
        { $sort: { name: 1 } },
    ]);
    return teams.map((team) => ({
        id: team._id.toString(),
        name: team.name,
        members: team.members,
        createdAt: team.createdAt,
    }));
}
async function insertOrRestoreTeam(organizationId, name) {
    try {
        return await Team_1.Team.create({ organizationId, name });
    }
    catch (error) {
        if (!isDuplicateKey(error))
            throw error;
        const archived = await Team_1.Team.findOneAndUpdate({ organizationId, name, archivedAt: { $ne: null } }, { $set: { archivedAt: null } }, { new: true });
        if (!archived)
            throw (0, errors_1.conflict)("A team with this name already exists", "TEAM_EXISTS");
        return archived;
    }
}
async function createTeam(organizationId, actorId, name) {
    const actor = await actorFor(organizationId, actorId);
    const trimmed = String(name ?? "").trim();
    if (trimmed.length < 2)
        throw (0, errors_1.badRequest)("Team names need at least two characters");
    const team = await insertOrRestoreTeam(organizationId, trimmed);
    await recordAudit({
        organizationId,
        actorId,
        actorName: actor.name,
        action: "team.created",
        targetType: "team",
        targetId: team._id,
        targetLabel: team.name,
        summary: `Created the team ${team.name}`,
    });
    return { id: team._id.toString(), name: team.name, members: 0, createdAt: team.createdAt };
}
async function renameTeam(organizationId, actorId, teamId, name) {
    const team = await resolveTeam(organizationId, teamId);
    const actor = await actorFor(organizationId, actorId);
    const trimmed = String(name ?? "").trim();
    if (trimmed.length < 2)
        throw (0, errors_1.badRequest)("Team names need at least two characters");
    if (trimmed === team.name) {
        return { id: team._id.toString(), name: team.name, createdAt: team.createdAt };
    }
    try {
        const updated = await Team_1.Team.findOneAndUpdate({ _id: team._id, organizationId, archivedAt: null }, { $set: { name: trimmed } }, { new: true });
        if (!updated)
            throw (0, errors_1.notFound)("Team not found");
        await recordAudit({
            organizationId,
            actorId,
            actorName: actor.name,
            action: "team.renamed",
            targetType: "team",
            targetId: updated._id,
            targetLabel: updated.name,
            summary: `Renamed the team ${team.name} to ${updated.name}`,
            metadata: { previousName: team.name },
        });
        return { id: updated._id.toString(), name: updated.name, createdAt: updated.createdAt };
    }
    catch (error) {
        if (isDuplicateKey(error))
            throw (0, errors_1.conflict)("A team with this name already exists", "TEAM_EXISTS");
        throw error;
    }
}
async function archiveTeam(organizationId, actorId, teamId) {
    const team = await resolveTeam(organizationId, teamId);
    const actor = await actorFor(organizationId, actorId);
    if (await User_1.User.exists({ organizationId, teamId: team._id })) {
        throw (0, errors_1.badRequest)("Reassign team members before archiving this team");
    }
    await Team_1.Team.updateOne({ _id: team._id, organizationId }, { $set: { archivedAt: new Date() } });
    await recordAudit({
        organizationId,
        actorId,
        actorName: actor.name,
        action: "team.archived",
        targetType: "team",
        targetId: team._id,
        targetLabel: team.name,
        summary: `Archived the team ${team.name}`,
    });
    return { id: team._id.toString(), name: team.name };
}
/* ------------------------------------------------------------------ */
/* Alerts                                                              */
/* ------------------------------------------------------------------ */
async function listAlerts(organizationId, query = {}) {
    const page = normalizePage(query.page);
    const filter = { organizationId };
    if (query.status)
        filter.status = query.status;
    const [alerts, total, openCount] = await Promise.all([
        Alert_1.Alert.find(filter)
            .populate("teamId", "name")
            .sort({ createdAt: -1 })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .lean(),
        Alert_1.Alert.countDocuments(filter),
        Alert_1.Alert.countDocuments({ organizationId, status: "open" }),
    ]);
    return {
        alerts: alerts.map((alert) => {
            const team = populatedRef(alert.teamId);
            return {
                id: alert._id.toString(),
                teamId: team ? String(team._id) : null,
                teamName: team?.name ?? null,
                type: alert.type,
                title: alert.title,
                detail: alert.detail,
                severity: alert.severity,
                score: alert.score,
                status: alert.status,
                createdAt: alert.createdAt,
            };
        }),
        openCount,
        ...pagination(total, page),
    };
}
async function updateAlert(organizationId, actorId, alertId, status) {
    if (!mongoose_1.Types.ObjectId.isValid(alertId))
        throw (0, errors_1.notFound)("Alert not found");
    const actor = await actorFor(organizationId, actorId);
    const alert = await Alert_1.Alert.findOneAndUpdate({ _id: alertId, organizationId }, { $set: { status, acknowledgedBy: actorId } }, { new: true }).populate("teamId", "name");
    if (!alert)
        throw (0, errors_1.notFound)("Alert not found");
    await recordAudit({
        organizationId,
        actorId,
        actorName: actor.name,
        action: `alert.${status}`,
        targetType: "alert",
        targetId: alert._id,
        targetLabel: alert.title,
        summary: `${status === "acknowledged" ? "Acknowledged" : "Dismissed"} the alert ${alert.title}`,
        metadata: { severity: alert.severity, score: alert.score },
    });
    const team = populatedRef(alert.teamId);
    return {
        id: alert._id.toString(),
        teamId: team ? String(team._id) : null,
        teamName: team?.name ?? null,
        status: alert.status,
        severity: alert.severity,
        title: alert.title,
    };
}
/* ------------------------------------------------------------------ */
/* Reports                                                             */
/* ------------------------------------------------------------------ */
const PULSE_CATALOG = [
    { key: "mood", label: "Mood", scale: 5 },
    { key: "stress", label: "Stress", scale: 5 },
    { key: "workload", label: "Workload", scale: 5 },
];
async function listReports(organizationId, query = {}) {
    const page = normalizePage(query.page);
    const filter = { organizationId };
    const [reports, total] = await Promise.all([
        GeneratedReport_1.GeneratedReport.find(filter)
            .select("-content")
            .populate("createdBy", "name email")
            .populate("teamId", "name")
            .sort({ createdAt: -1 })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .lean(),
        GeneratedReport_1.GeneratedReport.countDocuments(filter),
    ]);
    return {
        reports: reports.map((report) => {
            const team = populatedRef(report.teamId);
            const creator = populatedRef(report.createdBy);
            return {
                id: report._id.toString(),
                filename: report.filename,
                format: report.format,
                period: report.period,
                metrics: report.metrics,
                teamName: team?.name ?? null,
                createdByName: creator?.name ?? "Unknown",
                createdByEmail: creator?.email ?? "",
                createdAt: report.createdAt,
                expiresAt: report.expiresAt,
            };
        }),
        ...pagination(total, page),
    };
}
/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */
async function getSettings(organizationId) {
    const organization = await Organization_1.Organization.findById(organizationId)
        .select("name minGroupSize isActive createdAt ownerId")
        .populate("ownerId", "name email")
        .lean();
    if (!organization)
        throw (0, errors_1.notFound)("Workspace not found");
    const owner = populatedRef(organization.ownerId);
    return {
        organization: {
            id: organization._id.toString(),
            name: organization.name,
            minGroupSize: organization.minGroupSize,
            isActive: organization.isActive !== false,
            createdAt: organization.createdAt,
            ownerName: owner?.name ?? "",
            ownerEmail: owner?.email ?? "",
        },
        pulseCatalog: PULSE_CATALOG,
    };
}
async function updateSettings(organizationId, actorId, input) {
    const actor = await actorFor(organizationId, actorId);
    const organization = await Organization_1.Organization.findById(organizationId).select("name minGroupSize");
    if (!organization)
        throw (0, errors_1.notFound)("Workspace not found");
    const previous = { name: organization.name, minGroupSize: organization.minGroupSize };
    if (input.name !== undefined)
        organization.name = input.name;
    if (input.minGroupSize !== undefined)
        organization.minGroupSize = input.minGroupSize;
    await organization.save();
    await recordAudit({
        organizationId,
        actorId,
        actorName: actor.name,
        action: "settings.updated",
        targetType: "settings",
        targetId: organization._id,
        targetLabel: organization.name,
        summary: input.minGroupSize !== undefined && previous.minGroupSize !== input.minGroupSize
            ? `Changed the minimum group size to ${input.minGroupSize}`
            : `Named the business ${organization.name}`,
        metadata: { previous, changes: { ...input } },
    });
    return {
        organization: {
            id: organization._id.toString(),
            name: organization.name,
            minGroupSize: organization.minGroupSize,
        },
    };
}
/* ------------------------------------------------------------------ */
/* Audit logs                                                          */
/* ------------------------------------------------------------------ */
async function listAuditLogs(organizationId, query = {}) {
    const page = normalizePage(query.page);
    const filter = { organizationId };
    if (query.action)
        filter.action = query.action;
    const [logs, total] = await Promise.all([
        AuditLog_1.AuditLog.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .lean(),
        AuditLog_1.AuditLog.countDocuments(filter),
    ]);
    return {
        logs: logs.map((log) => ({
            id: log._id.toString(),
            actorName: log.actorName,
            action: log.action,
            targetType: log.targetType,
            targetLabel: log.targetLabel,
            summary: log.summary,
            createdAt: log.createdAt,
        })),
        ...pagination(total, page),
    };
}
