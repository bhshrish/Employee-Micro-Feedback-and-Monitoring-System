"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadGenerated = exports.generate = exports.download = exports.previewPost = exports.preview = exports.summary = void 0;
var User_1 = require("../models/User");
var async_handler_1 = require("../utils/async-handler");
var report_service_1 = require("../services/report.service");
var errors_1 = require("../utils/errors");
var GeneratedReport_1 = require("../models/GeneratedReport");
var pulse_service_1 = require("../services/pulse.service");
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
function activeReportSubscription(userId, organizationId) {
    return __awaiter(this, void 0, void 0, function () {
        var user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, User_1.User.findOne({ _id: userId, organizationId: organizationId })
                        .select("subscription.plan subscription.status subscription.trialEndsAt")];
                case 1:
                    user = _a.sent();
                    if (!user)
                        throw (0, errors_1.unauthorized)();
                    if (!(user.subscription.status === "trialing" && user.subscription.trialEndsAt <= new Date())) return [3 /*break*/, 3];
                    user.subscription.status = "trial_expired";
                    return [4 /*yield*/, user.save()];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    if (user.subscription.status !== "active" || !["Team", "Business"].includes(user.subscription.plan)) {
                        throw (0, errors_1.paymentRequired)("Reports require an active Team or Business subscription");
                    }
                    return [2 /*return*/, user.subscription];
            }
        });
    });
}
exports.summary = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, result, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                query = req.validatedQuery;
                return [4 /*yield*/, activeReportSubscription(req.auth.userId, req.auth.organizationId)];
            case 1:
                _c.sent();
                _a = report_service_1.reportSummary;
                _b = [req.auth.organizationId,
                    query.period,
                    query.metrics];
                return [4 /*yield*/, (0, pulse_service_1.organizationMinGroupSize)(req.auth.organizationId)];
            case 2: return [4 /*yield*/, _a.apply(void 0, _b.concat([_c.sent(), reportTeamScope(req)]))];
            case 3:
                result = _c.sent();
                res.json(__assign(__assign({}, result), { data: result }));
                return [2 /*return*/];
        }
    });
}); });
exports.preview = exports.summary;
exports.previewPost = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, period, metrics, result, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                _a = req.body, period = _a.period, metrics = _a.metrics;
                return [4 /*yield*/, activeReportSubscription(req.auth.userId, req.auth.organizationId)];
            case 1:
                _d.sent();
                _b = report_service_1.reportSummary;
                _c = [req.auth.organizationId,
                    period,
                    metrics];
                return [4 /*yield*/, (0, pulse_service_1.organizationMinGroupSize)(req.auth.organizationId)];
            case 2: return [4 /*yield*/, _b.apply(void 0, _c.concat([_d.sent(), reportTeamScope(req)]))];
            case 3:
                result = _d.sent();
                res.json(__assign(__assign({}, result), { data: result }));
                return [2 /*return*/];
        }
    });
}); });
exports.download = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, currentSubscription, teamId, file, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                query = req.validatedQuery;
                if (!query.format)
                    throw new Error("Missing report format");
                return [4 /*yield*/, activeReportSubscription(req.auth.userId, req.auth.organizationId)];
            case 1:
                currentSubscription = _c.sent();
                teamId = reportTeamScope(req);
                _a = report_service_1.exportReport;
                _b = [req.auth.organizationId,
                    currentSubscription,
                    query.period,
                    query.metrics,
                    query.format];
                return [4 /*yield*/, (0, pulse_service_1.organizationMinGroupSize)(req.auth.organizationId)];
            case 2: return [4 /*yield*/, _a.apply(void 0, _b.concat([_c.sent(), teamId]))];
            case 3:
                file = _c.sent();
                res.setHeader("Content-Type", file.contentType);
                res.setHeader("Content-Disposition", "attachment; filename=\"".concat(file.filename, "\""));
                res.setHeader("Cache-Control", "no-store");
                res.send(file.content);
                return [2 /*return*/];
        }
    });
}); });
exports.generate = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, period, metrics, format, currentSubscription, teamId, file, _b, _c, report;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                _a = req.body, period = _a.period, metrics = _a.metrics, format = _a.format;
                return [4 /*yield*/, activeReportSubscription(req.auth.userId, req.auth.organizationId)];
            case 1:
                currentSubscription = _d.sent();
                teamId = reportTeamScope(req);
                _b = report_service_1.exportReport;
                _c = [req.auth.organizationId,
                    currentSubscription,
                    period,
                    metrics,
                    format];
                return [4 /*yield*/, (0, pulse_service_1.organizationMinGroupSize)(req.auth.organizationId)];
            case 2: return [4 /*yield*/, _b.apply(void 0, _c.concat([_d.sent(), teamId]))];
            case 3:
                file = _d.sent();
                return [4 /*yield*/, GeneratedReport_1.GeneratedReport.create({
                        organizationId: req.auth.organizationId,
                        teamId: teamId !== null && teamId !== void 0 ? teamId : null,
                        createdBy: req.auth.userId,
                        period: period,
                        metrics: metrics,
                        format: format,
                        contentType: file.contentType,
                        filename: file.filename,
                        content: Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content),
                        expiresAt: new Date(Date.now() + 30 * 86400000),
                    })];
            case 4:
                report = _d.sent();
                res.status(201).json({
                    report: {
                        id: report._id.toString(),
                        period: period,
                        metrics: metrics,
                        format: format,
                        filename: report.filename,
                        createdAt: report.createdAt,
                        expiresAt: report.expiresAt,
                        downloadUrl: "/api/v1/reports/".concat(report._id.toString()),
                    },
                });
                return [2 /*return*/];
        }
    });
}); });
exports.downloadGenerated = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var teamId, report, requestedFormat;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                return [4 /*yield*/, activeReportSubscription(req.auth.userId, req.auth.organizationId)];
            case 1:
                _a.sent();
                teamId = reportTeamScope(req);
                return [4 /*yield*/, GeneratedReport_1.GeneratedReport.findOne(__assign(__assign({ _id: req.params.reportId, organizationId: req.auth.organizationId }, (req.auth.role === "manager" ? { teamId: teamId } : {})), { expiresAt: { $gt: new Date() } })).select("+content")];
            case 2:
                report = _a.sent();
                if (!report)
                    throw (0, errors_1.notFound)("Report not found");
                requestedFormat = req.validatedQuery;
                if ((requestedFormat === null || requestedFormat === void 0 ? void 0 : requestedFormat.format) && requestedFormat.format !== report.format) {
                    throw (0, errors_1.badRequest)("Requested format does not match the generated report");
                }
                res.setHeader("Content-Type", report.contentType);
                res.setHeader("Content-Disposition", "attachment; filename=\"".concat(report.filename, "\""));
                res.setHeader("Cache-Control", "no-store");
                res.send(report.content);
                return [2 /*return*/];
        }
    });
}); });
