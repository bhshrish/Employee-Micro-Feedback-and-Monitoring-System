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
exports.reportSummary = reportSummary;
exports.exportReport = exportReport;
var pdfkit_1 = require("pdfkit");
var sync_1 = require("csv-stringify/sync");
var User_1 = require("../models/User");
var PulseResponse_1 = require("../models/PulseResponse");
var TeamActivity_1 = require("../models/TeamActivity");
var week_1 = require("../utils/week");
var errors_1 = require("../utils/errors");
function reportSummary(organizationId_1, period_1, metrics_1) {
    return __awaiter(this, arguments, void 0, function (organizationId, period, metrics, minResponses, teamId) {
        var _a, start, end, _b, activity, pulse, aggregate, visiblePulseGroups, atRisk, totalPulse, teamCount, activityVisible, activeSeconds, idleSeconds;
        var _c, _d, _e;
        if (minResponses === void 0) { minResponses = 5; }
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _a = (0, week_1.dateRange)(period), start = _a.start, end = _a.end;
                    return [4 /*yield*/, Promise.all([
                            TeamActivity_1.TeamActivity.aggregate([
                                { $match: __assign(__assign({ organizationId: organizationId }, (teamId ? { teamId: teamId } : {})), { startedAt: { $gte: start, $lte: end }, status: "stopped" }) },
                                { $group: {
                                        _id: null,
                                        activeSeconds: { $sum: "$activeSeconds" },
                                        idleSeconds: { $sum: "$idleSeconds" },
                                        productiveSeconds: { $sum: { $cond: [{ $eq: ["$category", "Productive"] }, "$activeSeconds", 0] } },
                                        sessions: { $sum: 1 },
                                        users: { $addToSet: "$userId" },
                                    } },
                            ]),
                            PulseResponse_1.PulseResponse.aggregate([
                                { $match: __assign(__assign({ organizationId: organizationId }, (teamId ? { teamId: teamId } : {})), { weekStart: { $gte: start, $lte: end } }) },
                                { $group: { _id: { teamId: "$teamId", weekStart: "$weekStart" }, count: { $sum: 1 }, mood: { $avg: "$mood" }, stress: { $avg: "$stress" }, workload: { $avg: "$workload" } } },
                            ]),
                        ])];
                case 1:
                    _b = _f.sent(), activity = _b[0], pulse = _b[1];
                    aggregate = (_c = activity[0]) !== null && _c !== void 0 ? _c : { activeSeconds: 0, idleSeconds: 0, sessions: 0 };
                    visiblePulseGroups = pulse.filter(function (group) { return group.count >= minResponses; });
                    atRisk = visiblePulseGroups.filter(function (group) { return group.stress + group.workload + (6 - group.mood) >= 11; }).length;
                    totalPulse = visiblePulseGroups.reduce(function (sum, group) { return sum + group.count; }, 0);
                    return [4 /*yield*/, User_1.User.distinct("teamId", __assign({ organizationId: organizationId, teamId: { $ne: null } }, (teamId ? { teamId: teamId } : {}))).then(function (ids) { return ids.length; })];
                case 2:
                    teamCount = _f.sent();
                    activityVisible = ((_e = (_d = aggregate.users) === null || _d === void 0 ? void 0 : _d.length) !== null && _e !== void 0 ? _e : 0) >= minResponses;
                    activeSeconds = activityVisible ? aggregate.activeSeconds : 0;
                    idleSeconds = activityVisible ? aggregate.idleSeconds : 0;
                    return [2 /*return*/, {
                            period: period,
                            metrics: metrics,
                            activeHours: Number((activeSeconds / 3600).toFixed(1)),
                            idleHours: Number((idleSeconds / 3600).toFixed(1)),
                            productivity: activeSeconds ? Math.round((aggregate.productiveSeconds / activeSeconds) * 100) : 0,
                            pulseParticipationResponses: totalPulse,
                            riskTeams: atRisk,
                            teams: teamCount,
                            sessions: activityVisible ? aggregate.sessions : 0,
                            generatedAt: new Date().toISOString(),
                        }];
            }
        });
    });
}
function exportReport(organizationId_1, subscription_1, period_1, metrics_1, format_1) {
    return __awaiter(this, arguments, void 0, function (organizationId, subscription, period, metrics, format, minResponses, teamId) {
        var summary, rows, selected, mapping, _i, metrics_2, metric, _a, _b, key, pdf, chunks, finished, _c, _d, _e, label, value;
        var _f;
        var _g;
        if (minResponses === void 0) { minResponses = 5; }
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    if (subscription.status !== "active" || !["Team", "Business"].includes(subscription.plan)) {
                        throw (0, errors_1.paymentRequired)("Report generation requires an active Team or Business subscription");
                    }
                    return [4 /*yield*/, reportSummary(organizationId, period, metrics, minResponses, teamId)];
                case 1:
                    summary = _h.sent();
                    rows = [["Period", summary.period]];
                    selected = {
                        "Active time (hours)": summary.activeHours,
                        "Idle time (hours)": summary.idleHours,
                        Productivity: "".concat(summary.productivity, "%"),
                        "Pulse responses (eligible groups only)": summary.pulseParticipationResponses,
                        "Teams requiring support": summary.riskTeams,
                        "Activity sessions": summary.sessions,
                    };
                    mapping = {
                        "Active time": ["Active time (hours)"],
                        "Idle time": ["Idle time (hours)"],
                        Productivity: ["Productivity"],
                        "Team pulse": ["Pulse responses (eligible groups only)"],
                        "Burnout risk": ["Teams requiring support"],
                    };
                    for (_i = 0, metrics_2 = metrics; _i < metrics_2.length; _i++) {
                        metric = metrics_2[_i];
                        for (_a = 0, _b = (_g = mapping[metric]) !== null && _g !== void 0 ? _g : []; _a < _b.length; _a++) {
                            key = _b[_a];
                            rows.push([key, selected[key]]);
                        }
                    }
                    if (format === "csv")
                        return [2 /*return*/, { contentType: "text/csv; charset=utf-8", filename: "pulse-report-".concat(period, ".csv"), content: (0, sync_1.stringify)(rows, { header: true, columns: ["Metric", "Value"] }) }];
                    pdf = new pdfkit_1.default({ size: "A4", margin: 52, info: { Title: "PULSE report", Author: "PULSE" } });
                    chunks = [];
                    finished = new Promise(function (resolve, reject) {
                        pdf.on("data", function (chunk) { return chunks.push(chunk); });
                        pdf.on("end", function () { return resolve(Buffer.concat(chunks)); });
                        pdf.on("error", reject);
                    });
                    pdf.fontSize(22).text("PULSE wellbeing report");
                    pdf.moveDown().fontSize(11).fillColor("#555").text("Period: ".concat(period, " \u00B7 Generated ").concat(new Date().toISOString()));
                    pdf.moveDown().fillColor("#111");
                    for (_c = 0, _d = rows.slice(1); _c < _d.length; _c++) {
                        _e = _d[_c], label = _e[0], value = _e[1];
                        pdf.fontSize(12).text("".concat(label, ": ").concat(value));
                    }
                    pdf.moveDown().fontSize(9).fillColor("#666").text("Aggregated and anonymized. Groups below ".concat(minResponses, " responses are excluded. This report is not an individual performance assessment."));
                    pdf.end();
                    _f = { contentType: "application/pdf", filename: "pulse-report-".concat(period, ".pdf") };
                    return [4 /*yield*/, finished];
                case 2: return [2 /*return*/, (_f.content = _h.sent(), _f)];
            }
        });
    });
}
