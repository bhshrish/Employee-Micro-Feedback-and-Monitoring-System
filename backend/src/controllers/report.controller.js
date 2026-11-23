"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadGenerated = exports.generate = exports.previewPost = exports.preview = exports.summary = void 0;
const async_handler_1 = __importStar(require("../utils/async-handler"));
const report_service_1 = __importStar(require("../services/report.service"));
const errors_1 = __importStar(require("../utils/errors"));
const GeneratedReport_1 = __importStar(require("../models/GeneratedReport"));
const pulse_service_1 = __importStar(require("../services/pulse.service"));
function reportTeamScope(req) {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    if (req.auth.role !== "business")
        throw (0, errors_1.forbidden)("Reports are available to Business accounts only");
    return undefined;
}
exports.summary = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const query = req.validatedQuery;
    const result = await (0, report_service_1.reportSummary)(req.auth.organizationId, query.period, query.metrics, await (0, pulse_service_1.organizationMinGroupSize)(req.auth.organizationId), reportTeamScope(req));
    res.json({ ...result, data: result });
});
exports.preview = exports.summary;
exports.previewPost = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const { period, metrics } = req.body;
    const result = await (0, report_service_1.reportSummary)(req.auth.organizationId, period, metrics, await (0, pulse_service_1.organizationMinGroupSize)(req.auth.organizationId), reportTeamScope(req));
    res.json({ ...result, data: result });
});
exports.generate = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const teamId = reportTeamScope(req);
    const { period, metrics, format } = req.body;
    const file = await (0, report_service_1.exportReport)(req.auth.organizationId, period, metrics, format, await (0, pulse_service_1.organizationMinGroupSize)(req.auth.organizationId), teamId);
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
            period: report.period,
            metrics: report.metrics,
            format: report.format,
            filename: report.filename,
            createdAt: report.createdAt,
            expiresAt: report.expiresAt,
            downloadUrl: `/reports/${report._id.toString()}`,
        },
    });
});
exports.downloadGenerated = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const teamId = reportTeamScope(req);
    const report = await GeneratedReport_1.GeneratedReport.findOne({
        _id: req.params.reportId,
        organizationId: req.auth.organizationId,
        ...(req.auth.role === "individual" ? { createdBy: req.auth.userId } : {}),
        ...(req.auth.role === "individual" ? { teamId } : {}),
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
