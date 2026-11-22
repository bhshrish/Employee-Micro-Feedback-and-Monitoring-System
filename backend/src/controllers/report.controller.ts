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
import * as pulse_service_1 from "../services/pulse.service";
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
export const summary = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const query = req.validatedQuery;
    const result = await (0, report_service_1.reportSummary)(req.auth.organizationId, query.period, query.metrics, await (0, pulse_service_1.organizationMinGroupSize)(req.auth.organizationId), reportTeamScope(req));
    res.json({ ...result, data: result });
});
export const previewPost = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const { period, metrics } = req.body;
    const result = await (0, report_service_1.reportSummary)(req.auth.organizationId, period, metrics, await (0, pulse_service_1.organizationMinGroupSize)(req.auth.organizationId), reportTeamScope(req));
    res.json({ ...result, data: result });
});
export const generate = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const teamId = reportTeamScope(req);
    const { period, metrics, format } = req.body;
    let report;
    const file = await (0, report_service_1.exportReport)(
        req.auth.organizationId,
        period,
        metrics,
        format,
        await (0, pulse_service_1.organizationMinGroupSize)(req.auth.organizationId),
        teamId,
    );
    report = await GeneratedReport_1.GeneratedReport.create({
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
export const downloadGenerated = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
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
