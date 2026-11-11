"use strict";

const { createHmac, randomBytes } = require("node:crypto");
const { Types } = require("mongoose");
const { getConfig } = require("../config/env");
const { Alert } = require("../models/Alert");
const { Attendance } = require("../models/Attendance");
const { AuditLog } = require("../models/AuditLog");
const { GeneratedReport } = require("../models/GeneratedReport");
const { Invitation } = require("../models/Invitation");
const { Organization } = require("../models/Organization");
const { PulseResponse } = require("../models/PulseResponse");
const { RefreshToken } = require("../models/RefreshToken");
const { Team } = require("../models/Team");
const { User } = require("../models/User");
const { badRequest, conflict, forbidden, notFound } = require("../utils/errors");
const { weekStart } = require("../utils/week");

const PAGE_SIZE = 25;
const INVITATION_DAYS = 7;
const MAX_PAGE = 1000;
const RESERVED_EMAIL = "admin@gmail.com";

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

function publicMember(user) {
    const populatedTeam = user.teamId && typeof user.teamId === "object" && user.teamId.name !== undefined ? user.teamId : null;
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive !== false,
        createdAt: user.createdAt,
        teamId: populatedTeam ? populatedTeam._id.toString() : user.teamId?.toString?.() ?? null,
        teamName: populatedTeam?.name ?? null,
    };
}

function hashInvitationToken(token) {
    return createHmac("sha256", getConfig().JWT_REFRESH_SECRET).update(token).digest("hex");
}

async function recordAudit(entry) {
    await AuditLog.create({
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
    const actor = await User.findOne({ _id: actorId, organizationId }).select("name").lean();
    if (!actor)
        throw forbidden("Your business account is unavailable");
    return actor;
}

async function loadMember(organizationId, memberId) {
    if (!Types.ObjectId.isValid(memberId))
        throw notFound("Member not found");
    const member = await User.findOne({ _id: memberId, organizationId }).populate("teamId", "name");
    if (!member)
        throw notFound("Member not found");
    return member;
}

async function activeAdminCount(organizationId, excludeId) {
    return User.countDocuments({
        organizationId,
        role: "admin",
        isActive: { $ne: false },
        ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });
}

async function revokeMemberSessions(userId) {
    await RefreshToken.updateMany({ userId, revokedAt: null }, { $set: { revokedAt: new Date() } });
}

async function resolveTeam(organizationId, teamId) {
    if (!Types.ObjectId.isValid(teamId))
        throw notFound("Team not found");
    const team = await Team.findOne({ _id: teamId, organizationId, archivedAt: null }).lean();
    if (!team)
        throw notFound("Team not found");
    return team;
}

async function adminOverview(organizationId) {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const currentWeek = weekStart();
    const [members, activeMembers, admins, managers, employees, teams, pendingInvitations, openAlerts, pulseResponses, checkedInToday, currentlyIn] = await Promise.all([
        User.countDocuments({ organizationId }),
        User.countDocuments({ organizationId, isActive: { $ne: false } }),
        User.countDocuments({ organizationId, role: "admin", isActive: { $ne: false } }),
        User.countDocuments({ organizationId, role: "manager", isActive: { $ne: false } }),
        User.countDocuments({ organizationId, role: "employee", isActive: { $ne: false } }),
        Team.countDocuments({ organizationId, archivedAt: null }),
        Invitation.countDocuments({ organizationId, acceptedAt: null, expiresAt: { $gt: new Date() } }),
        Alert.countDocuments({ organizationId, status: "open" }),
        PulseResponse.countDocuments({ organizationId, weekStart: currentWeek }),
        Attendance.countDocuments({ organizationId, checkedInAt: { $gte: startOfDay } }),
        Attendance.countDocuments({ organizationId, checkedInAt: { $gte: startOfDay }, checkedOutAt: null }),
    ]);
    const participation = activeMembers ? Math.min(100, Math.round((pulseResponses / activeMembers) * 100)) : 0;
    return {
        members,
        activeMembers,
        admins,
        managers,
        employees,
        teams,
        pendingInvitations,
        openAlerts,
        calmwork: { weekStart: currentWeek.toISOString().slice(0, 10), responses: pulseResponses, participation },
        attendance: { checkedInToday, currentlyIn },
    };
}
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
        User.find(filter)
            .select("name email role isActive teamId createdAt")
            .populate("teamId", "name")
            .sort({ name: 1 })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .lean(),
        User.countDocuments(filter),
    ]);
    return { members: users.map(publicMember), ...pagination(total, page) };
}

async function updateMember(organizationId, actorId, memberId, input) {
    const member = await loadMember(organizationId, memberId);
    const actor = await actorFor(organizationId, actorId);
    const isSelf = member._id.equals(actorId);
    if (isSelf && input.role && input.role !== member.role)
        throw badRequest("You cannot change your own role");
    if (isSelf && input.isActive === false)
        throw badRequest("You cannot deactivate your own account");

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
    if (!Object.keys(update).length)
        throw badRequest("Provide a role, team, or account status to update");

    const losesAdmin = member.role === "admin" && ((input.role && input.role !== "admin") || input.isActive === false);
    if (losesAdmin && !await activeAdminCount(organizationId, member._id))
        throw badRequest("At least one active business admin is required");

    member.set(update);
    await member.save();
    if (update.isActive === false)
        await revokeMemberSessions(member._id);

    const deactivated = update.isActive === false;
    const reactivated = update.isActive === true && member.isActive !== false;
    await recordAudit({
        organizationId,
        actorId,
        actorName: actor.name,
        action: deactivated ? "member.deactivated" : reactivated ? "member.reactivated" : "member.updated",
        targetType: "user",
        targetId: member._id,
        targetLabel: member.email,
        summary: deactivated ? `Deactivated ${member.name}` : reactivated ? `Reactivated ${member.name}` : `Updated ${member.name}`,
        metadata: { changes: update },
    });
    await member.populate("teamId", "name");
    return publicMember(member);
}

async function issueInvitation({ organizationId, inviterId, email, teamId, role }) {
    const normalized = normalizeEmail(email);
    if (!normalized)
        throw badRequest("A work email is required");
    if (normalized === RESERVED_EMAIL)
        throw badRequest("This email is reserved for the platform administrator");
    const team = await resolveTeam(organizationId, teamId);
    if (await User.exists({ email: normalized }))
        throw conflict("An account with this email already exists", "EMAIL_IN_USE");
    if (role === "admin")
        throw badRequest("Invite a manager or employee; promote them to admin afterwards");

    const rawToken = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + INVITATION_DAYS * 86_400_000);
    await Invitation.updateMany({ organizationId, email: normalized, acceptedAt: null }, { $set: { acceptedAt: new Date() } });
    const invitation = await Invitation.create({
        organizationId,
        teamId: team._id,
        inviterId,
        email: normalized,
        role: role === "manager" ? "manager" : "employee",
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
        role: input.role ?? "employee",
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
    const pending = await Invitation.findOne({
        organizationId,
        email: normalized,
        acceptedAt: null,
        expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 }).lean();
    if (!pending)
        throw notFound("No pending invitation for this email");
    const invitation = await issueInvitation({
        organizationId,
        inviterId: actorId,
        email: normalized,
        teamId: pending.teamId.toString(),
        role: pending.role ?? "employee",
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
    const invitations = await Invitation.find({ organizationId, acceptedAt: null, expiresAt: { $gt: new Date() } })
        .populate("teamId", "name")
        .sort({ createdAt: -1 })
        .lean();
    return invitations.map((invitation) => ({
        id: invitation._id.toString(),
        email: invitation.email,
        role: invitation.role ?? "employee",
        teamId: invitation.teamId?._id?.toString() ?? null,
        teamName: invitation.teamId?.name ?? null,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
    }));
}

async function cancelInvitation(organizationId, actorId, invitationId) {
    if (!Types.ObjectId.isValid(invitationId))
        throw notFound("Invitation not found");
    const actor = await actorFor(organizationId, actorId);
    const invitation = await Invitation.findOneAndUpdate(
        { _id: invitationId, organizationId, acceptedAt: null },
        { $set: { acceptedAt: new Date() } },
        { new: false },
    );
    if (!invitation)
        throw notFound("Invitation not found");
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
function asObjectId(value) {
    return value instanceof Types.ObjectId ? value : new Types.ObjectId(String(value));
}

async function listTeams(organizationId) {
    const teams = await Team.aggregate([
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

async function createTeam(organizationId, actorId, name) {
    const actor = await actorFor(organizationId, actorId);
    const trimmed = String(name ?? "").trim();
    if (trimmed.length < 2)
        throw badRequest("Team names need at least two characters");
    let team;
    try {
        team = await Team.create({ organizationId, name: trimmed });
    }
    catch (error) {
        if (error?.code !== 11000)
            throw error;
        const archived = await Team.findOneAndUpdate(
            { organizationId, name: trimmed, archivedAt: { $ne: null } },
            { $set: { archivedAt: null } },
            { new: true },
        );
        if (!archived)
            throw conflict("A team with this name already exists", "TEAM_EXISTS");
        team = archived;
    }
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
        throw badRequest("Team names need at least two characters");
    if (trimmed === team.name)
        return { id: team._id.toString(), name: team.name, createdAt: team.createdAt };
    try {
        const updated = await Team.findOneAndUpdate(
            { _id: team._id, organizationId, archivedAt: null },
            { $set: { name: trimmed } },
            { new: true },
        );
        if (!updated)
            throw notFound("Team not found");
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
        if (error?.code === 11000)
            throw conflict("A team with this name already exists", "TEAM_EXISTS");
        throw error;
    }
}

async function archiveTeam(organizationId, actorId, teamId) {
    const team = await resolveTeam(organizationId, teamId);
    const actor = await actorFor(organizationId, actorId);
    if (await User.exists({ organizationId, teamId: team._id }))
        throw badRequest("Reassign team members before archiving this team");
    await Team.updateOne({ _id: team._id, organizationId }, { $set: { archivedAt: new Date() } });
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

async function listAlerts(organizationId, query = {}) {
    const page = normalizePage(query.page);
    const filter = { organizationId };
    if (query.status)
        filter.status = query.status;
    const [alerts, total, openCount] = await Promise.all([
        Alert.find(filter)
            .populate("teamId", "name")
            .sort({ createdAt: -1 })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .lean(),
        Alert.countDocuments(filter),
        Alert.countDocuments({ organizationId, status: "open" }),
    ]);
    return {
        alerts: alerts.map((alert) => ({
            id: alert._id.toString(),
            teamId: alert.teamId?._id?.toString() ?? null,
            teamName: alert.teamId?.name ?? null,
            type: alert.type,
            title: alert.title,
            detail: alert.detail,
            severity: alert.severity,
            score: alert.score,
            status: alert.status,
            createdAt: alert.createdAt,
        })),
        openCount,
        ...pagination(total, page),
    };
}

async function updateAlert(organizationId, actorId, alertId, status) {
    if (!Types.ObjectId.isValid(alertId))
        throw notFound("Alert not found");
    const actor = await actorFor(organizationId, actorId);
    const alert = await Alert.findOneAndUpdate(
        { _id: alertId, organizationId },
        { $set: { status, acknowledgedBy: actorId } },
        { new: true },
    ).populate("teamId", "name");
    if (!alert)
        throw notFound("Alert not found");
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
    return {
        id: alert._id.toString(),
        teamId: alert.teamId?._id?.toString() ?? null,
        teamName: alert.teamId?.name ?? null,
        status: alert.status,
        severity: alert.severity,
        title: alert.title,
    };
}
const PULSE_CATALOG = [
    { key: "mood", label: "Mood", scale: 5 },
    { key: "stress", label: "Stress", scale: 5 },
    { key: "workload", label: "Workload", scale: 5 },
];

async function listReports(organizationId, query = {}) {
    const page = normalizePage(query.page);
    const filter = { organizationId };
    const [reports, total] = await Promise.all([
        GeneratedReport.find(filter)
            .select("-content")
            .populate("createdBy", "name email")
            .populate("teamId", "name")
            .sort({ createdAt: -1 })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .lean(),
        GeneratedReport.countDocuments(filter),
    ]);
    return {
        reports: reports.map((report) => ({
            id: report._id.toString(),
            filename: report.filename,
            format: report.format,
            period: report.period,
            metrics: report.metrics,
            teamName: report.teamId?.name ?? null,
            createdByName: report.createdBy?.name ?? "Unknown",
            createdByEmail: report.createdBy?.email ?? "",
            createdAt: report.createdAt,
            expiresAt: report.expiresAt,
        })),
        ...pagination(total, page),
    };
}
async function getSettings(organizationId) {
    const organization = await Organization.findById(organizationId)
        .select("name minGroupSize isActive createdAt ownerId")
        .populate("ownerId", "name email")
        .lean();
    if (!organization)
        throw notFound("Workspace not found");
    return {
        organization: {
            id: organization._id.toString(),
            name: organization.name,
            minGroupSize: organization.minGroupSize,
            isActive: organization.isActive !== false,
            createdAt: organization.createdAt,
            ownerName: organization.ownerId?.name ?? "",
            ownerEmail: organization.ownerId?.email ?? "",
        },
        pulseCatalog: PULSE_CATALOG,
    };
}

async function updateSettings(organizationId, actorId, input) {
    const actor = await actorFor(organizationId, actorId);
    const organization = await Organization.findById(organizationId).select("name minGroupSize");
    if (!organization)
        throw notFound("Workspace not found");
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
        metadata: { previous, changes: input },
    });
    return {
        organization: {
            id: organization._id.toString(),
            name: organization.name,
            minGroupSize: organization.minGroupSize,
        },
    };
}

async function listAuditLogs(organizationId, query = {}) {
    const page = normalizePage(query.page);
    const filter = { organizationId };
    if (query.action)
        filter.action = query.action;
    const [logs, total] = await Promise.all([
        AuditLog.find(filter).sort({ createdAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean(),
        AuditLog.countDocuments(filter),
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

exports.adminOverview = adminOverview;
exports.listMembers = listMembers;
exports.updateMember = updateMember;
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
