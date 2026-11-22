import { createHmac, randomBytes } from "node:crypto";
import { Types } from "mongoose";
import { getConfig } from "../config/env";
import { Alert } from "../models/Alert";
import { Attendance } from "../models/Attendance";
import { AuditLog } from "../models/AuditLog";
import { GeneratedReport } from "../models/GeneratedReport";
import { Invitation } from "../models/Invitation";
import { Organization } from "../models/Organization";
import { PulseResponse } from "../models/PulseResponse";
import { RefreshToken } from "../models/RefreshToken";
import { Team } from "../models/Team";
import { User } from "../models/User";
import { badRequest, conflict, forbidden, notFound } from "../utils/errors";
import { weekStart } from "../utils/week";

const PAGE_SIZE = 25;
const INVITATION_DAYS = 7;
const MAX_PAGE = 1000;

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type Id = string | Types.ObjectId;
type Role = "admin" | "manager" | "employee";

interface ListQuery {
    page?: number | string;
    role?: string;
    status?: string;
    q?: string;
    action?: string;
}

interface PopulatedRef {
    _id: Types.ObjectId;
    name?: string;
    email?: string;
}

interface MemberLike {
    _id: Id;
    name: string;
    email: string;
    role: string;
    isActive?: boolean;
    createdAt?: Date;
    teamId?: unknown;
}

interface AuditEntry {
    organizationId: Id;
    actorId: Id;
    actorName: string;
    action: string;
    targetType: string;
    targetId?: Id | null;
    targetLabel?: string;
    summary: string;
    metadata?: Record<string, unknown>;
}

interface UpdateMemberInput {
    role?: Role;
    isActive?: boolean;
    teamId?: string | null;
}

interface InviteMemberInput {
    email: string;
    teamId: string;
    role?: string;
}

interface IssueInvitationInput {
    organizationId: string;
    inviterId: string;
    email: string;
    teamId: string;
    role?: string;
}

interface UpdateSettingsInput {
    name?: string;
    minGroupSize?: number;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export function normalizePage(page: unknown): number {
    const parsed = Number(page);
    if (!Number.isFinite(parsed) || parsed < 1) return 1;
    return Math.min(MAX_PAGE, Math.floor(parsed));
}

export function escapeRegex(value: string): RegExp {
    return new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}

export function normalizeEmail(email: unknown): string {
    return String(email ?? "").trim().toLowerCase();
}

export function pagination(total: number, page: number) {
    return { total, page, pageSize: PAGE_SIZE, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export function asObjectId(value: unknown): Types.ObjectId {
    return value instanceof Types.ObjectId ? value : new Types.ObjectId(String(value));
}

function isDuplicateKey(error: unknown): boolean {
    return typeof error === "object" && error !== null && (error as { code?: number }).code === 11000;
}

/** Returns the populated document if `ref` was populated, otherwise null. */
function populatedRef(ref: unknown): PopulatedRef | null {
    if (ref && typeof ref === "object" && "name" in ref && "_id" in ref) {
        return ref as PopulatedRef;
    }
    return null;
}

export function publicMember(user: MemberLike) {
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

export function hashInvitationToken(token: string): string {
    return createHmac("sha256", getConfig().JWT_REFRESH_SECRET).update(token).digest("hex");
}

export async function recordAudit(entry: AuditEntry): Promise<void> {
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

export async function actorFor(organizationId: string, actorId: string) {
    const actor = await User.findOne({ _id: actorId, organizationId }).select("name").lean();
    if (!actor) throw forbidden("Your business account is unavailable");
    return actor;
}

export async function loadMember(organizationId: string, memberId: string) {
    if (!Types.ObjectId.isValid(memberId)) throw notFound("Member not found");
    const member = await User.findOne({ _id: memberId, organizationId }).populate("teamId", "name");
    if (!member) throw notFound("Member not found");
    return member;
}

export async function activeAdminCount(organizationId: string, excludeId?: Id | null): Promise<number> {
    return User.countDocuments({
        organizationId,
        role: "admin",
        isActive: { $ne: false },
        ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });
}

export async function revokeMemberSessions(userId: Id): Promise<void> {
    await RefreshToken.updateMany({ userId, revokedAt: null }, { $set: { revokedAt: new Date() } });
}

export async function resolveTeam(organizationId: string, teamId: string) {
    if (!Types.ObjectId.isValid(teamId)) throw notFound("Team not found");
    const team = await Team.findOne({ _id: teamId, organizationId, archivedAt: null }).lean();
    if (!team) throw notFound("Team not found");
    return team;
}

/* ------------------------------------------------------------------ */
/* Overview                                                            */
/* ------------------------------------------------------------------ */

export async function adminOverview(organizationId: string) {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const currentWeek = weekStart();

    const [
        members,
        activeMembers,
        admins,
        managers,
        employees,
        teams,
        pendingInvitations,
        openAlerts,
        pulseResponses,
        checkedInToday,
        currentlyIn,
    ] = await Promise.all([
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

    const participation = activeMembers
        ? Math.min(100, Math.round((pulseResponses / activeMembers) * 100))
        : 0;
    const week = currentWeek.toISOString().slice(0, 10);

    return {
        members,
        activeMembers,
        admins,
        managers,
        employees,
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

export async function listMembers(organizationId: string, query: ListQuery = {}) {
    const page = normalizePage(query.page);
    const filter: Record<string, unknown> = { organizationId };

    if (query.role) filter.role = query.role;
    if (query.status === "active") filter.isActive = { $ne: false };
    else if (query.status === "inactive") filter.isActive = false;
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

    return { members: users.map((user) => publicMember(user as unknown as MemberLike)), ...pagination(total, page) };
}

export async function updateMember(
    organizationId: string,
    actorId: string,
    memberId: string,
    input: UpdateMemberInput,
) {
    const member = await loadMember(organizationId, memberId);
    const actor = await actorFor(organizationId, actorId);
    const isSelf = String(member._id) === String(actorId);

    if (isSelf && input.role && input.role !== member.role) {
        throw badRequest("You cannot change your own role");
    }
    if (isSelf && input.isActive === false) {
        throw badRequest("You cannot deactivate your own account");
    }

    const update: Record<string, unknown> = {};
    if (input.role) update.role = input.role;
    if (input.isActive !== undefined) update.isActive = input.isActive;
    if (input.teamId !== undefined) {
        if (input.teamId !== null) await resolveTeam(organizationId, input.teamId);
        update.teamId = input.teamId;
    }
    if (!Object.keys(update).length) {
        throw badRequest("Provide a role, team, or account status to update");
    }

    const losesAdmin =
        member.role === "admin" && ((input.role && input.role !== "admin") || input.isActive === false);
    if (losesAdmin && !(await activeAdminCount(organizationId, member._id))) {
        throw badRequest("At least one active business admin is required");
    }

    const wasInactive = member.isActive === false;
    member.set(update);
    await member.save();
    if (update.isActive === false) await revokeMemberSessions(member._id);

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
    return publicMember(member as unknown as MemberLike);
}

/* ------------------------------------------------------------------ */
/* Invitations                                                         */
/* ------------------------------------------------------------------ */

// NOTE: types go AFTER the destructuring pattern. Writing `inviterId: string`
// inside the pattern renames the property to `string` instead of typing it.
export async function issueInvitation({
    organizationId,
    inviterId,
    email,
    teamId,
    role,
}: IssueInvitationInput) {
    const normalized = normalizeEmail(email);
    if (!normalized) throw badRequest("A work email is required");
    if (normalized === getConfig().OPS_ADMIN_EMAIL.toLowerCase()) {
        throw badRequest("This email is reserved for the platform administrator");
    }

    const team = await resolveTeam(organizationId, teamId);
    if (await User.exists({ email: normalized })) {
        throw conflict("An account with this email already exists", "EMAIL_IN_USE");
    }
    if (role === "admin") {
        throw badRequest("Invite a manager or employee; promote them to admin afterwards");
    }

    const rawToken = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + INVITATION_DAYS * 86_400_000);

    await Invitation.updateMany(
        { organizationId, email: normalized, acceptedAt: null },
        { $set: { acceptedAt: new Date() } },
    );

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

export async function inviteMember(organizationId: string, actorId: string, input: InviteMemberInput) {
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

export async function resendInvitation(organizationId: string, actorId: string, email: string) {
    const actor = await actorFor(organizationId, actorId);
    const normalized = normalizeEmail(email);

    const pending = await Invitation.findOne({
        organizationId,
        email: normalized,
        acceptedAt: null,
        expiresAt: { $gt: new Date() },
    })
        .sort({ createdAt: -1 })
        .lean();
    if (!pending) throw notFound("No pending invitation for this email");

    const invitation = await issueInvitation({
        organizationId,
        inviterId: actorId,
        email: normalized,
        teamId: String(pending.teamId),
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

export async function listInvitations(organizationId: string) {
    const invitations = await Invitation.find({
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
            role: invitation.role ?? "employee",
            teamId: team ? String(team._id) : null,
            teamName: team?.name ?? null,
            expiresAt: invitation.expiresAt,
            createdAt: invitation.createdAt,
        };
    });
}

export async function cancelInvitation(organizationId: string, actorId: string, invitationId: string) {
    if (!Types.ObjectId.isValid(invitationId)) throw notFound("Invitation not found");
    const actor = await actorFor(organizationId, actorId);

    const invitation = await Invitation.findOneAndUpdate(
        { _id: invitationId, organizationId, acceptedAt: null },
        { $set: { acceptedAt: new Date() } },
        { new: false },
    );
    if (!invitation) throw notFound("Invitation not found");

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

export async function listTeams(organizationId: string) {
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
        name: team.name as string,
        members: team.members as number,
        createdAt: team.createdAt as Date,
    }));
}

async function insertOrRestoreTeam(organizationId: string, name: string) {
    try {
        return await Team.create({ organizationId, name });
    } catch (error: unknown) {
        if (!isDuplicateKey(error)) throw error;
        const archived = await Team.findOneAndUpdate(
            { organizationId, name, archivedAt: { $ne: null } },
            { $set: { archivedAt: null } },
            { new: true },
        );
        if (!archived) throw conflict("A team with this name already exists", "TEAM_EXISTS");
        return archived;
    }
}

export async function createTeam(organizationId: string, actorId: string, name: string) {
    const actor = await actorFor(organizationId, actorId);
    const trimmed = String(name ?? "").trim();
    if (trimmed.length < 2) throw badRequest("Team names need at least two characters");

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

export async function renameTeam(organizationId: string, actorId: string, teamId: string, name: string) {
    const team = await resolveTeam(organizationId, teamId);
    const actor = await actorFor(organizationId, actorId);
    const trimmed = String(name ?? "").trim();
    if (trimmed.length < 2) throw badRequest("Team names need at least two characters");
    if (trimmed === team.name) {
        return { id: team._id.toString(), name: team.name, createdAt: team.createdAt };
    }

    try {
        const updated = await Team.findOneAndUpdate(
            { _id: team._id, organizationId, archivedAt: null },
            { $set: { name: trimmed } },
            { new: true },
        );
        if (!updated) throw notFound("Team not found");

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
    } catch (error: unknown) {
        if (isDuplicateKey(error)) throw conflict("A team with this name already exists", "TEAM_EXISTS");
        throw error;
    }
}

export async function archiveTeam(organizationId: string, actorId: string, teamId: string) {
    const team = await resolveTeam(organizationId, teamId);
    const actor = await actorFor(organizationId, actorId);

    if (await User.exists({ organizationId, teamId: team._id })) {
        throw badRequest("Reassign team members before archiving this team");
    }

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

/* ------------------------------------------------------------------ */
/* Alerts                                                              */
/* ------------------------------------------------------------------ */

export async function listAlerts(organizationId: string, query: ListQuery = {}) {
    const page = normalizePage(query.page);
    const filter: Record<string, unknown> = { organizationId };
    if (query.status) filter.status = query.status;

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

export async function updateAlert(organizationId: string, actorId: string, alertId: string, status: string) {
    if (!Types.ObjectId.isValid(alertId)) throw notFound("Alert not found");
    const actor = await actorFor(organizationId, actorId);

    const alert = await Alert.findOneAndUpdate(
        { _id: alertId, organizationId },
        { $set: { status, acknowledgedBy: actorId } },
        { new: true },
    ).populate("teamId", "name");
    if (!alert) throw notFound("Alert not found");

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

export async function listReports(organizationId: string, query: ListQuery = {}) {
    const page = normalizePage(query.page);
    const filter: Record<string, unknown> = { organizationId };

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

export async function getSettings(organizationId: string) {
    const organization = await Organization.findById(organizationId)
        .select("name minGroupSize isActive createdAt ownerId")
        .populate("ownerId", "name email")
        .lean();
    if (!organization) throw notFound("Workspace not found");

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

export async function updateSettings(organizationId: string, actorId: string, input: UpdateSettingsInput) {
    const actor = await actorFor(organizationId, actorId);
    const organization = await Organization.findById(organizationId).select("name minGroupSize");
    if (!organization) throw notFound("Workspace not found");

    const previous = { name: organization.name, minGroupSize: organization.minGroupSize };
    if (input.name !== undefined) organization.name = input.name;
    if (input.minGroupSize !== undefined) organization.minGroupSize = input.minGroupSize;
    await organization.save();

    await recordAudit({
        organizationId,
        actorId,
        actorName: actor.name,
        action: "settings.updated",
        targetType: "settings",
        targetId: organization._id,
        targetLabel: organization.name,
        summary:
            input.minGroupSize !== undefined && previous.minGroupSize !== input.minGroupSize
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

export async function listAuditLogs(organizationId: string, query: ListQuery = {}) {
    const page = normalizePage(query.page);
    const filter: Record<string, unknown> = { organizationId };
    if (query.action) filter.action = query.action;

    const [logs, total] = await Promise.all([
        AuditLog.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .lean(),
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