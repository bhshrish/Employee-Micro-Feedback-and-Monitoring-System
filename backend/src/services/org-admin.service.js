"use strict";
const mongoose = require("mongoose");
const { Organization } = require("../models/Organization");
const { User } = require("../models/User");
const { Team } = require("../models/Team");
const { PulseResponse } = require("../models/PulseResponse");
const { PulseQuestion } = require("../models/PulseQuestion");
const { AlertRule } = require("../models/AlertRule");
const { Alert } = require("../models/Alert");
const { AuditLog } = require("../models/AuditLog");
const { Invitation } = require("../models/Invitation");
const workspace = require("./workspace.service");
const billing = require("./billing.service");
const { reportSummary, exportReport } = require("./report.service");
const { weekStart } = require("../utils/week");
const { notFound, badRequest } = require("../utils/errors");

async function audit(scope, action, targetType, targetId = null, details = {}) {
    await AuditLog.create({
        organizationId: scope.organizationId,
        actorId: scope.userId,
        action,
        targetType,
        targetId: targetId?.toString() ?? null,
        details,
    });
}

async function overview(scope) {
    const organizationId = scope.organizationId;
    const minGroupSize = await Organization.findById(organizationId).select("minGroupSize").lean()
        .then((org) => org?.minGroupSize ?? 5);
    const [employees, teams, openAlerts, members, teamRows] = await Promise.all([
        User.countDocuments({ organizationId, role: { $ne: "admin" }, isActive: true }),
        Team.countDocuments({ organizationId, archivedAt: null }),
        Alert.countDocuments({ organizationId, status: "open" }),
        User.countDocuments({ organizationId, isActive: true }),
        Team.find({ organizationId, archivedAt: null }).select("_id name").sort({ name: 1 }).lean(),
    ]);
    const currentWeek = weekStart();
    const twelveWeeksAgo = new Date(currentWeek.getTime() - 11 * 7 * 86_400_000);
    const [weekly, currentTeamResponses, subscription] = await Promise.all([
        PulseResponse.aggregate([
            { $match: { organizationId, weekStart: { $gte: twelveWeeksAgo, $lte: currentWeek } } },
            { $group: { _id: { team: "$teamId", week: "$weekStart" }, count: { $sum: 1 }, mood: { $avg: "$mood" }, stress: { $avg: "$stress" } } },
            { $match: { count: { $gte: minGroupSize } } },
            { $sort: { "_id.week": 1 } },
        ]),
        PulseResponse.aggregate([
            { $match: { organizationId, weekStart: currentWeek } },
            { $group: { _id: "$teamId", count: { $sum: 1 }, mood: { $avg: "$mood" }, stress: { $avg: "$stress" } } },
        ]),
        billing.subscription(scope.userId),
    ]);
    const moraleByWeek = new Map();
    for (const row of weekly) {
        const key = new Date(row._id.week).toISOString().slice(0, 10);
        const current = moraleByWeek.get(key) ?? { weekStart: key, morale: 0, groups: 0 };
        current.morale += row.mood;
        current.groups += 1;
        moraleByWeek.set(key, current);
    }
    const moraleTrend = Array.from({ length: 12 }, (_, index) => {
        const date = new Date(twelveWeeksAgo.getTime() + index * 7 * 86_400_000).toISOString().slice(0, 10);
        const row = moraleByWeek.get(date);
        return { weekStart: date, morale: row ? Number((row.morale / row.groups).toFixed(2)) : null };
    });
    const teamParticipation = await Promise.all(teamRows.map(async (team) => {
        const row = currentTeamResponses.find((entry) => entry._id.toString() === team._id.toString());
        const teamMembers = await User.countDocuments({ organizationId, teamId: team._id, isActive: true });
        if (!row || row.count < minGroupSize)
            return { teamId: team._id, name: team.name, suppressed: true };
        return {
            teamId: team._id,
            name: team.name,
            suppressed: false,
            participation: teamMembers ? Math.round((row.count / teamMembers) * 100) : 0,
            morale: Number(row.mood.toFixed(2)),
            responses: row.count,
        };
    }));
    const eligible = currentTeamResponses.filter((row) => row.count >= minGroupSize);
    const averageMorale = eligible.length
        ? Number((eligible.reduce((sum, row) => sum + row.mood, 0) / eligible.length).toFixed(2))
        : null;
    return {
        employees,
        activeTeams: teams,
        totalTeams: teams,
        activeMembers: members,
        participationRate: members ? Math.min(100, Math.round((currentTeamResponses.reduce((sum, row) => sum + row.count, 0) / members) * 100)) : 0,
        averageMorale,
        burnoutRiskCount: openAlerts,
        minimumGroupSize: minGroupSize,
        notEnoughResponses: eligible.length === 0,
        moraleTrend,
        participationByTeam: teamParticipation,
        subscription,
    };
}

async function listUsers(scope, query = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = 20;
    const filter = { organizationId: scope.organizationId };
    if (query.q) {
        const search = query.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ];
    }
    if (query.role)
        filter.role = query.role;
    if (query.teamId)
        filter.teamId = query.teamId;
    if (query.status === "active")
        filter.isActive = true;
    if (query.status === "inactive")
        filter.isActive = false;
    if (query.status === "pending_invite")
        filter._id = { $exists: false };
    const invitationFilter = {
        organizationId: scope.organizationId,
        acceptedAt: null,
        ...(query.q ? { email: { $regex: query.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } } : {}),
        ...(query.role ? { role: query.role } : {}),
        ...(query.teamId ? { teamId: query.teamId } : {}),
    };
    const [users, total] = await Promise.all([
        query.status === "pending_invite"
            ? Promise.resolve([])
            : User.find(filter).select("name email role teamId isActive createdAt").populate("teamId", "name").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        query.status === "pending_invite" ? Promise.resolve(0) : User.countDocuments(filter),
    ]);
    const invitations = await Invitation.find(invitationFilter).select("email role teamId expiresAt")
        .populate("teamId", "name").sort({ createdAt: -1 }).lean();
    return { users, invitations, page, pageSize: limit, total, pages: Math.ceil(total / limit) };
}

async function inviteUser(scope, input) {
    const invite = await workspace.createInvitation(scope.organizationId, scope.userId, input.email, input.teamId, input.role);
    return invite;
}

async function updateUser(scope, userId, input) {
    if (!mongoose.Types.ObjectId.isValid(userId))
        throw notFound("User not found");
    const user = await User.findOne({ _id: userId, organizationId: scope.organizationId });
    if (!user)
        throw notFound("User not found");
    if (user._id.equals(scope.userId) && (input.role || input.isActive === false))
        throw badRequest("You cannot change your own role or deactivate your account");
    const organization = await Organization.findById(scope.organizationId).select("ownerId").lean();
    if (user._id.equals(organization?.ownerId) && (input.isActive === false || input.role && input.role !== "admin"))
        throw badRequest("The organization owner must remain an active administrator");
    if (user.role === "admin" && (input.isActive === false || input.role && input.role !== "admin")) {
        const adminCount = await User.countDocuments({ organizationId: scope.organizationId, role: "admin", isActive: true });
        if (adminCount <= 1)
            throw badRequest("An organization must retain an active administrator");
    }
    if (input.teamId !== undefined) {
        if (input.teamId && !await Team.exists({ _id: input.teamId, organizationId: scope.organizationId, archivedAt: null }))
            throw badRequest("Team does not belong to this organization");
        user.teamId = input.teamId || null;
    }
    if (input.role)
        user.role = input.role;
    if (input.isActive !== undefined)
        user.isActive = input.isActive;
    await user.save();
    await audit(scope, "user.updated", "user", user._id, {
        ...(input.role ? { role: input.role } : {}),
        ...(input.teamId !== undefined ? { teamId: input.teamId } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    });
    return User.findById(user._id).select("name email role teamId isActive createdAt").populate("teamId", "name").lean();
}

async function resendInvite(scope, email) {
    const invite = await Invitation.findOne({
        organizationId: scope.organizationId,
        email,
        acceptedAt: null,
    }).select("+tokenHash");
    if (!invite)
        throw notFound("Active invitation not found");
    const raw = require("node:crypto").randomBytes(32).toString("base64url");
    const tokenHash = require("node:crypto").createHmac("sha256", require("../config/env").getConfig().JWT_REFRESH_SECRET).update(raw).digest("hex");
    invite.tokenHash = tokenHash;
    invite.expiresAt = new Date(Date.now() + 7 * 86_400_000);
    await invite.save();
    await audit(scope, "user.invite_resent", "user", email);
    return { email, token: raw, expiresAt: invite.expiresAt };
}

async function listTeams(scope) {
    const teams = await Team.find({ organizationId: scope.organizationId, archivedAt: null })
        .populate("managerId", "name email")
        .sort({ name: 1 }).lean();
    return Promise.all(teams.map(async (team) => ({
        ...team,
        memberCount: await User.countDocuments({ organizationId: scope.organizationId, teamId: team._id, isActive: true }),
    })));
}

async function saveTeam(scope, teamId, input) {
    const ids = input.memberIds;
    if (ids) {
        const validCount = await User.countDocuments({ _id: { $in: ids }, organizationId: scope.organizationId });
        if (validCount !== ids.length)
            throw badRequest("Every selected member must belong to this organization");
    }
    let team;
    if (teamId) {
        if (!mongoose.Types.ObjectId.isValid(teamId))
            throw notFound("Team not found");
        team = await Team.findOne({ _id: teamId, organizationId: scope.organizationId, archivedAt: null });
        if (!team)
            throw notFound("Team not found");
    }
    else {
        team = new Team({ organizationId: scope.organizationId });
    }
    if (input.name !== undefined)
        team.name = input.name;
    if (input.managerId !== undefined) {
        if (input.managerId && !await User.exists({ _id: input.managerId, organizationId: scope.organizationId, role: "manager", isActive: true }))
            throw badRequest("The selected team manager must be an active manager in this organization");
        team.managerId = input.managerId || null;
    }
    await team.save();
    if (input.memberIds) {
        await User.updateMany({ organizationId: scope.organizationId, teamId: team._id, _id: { $nin: ids } }, { $set: { teamId: null } });
        await User.updateMany({ organizationId: scope.organizationId, _id: { $in: ids } }, { $set: { teamId: team._id } });
    }
    await audit(scope, teamId ? "team.updated" : "team.created", "team", team._id, {
        ...(input.name ? { name: input.name } : {}),
        ...(input.managerId !== undefined ? { managerId: input.managerId } : {}),
        ...(input.memberIds ? { memberCount: input.memberIds.length } : {}),
    });
    return team.toObject();
}

async function deleteTeam(scope, teamId) {
    return workspace.archiveTeam(scope.organizationId, teamId, scope.userId);
}

async function listQuestions(scope) {
    return PulseQuestion.find({ organizationId: scope.organizationId }).sort({ order: 1, createdAt: 1 }).lean();
}
async function saveQuestion(scope, questionId, input) {
    const question = questionId
        ? await PulseQuestion.findOne({ _id: questionId, organizationId: scope.organizationId })
        : new PulseQuestion({ organizationId: scope.organizationId });
    if (!question)
        throw notFound("Pulse question not found");
    for (const key of ["prompt", "type", "required", "active", "frequency", "scheduleDay", "order"])
        if (input[key] !== undefined)
            question[key] = input[key];
    await question.save();
    await audit(scope, questionId ? "pulse_question.updated" : "pulse_question.created", "pulse_question", question._id);
    return question;
}
async function deleteQuestion(scope, questionId) {
    const deleted = await PulseQuestion.findOneAndDelete({ _id: questionId, organizationId: scope.organizationId });
    if (!deleted)
        throw notFound("Pulse question not found");
    await audit(scope, "pulse_question.deleted", "pulse_question", questionId);
}

async function getAlertRules(scope) {
    let rules = await AlertRule.findOne({ organizationId: scope.organizationId }).lean();
    if (!rules)
        rules = await AlertRule.create({ organizationId: scope.organizationId });
    return rules;
}
async function saveAlertRules(scope, input) {
    const rules = await AlertRule.findOneAndUpdate(
        { organizationId: scope.organizationId },
        { $set: input, $setOnInsert: { organizationId: scope.organizationId } },
        { new: true, upsert: true, runValidators: true },
    );
    const organization = await Organization.findById(scope.organizationId);
    organization.alertEmailEnabled = input.emailEnabled;
    organization.alertInAppEnabled = input.inAppEnabled;
    await organization.save();
    await audit(scope, "alert_rules.updated", "organization", scope.organizationId, input);
    return rules;
}
async function listAlerts(scope, status) {
    return Alert.find({ organizationId: scope.organizationId, ...(status ? { status } : {}) })
        .populate("teamId", "name").sort({ createdAt: -1 }).limit(100).lean();
}
async function updateAlert(scope, alertId, status) {
    const alert = await Alert.findOneAndUpdate(
        { _id: alertId, organizationId: scope.organizationId },
        { $set: { status, acknowledgedBy: status === "acknowledged" ? scope.userId : null } },
        { new: true },
    );
    if (!alert)
        throw notFound("Alert not found");
    await audit(scope, "alert.status_changed", "alert", alertId, { status });
    return alert;
}
async function reports(scope, period, format) {
    const organization = await Organization.findById(scope.organizationId).select("minGroupSize").lean();
    const subscription = await billing.subscription(scope.userId);
    const minSize = organization?.minGroupSize ?? 5;
    const summary = await reportSummary(scope.organizationId, period, ["Team pulse", "Burnout risk"], minSize);
    const entitled = subscription.status === "active" && ["Team", "Business"].includes(subscription.plan);
    if (!entitled)
        return { summary, locked: true };
    if (format) {
        const report = await exportReport(scope.organizationId, subscription, period, ["Team pulse", "Burnout risk"], format, minSize);
        await audit(scope, "report.exported", "report", format, { period, format });
        return { ...report, locked: false };
    }
    return { summary, locked: false };
}
async function auditLogs(scope, page = 1) {
    const limit = 50;
    const [logs, total] = await Promise.all([
        AuditLog.find({ organizationId: scope.organizationId }).populate("actorId", "name email")
            .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        AuditLog.countDocuments({ organizationId: scope.organizationId }),
    ]);
    return { logs, page, pageSize: limit, total, pages: Math.ceil(total / limit) };
}
async function updateSettings(scope, input) {
    const organization = await Organization.findById(scope.organizationId);
    if (!organization)
        throw notFound("Organization not found");
    for (const key of ["name", "dataRetentionDays", "minGroupSize", "pulseReminderEnabled", "pulseReminderDay", "pulseReminderHour"])
        if (input[key] !== undefined)
            organization[key] = input[key];
    await organization.save();
    await audit(scope, "organization.settings_updated", "organization", organization._id, input);
    return {
        name: organization.name,
        dataRetentionDays: organization.dataRetentionDays,
        minGroupSize: organization.minGroupSize,
        alertEmailEnabled: organization.alertEmailEnabled,
        alertInAppEnabled: organization.alertInAppEnabled,
        pulseReminderEnabled: organization.pulseReminderEnabled,
        pulseReminderDay: organization.pulseReminderDay,
        pulseReminderHour: organization.pulseReminderHour,
    };
}
async function getSettings(scope) {
    const org = await Organization.findById(scope.organizationId).select("name dataRetentionDays minGroupSize alertEmailEnabled alertInAppEnabled pulseReminderEnabled pulseReminderDay pulseReminderHour createdAt trialEndsAt").lean();
    if (!org)
        throw notFound("Organization not found");
    return org;
}

module.exports = {
    overview, listUsers, inviteUser, updateUser, resendInvite, listTeams, saveTeam,
    deleteTeam, listQuestions, saveQuestion, deleteQuestion, getAlertRules,
    saveAlertRules, listAlerts, updateAlert, reports, auditLogs, updateSettings, getSettings,
};
