"use strict";

const { asyncHandler } = require("../utils/async-handler");
const { unauthorized } = require("../utils/errors");
const admin = require("../services/admin.service");

function context(req) {
    if (!req.auth)
        throw unauthorized();
    return { organizationId: req.auth.organizationId, actorId: req.auth.userId };
}

exports.overview = asyncHandler(async (req, res) => {
    const { organizationId } = context(req);
    res.json({ overview: await admin.adminOverview(organizationId) });
});

exports.members = asyncHandler(async (req, res) => {
    const { organizationId } = context(req);
    res.json(await admin.listMembers(organizationId, req.validatedQuery ?? {}));
});

exports.updateMember = asyncHandler(async (req, res) => {
    const { organizationId, actorId } = context(req);
    const member = await admin.updateMember(organizationId, actorId, req.params.userId, req.body);
    res.json({ member });
});

exports.invite = asyncHandler(async (req, res) => {
    const { organizationId, actorId } = context(req);
    const invitation = await admin.inviteMember(organizationId, actorId, req.body);
    res.status(201).json({ invitation });
});

exports.resendInvite = asyncHandler(async (req, res) => {
    const { organizationId, actorId } = context(req);
    const invitation = await admin.resendInvitation(organizationId, actorId, req.params.email);
    res.status(201).json({ invitation });
});

exports.invitations = asyncHandler(async (req, res) => {
    const { organizationId } = context(req);
    res.json({ invitations: await admin.listInvitations(organizationId) });
});

exports.cancelInvite = asyncHandler(async (req, res) => {
    const { organizationId, actorId } = context(req);
    const invitation = await admin.cancelInvitation(organizationId, actorId, req.params.invitationId);
    res.json({ invitation });
});

exports.teams = asyncHandler(async (req, res) => {
    const { organizationId } = context(req);
    res.json({ teams: await admin.listTeams(organizationId) });
});

exports.createTeam = asyncHandler(async (req, res) => {
    const { organizationId, actorId } = context(req);
    const team = await admin.createTeam(organizationId, actorId, req.body.name);
    res.status(201).json({ team });
});

exports.renameTeam = asyncHandler(async (req, res) => {
    const { organizationId, actorId } = context(req);
    const team = await admin.renameTeam(organizationId, actorId, req.params.teamId, req.body.name);
    res.json({ team });
});

exports.archiveTeam = asyncHandler(async (req, res) => {
    const { organizationId, actorId } = context(req);
    const team = await admin.archiveTeam(organizationId, actorId, req.params.teamId);
    res.json({ team });
});

exports.alerts = asyncHandler(async (req, res) => {
    const { organizationId } = context(req);
    res.json(await admin.listAlerts(organizationId, req.validatedQuery ?? {}));
});

exports.updateAlert = asyncHandler(async (req, res) => {
    const { organizationId, actorId } = context(req);
    const alert = await admin.updateAlert(organizationId, actorId, req.params.alertId, req.body.status);
    res.json({ alert });
});

exports.reports = asyncHandler(async (req, res) => {
    const { organizationId } = context(req);
    res.json(await admin.listReports(organizationId, req.validatedQuery ?? {}));
});

exports.settings = asyncHandler(async (req, res) => {
    const { organizationId } = context(req);
    res.json(await admin.getSettings(organizationId));
});

exports.updateSettings = asyncHandler(async (req, res) => {
    const { organizationId, actorId } = context(req);
    res.json(await admin.updateSettings(organizationId, actorId, req.body));
});

exports.auditLogs = asyncHandler(async (req, res) => {
    const { organizationId } = context(req);
    res.json(await admin.listAuditLogs(organizationId, req.validatedQuery ?? {}));
});
