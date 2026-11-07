"use strict";
const asyncHandler = require("../utils/async-handler").asyncHandler;
const admin = require("../services/org-admin.service");
const { unauthorized } = require("../utils/errors");
function scope(req) {
    if (!req.auth)
        throw unauthorized();
    return req.auth;
}
exports.overview = asyncHandler(async (req, res) => res.json({ overview: await admin.overview(scope(req)) }));
exports.users = asyncHandler(async (req, res) => res.json(await admin.listUsers(scope(req), req.validatedQuery)));
exports.inviteUser = asyncHandler(async (req, res) => {
    const invitation = await admin.inviteUser(scope(req), req.body);
    res.status(201).json({ invitation });
});
exports.updateUser = asyncHandler(async (req, res) => res.json({ user: await admin.updateUser(scope(req), req.params.userId, req.body) }));
exports.resendInvite = asyncHandler(async (req, res) => res.json({
    invitation: await admin.resendInvite(scope(req), req.params.email),
}));
exports.teams = asyncHandler(async (req, res) => res.json({ teams: await admin.listTeams(scope(req)) }));
exports.createTeam = asyncHandler(async (req, res) => res.status(201).json({ team: await admin.saveTeam(scope(req), null, req.body) }));
exports.updateTeam = asyncHandler(async (req, res) => res.json({ team: await admin.saveTeam(scope(req), req.params.teamId, req.body) }));
exports.deleteTeam = asyncHandler(async (req, res) => res.json({ team: await admin.deleteTeam(scope(req), req.params.teamId) }));
exports.questions = asyncHandler(async (req, res) => res.json({ questions: await admin.listQuestions(scope(req)) }));
exports.createQuestion = asyncHandler(async (req, res) => res.status(201).json({
    question: await admin.saveQuestion(scope(req), null, req.body),
}));
exports.updateQuestion = asyncHandler(async (req, res) => res.json({
    question: await admin.saveQuestion(scope(req), req.params.questionId, req.body),
}));
exports.deleteQuestion = asyncHandler(async (req, res) => {
    await admin.deleteQuestion(scope(req), req.params.questionId);
    res.status(204).end();
});
exports.alertRules = asyncHandler(async (req, res) => res.json({ rules: await admin.getAlertRules(scope(req)) }));
exports.updateAlertRules = asyncHandler(async (req, res) => res.json({ rules: await admin.saveAlertRules(scope(req), req.body) }));
exports.alerts = asyncHandler(async (req, res) => res.json({ alerts: await admin.listAlerts(scope(req), req.validatedQuery.status) }));
exports.updateAlert = asyncHandler(async (req, res) => res.json({
    alert: await admin.updateAlert(scope(req), req.params.alertId, req.body.status),
}));
exports.reports = asyncHandler(async (req, res) => {
    const result = await admin.reports(scope(req), req.validatedQuery.period, req.validatedQuery.format);
    if (result.locked) {
        res.json({ locked: true, summary: result.summary });
        return;
    }
    if (req.validatedQuery.format) {
        res.setHeader("Content-Type", result.contentType);
        res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
        res.send(result.content);
        return;
    }
    res.json(result);
});
exports.auditLogs = asyncHandler(async (req, res) => res.json(await admin.auditLogs(scope(req), req.validatedQuery.page)));
exports.settings = asyncHandler(async (req, res) => res.json({ settings: await admin.getSettings(scope(req)) }));
exports.updateSettings = asyncHandler(async (req, res) => res.json({ settings: await admin.updateSettings(scope(req), req.body) }));
