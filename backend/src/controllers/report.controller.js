"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadGenerated = exports.generate = exports.download = exports.previewPost = exports.preview = exports.summary = void 0;
const User_1 = require("../models/User");
const async_handler_1 = require("../utils/async-handler");
const report_service_1 = require("../services/report.service");
const errors_1 = require("../utils/errors");
const GeneratedReport_1 = require("../models/GeneratedReport");
const pulse_service_1 = require("../services/pulse.service");
function reportTeamScope(req) {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    if (req.auth.role === "admin")
        return undefined;
    if (req.auth.role !== "manager")
        throw (0, errors_1.forbidden)("Reports are available to workspace managers only");
    if (!req.auth.teamId)
        throw (0, errors_1.forbidden)("A manager must be assigned to a team");
    return req.auth.teamId;
}
async function activeReportSubscription(userId, organizationId, { allowTrial = false } = {}) {
    const user = await User_1.User.findOne({ _id: userId, organizationId })
        .select("subscription.plan subscription.status subscription.trialEndsAt");
    if (!user)
        throw (0, errors_1.unauthorized)();
    if (user.subscription.status === "trialing" && user.subscription.trialEndsAt <= new Date()) {
        user.subscription.status = "trial_expired";
        await user.save();
    }
    const active = user.subscription.status === "active";
    const trial = allowTrial && user.subscription.status === "trialing";
    if ((!active && !trial) || !["Team", "Business"].includes(user.subscription.plan)) {
        throw (0, errors_1.paymentRequired)("Reports require an active Team or Business subscription");
    }
    return user.subscription;
}
exports.summary = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const query = req.validatedQuery;
    await activeReportSubscription(req.auth.userId, req.auth.organizationId, { allowTrial: true });
    const result = await (0, report_service_1.reportSummary)(req.auth.organizationId, query.period, query.metrics, await (0, pulse_service_1.organizationMinGroupSize)(req.auth.organizationId), reportTeamScope(req));
    res.json({ ...result, data: result });
});
exports.preview = exports.summary;
exports.previewPost = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const { period, metrics } = req.body;
    await activeReportSubscription(req.auth.userId, req.auth.organizationId, { allowTrial: true });
    const result = await (0, report_service_1.reportSummary)(req.auth.organizationId, period, metrics, await (0, pulse_service_1.organizationMinGroupSize)(req.auth.organizationId), reportTeamScope(req));
    res.json({ ...result, data: result });
});
exports.download = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const query = req.validatedQuery;
    if (!query.format)
        throw new Error("Missing report format");
    const currentSubscription = await activeReportSubscription(req.auth.userId, req.auth.organizationId);
    const teamId = reportTeamScope(req);
    const file = await (0, report_service_1.exportReport)(req.auth.organizationId, currentSubscription, query.period, query.metrics, query.format, await (0, pulse_service_1.organizationMinGroupSize)(req.auth.organizationId), teamId);
    res.setHeader("Content-Type", file.contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${file.filename}"`);
    res.setHeader("Cache-Control", "no-store");
    res.send(file.content);
});
exports.generate = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const { period, metrics, format } = req.body;
    const currentSubscription = await activeReportSubscription(req.auth.userId, req.auth.organizationId);
    const teamId = reportTeamScope(req);
    const file = await (0, report_service_1.exportReport)(req.auth.organizationId, currentSubscription, period, metrics, format, await (0, pulse_service_1.organizationMinGroupSize)(req.auth.organizationId), teamId);
    const report = await GeneratedReport_1.GeneratedReport.create({
        organizationId: req.auth.organizationId,
        teamId: teamId ?? null,
        createdBy: req.auth.userId,
        period,
        metrics,
        format,
        contentType: file.contentType,
        filename: file.filename,
        content: Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content),
        expiresAt: new Date(Date.now() + 30 * 86_400_000),
    });
    res.status(201).json({
        report: {
            id: report._id.toString(),
            period,
            metrics,
            format,
            filename: report.filename,
            createdAt: report.createdAt,
            expiresAt: report.expiresAt,
            downloadUrl: `/api/v1/reports/${report._id.toString()}`,
        },
    });
});
exports.downloadGenerated = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    await activeReportSubscription(req.auth.userId, req.auth.organizationId);
    const teamId = reportTeamScope(req);
    const report = await GeneratedReport_1.GeneratedReport.findOne({
        _id: req.params.reportId,
        organizationId: req.auth.organizationId,
        ...(req.auth.role === "manager" ? { teamId } : {}),
        expiresAt: { $gt: new Date() },
    }).select("+content");
    if (!report)
        throw (0, errors_1.notFound)("Report not found");
    const requestedFormat = req.validatedQuery;
    if (requestedFormat?.format && requestedFormat.format !== report.format) {
        throw (0, errors_1.badRequest)("Requested format does not match the generated report");
    }
    res.setHeader("Content-Type", report.contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${report.filename}"`);
    res.setHeader("Cache-Control", "no-store");
    res.send(report.content);
});
