import type { Request, Response } from "express";

interface AuthContext {
    userId: import("mongoose").Types.ObjectId;
    organizationId: import("mongoose").Types.ObjectId;
    teamId: import("mongoose").Types.ObjectId | null;
    role: "employee" | "manager" | "admin";
}

interface ControllerRequest extends Request {
    auth?: AuthContext;
    validatedQuery?: Record<string, string | number | undefined>;
}


import * as async_handler_1 from "../utils/async-handler";
import * as report_service_1 from "../services/report.service";
import * as errors_1 from "../utils/errors";
import * as GeneratedReport_1 from "../models/GeneratedReport";
import * as ReportPayment_1 from "../models/ReportPayment";
import * as pulse_service_1 from "../services/pulse.service";
import * as billing_service_1 from "../services/billing.service";
function reportTeamScope(req: ControllerRequest) {
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
exports.summary = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const query = req.validatedQuery;
    const result = await (0, report_service_1.reportSummary)(req.auth.organizationId, query.period, query.metrics, await (0, pulse_service_1.organizationMinGroupSize)(req.auth.organizationId), reportTeamScope(req));
    res.json({ ...result, data: result });
});
exports.previewPost = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const { period, metrics } = req.body;
    const result = await (0, report_service_1.reportSummary)(req.auth.organizationId, period, metrics, await (0, pulse_service_1.organizationMinGroupSize)(req.auth.organizationId), reportTeamScope(req));
    res.json({ ...result, data: result });
});
exports.createOrder = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const result = await (0, billing_service_1.createReportOrder)(req.auth.userId, req.auth.organizationId, req.body);
    res.status(201).json(result);
});
exports.generate = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const teamId = reportTeamScope(req);
    const payment = await (0, billing_service_1.verifyReportPayment)(req.auth.userId, req.auth.organizationId, req.body);
    const claimedPayment = await ReportPayment_1.ReportPayment.findOneAndUpdate({
        _id: payment._id,
        status: "paid",
        usedAt: null,
    }, { $set: { usedAt: new Date() } }, { new: true });
    if (!claimedPayment)
        throw (0, errors_1.conflict)("This report payment has already been used", "REPORT_PAYMENT_USED");
    let report;
    try {
        const file = await (0, report_service_1.exportReport)(
            req.auth.organizationId,
            claimedPayment.period,
            claimedPayment.metrics,
            claimedPayment.format,
            await (0, pulse_service_1.organizationMinGroupSize)(req.auth.organizationId),
            teamId,
        );
        report = await GeneratedReport_1.GeneratedReport.create({
            organizationId: req.auth.organizationId,
            teamId: teamId ?? null,
            createdBy: req.auth.userId,
            paymentId: claimedPayment._id,
            period: claimedPayment.period,
            metrics: claimedPayment.metrics,
            format: claimedPayment.format,
            contentType: file.contentType,
            filename: file.filename,
            content: Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content),
            expiresAt: new Date(Date.now() + 30 * 86_400_000),
        });
    }
    catch (error) {
        await ReportPayment_1.ReportPayment.updateOne(
            { _id: claimedPayment._id, usedAt: claimedPayment.usedAt },
            { $set: { usedAt: null } },
        );
        throw error;
    }
    res.status(201).json({
        report: {
            id: report._id.toString(),
            period: report.period,
            metrics: report.metrics,
            format: report.format,
            filename: report.filename,
            createdAt: report.createdAt,
            expiresAt: report.expiresAt,
            downloadUrl: `/api/v1/reports/${report._id.toString()}`,
        },
    });
});
exports.downloadGenerated = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const teamId = reportTeamScope(req);
    const report = await GeneratedReport_1.GeneratedReport.findOne({
        _id: req.params.reportId,
        organizationId: req.auth.organizationId,
        ...(req.auth.role === "manager" || req.auth.role === "employee" ? { createdBy: req.auth.userId } : {}),
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
