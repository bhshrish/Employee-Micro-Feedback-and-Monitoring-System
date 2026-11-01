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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitPulse = submitPulse;
exports.hasSubmitted = hasSubmitted;
exports.teamPulse = teamPulse;
exports.listAlerts = listAlerts;
exports.updateAlert = updateAlert;
exports.scoreTeamAlerts = scoreTeamAlerts;
exports.analyticsTrends = analyticsTrends;
exports.analyticsHeatmap = analyticsHeatmap;
exports.organizationMinGroupSize = organizationMinGroupSize;
exports.analyticsTeams = analyticsTeams;
exports.analyticsTeamTrend = analyticsTeamTrend;
var mongoose_1 = require("mongoose");
var Alert_1 = require("../models/Alert");
var PulseReceipt_1 = require("../models/PulseReceipt");
var PulseResponse_1 = require("../models/PulseResponse");
var Team_1 = require("../models/Team");
var User_1 = require("../models/User");
var Organization_1 = require("../models/Organization");
var errors_1 = require("../utils/errors");
var week_1 = require("../utils/week");
var burnout_1 = require("./burnout");
var logger_1 = require("../utils/logger");
function submitPulse(scope, input) {
    return __awaiter(this, void 0, void 0, function () {
        var week, error_1, error_2, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!scope.teamId)
                        throw (0, errors_1.notFound)("Assign a team before submitting the weekly pulse");
                    return [4 /*yield*/, Team_1.Team.exists({ _id: scope.teamId, organizationId: scope.organizationId, archivedAt: null })];
                case 1:
                    if (!(_a.sent())) {
                        throw (0, errors_1.notFound)("Assign an active team before submitting the weekly pulse");
                    }
                    week = (0, week_1.weekStart)();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, PulseReceipt_1.PulseReceipt.create({
                            organizationId: scope.organizationId,
                            teamId: scope.teamId,
                            userId: scope.userId,
                            weekStart: week,
                            expiresAt: new Date(week.getTime() + 14 * 86400000),
                        })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    if (error_1 && typeof error_1 === "object" && "code" in error_1 && error_1.code === 11000) {
                        throw (0, errors_1.conflict)("You have already submitted this week's pulse", "PULSE_ALREADY_SUBMITTED");
                    }
                    throw error_1;
                case 5:
                    _a.trys.push([5, 7, , 9]);
                    return [4 /*yield*/, PulseResponse_1.PulseResponse.create({
                            organizationId: scope.organizationId,
                            teamId: scope.teamId,
                            weekStart: week,
                            mood: input.mood,
                            stress: input.stress,
                            workload: input.workload,
                        })];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 7:
                    error_2 = _a.sent();
                    return [4 /*yield*/, PulseReceipt_1.PulseReceipt.deleteOne({ userId: scope.userId, weekStart: week })];
                case 8:
                    _a.sent();
                    throw error_2;
                case 9:
                    _a.trys.push([9, 11, , 12]);
                    return [4 /*yield*/, scoreTeamAlerts(scope.organizationId)];
                case 10:
                    _a.sent();
                    return [3 /*break*/, 12];
                case 11:
                    error_3 = _a.sent();
                    logger_1.logger.error({ err: error_3 }, "Failed to evaluate team wellbeing alerts after pulse submission");
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/, { submitted: true, submittedAt: new Date().toISOString(), weekStart: week.toISOString() }];
            }
        });
    });
}
function hasSubmitted(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = Boolean;
                    return [4 /*yield*/, PulseReceipt_1.PulseReceipt.exists({ userId: userId, weekStart: (0, week_1.weekStart)() })];
                case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
            }
        });
    });
}
function teamPulse(organizationId_1, teamId_1) {
    return __awaiter(this, arguments, void 0, function (organizationId, teamId, minResponses) {
        var currentWeek, teams, result, _i, teams_1, team, weekly, latest, memberCount, trend;
        if (minResponses === void 0) { minResponses = 5; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    currentWeek = (0, week_1.weekStart)();
                    return [4 /*yield*/, Team_1.Team.find(__assign({ organizationId: organizationId, archivedAt: null }, (teamId ? { _id: teamId } : {}))).select("_id name").lean()];
                case 1:
                    teams = _a.sent();
                    result = [];
                    _i = 0, teams_1 = teams;
                    _a.label = 2;
                case 2:
                    if (!(_i < teams_1.length)) return [3 /*break*/, 6];
                    team = teams_1[_i];
                    return [4 /*yield*/, PulseResponse_1.PulseResponse.aggregate([
                            { $match: { organizationId: organizationId, teamId: team._id, weekStart: { $gte: new Date(currentWeek.getTime() - 6 * 7 * 86400000), $lte: currentWeek } } },
                            { $group: { _id: "$weekStart", responses: { $sum: 1 }, mood: { $avg: "$mood" }, stress: { $avg: "$stress" }, workload: { $avg: "$workload" } } },
                            { $sort: { _id: 1 } },
                        ])];
                case 3:
                    weekly = _a.sent();
                    latest = weekly.find(function (entry) { return new Date(entry._id).getTime() === currentWeek.getTime(); });
                    if (!latest || latest.responses < minResponses)
                        return [3 /*break*/, 5];
                    return [4 /*yield*/, User_1.User.countDocuments({ organizationId: organizationId, teamId: team._id })];
                case 4:
                    memberCount = _a.sent();
                    trend = weekly.filter(function (entry) { return entry.responses >= minResponses; }).map(function (entry) { return ({
                        weekStart: entry._id,
                        responses: entry.responses,
                        mood: Number(entry.mood.toFixed(2)),
                        stress: Number(entry.stress.toFixed(2)),
                        workload: Number(entry.workload.toFixed(2)),
                    }); });
                    result.push({
                        teamId: team._id.toString(),
                        name: team.name,
                        responses: latest.responses,
                        participation: memberCount ? Math.min(100, Math.round((latest.responses / memberCount) * 100)) : 0,
                        mood: Number(latest.mood.toFixed(1)),
                        stress: Number(latest.stress.toFixed(1)),
                        workload: Number(latest.workload.toFixed(1)),
                        trend: trend,
                    });
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 2];
                case 6: return [2 /*return*/, result];
            }
        });
    });
}
function listAlerts(organizationId, status, teamId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, Alert_1.Alert.find(__assign(__assign({ organizationId: organizationId }, (status ? { status: status } : {})), (teamId ? { teamId: teamId } : {})))
                    .populate("teamId", "name")
                    .sort({ createdAt: -1 })
                    .lean()];
        });
    });
}
function updateAlert(organizationId, alertId, status, acknowledgedBy, teamId) {
    return __awaiter(this, void 0, void 0, function () {
        var alert;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!mongoose_1.Types.ObjectId.isValid(alertId))
                        throw (0, errors_1.notFound)("Alert not found");
                    return [4 /*yield*/, Alert_1.Alert.findOneAndUpdate(__assign({ _id: alertId, organizationId: organizationId }, (teamId ? { teamId: teamId } : {})), { $set: { status: status, acknowledgedBy: status === "acknowledged" ? acknowledgedBy : null } }, { new: true })];
                case 1:
                    alert = _a.sent();
                    if (!alert)
                        throw (0, errors_1.notFound)("Alert not found");
                    return [2 /*return*/, alert];
            }
        });
    });
}
function scoreTeamAlerts(organizationId, configuredMinResponses) {
    return __awaiter(this, void 0, void 0, function () {
        var minResponses, _a, week, priorWeek, fourWeeksAgo, teams, created, _loop_1, _i, teams_2, team;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(configuredMinResponses !== null && configuredMinResponses !== void 0)) return [3 /*break*/, 1];
                    _a = configuredMinResponses;
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, organizationMinGroupSize(organizationId)];
                case 2:
                    _a = _b.sent();
                    _b.label = 3;
                case 3:
                    minResponses = _a;
                    week = (0, week_1.weekStart)();
                    priorWeek = new Date(week.getTime() - 7 * 86400000);
                    fourWeeksAgo = new Date(week.getTime() - 3 * 7 * 86400000);
                    return [4 /*yield*/, Team_1.Team.find({ organizationId: organizationId, archivedAt: null }).select("_id name").lean()];
                case 4:
                    teams = _b.sent();
                    created = 0;
                    _loop_1 = function (team) {
                        var values, current, previous, memberCount, currentParticipation, previousParticipation, burnout, recent, consecutiveStressIncrease, candidates, _c, candidates_1, candidate, update;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0: return [4 /*yield*/, PulseResponse_1.PulseResponse.aggregate([
                                        { $match: { organizationId: organizationId, teamId: team._id, weekStart: { $gte: fourWeeksAgo, $lte: week } } },
                                        { $group: { _id: "$weekStart", count: { $sum: 1 }, stress: { $avg: "$stress" }, workload: { $avg: "$workload" }, mood: { $avg: "$mood" } } },
                                        { $sort: { _id: 1 } },
                                    ])];
                                case 1:
                                    values = _d.sent();
                                    current = values.find(function (row) { return new Date(row._id).getTime() === week.getTime(); });
                                    if (!current || current.count < minResponses)
                                        return [2 /*return*/, "continue"];
                                    previous = values.find(function (row) { return new Date(row._id).getTime() === priorWeek.getTime(); });
                                    return [4 /*yield*/, User_1.User.countDocuments({ organizationId: organizationId, teamId: team._id })];
                                case 2:
                                    memberCount = _d.sent();
                                    currentParticipation = memberCount ? current.count / memberCount : 0;
                                    previousParticipation = previous && memberCount ? previous.count / memberCount : undefined;
                                    burnout = (0, burnout_1.calculateBurnoutScore)(__assign({ stress: current.stress, workload: current.workload, mood: current.mood, participation: currentParticipation }, (previous ? __assign({ previousStress: previous.stress, previousWorkload: previous.workload, previousMood: previous.mood }, (previousParticipation !== undefined ? { previousParticipation: previousParticipation } : {})) : {})));
                                    recent = values.filter(function (row) { return row.count >= minResponses; }).slice(-4);
                                    consecutiveStressIncrease = recent.length === 4 && recent.slice(1).every(function (row, index) {
                                        return recent[index].stress > 0 && row.stress >= recent[index].stress * 1.15;
                                    });
                                    candidates = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], (burnout.score >= 40 ? [{
                                            type: "burnout_risk",
                                            title: "".concat(team.name, " wellbeing signals need attention"),
                                            detail: "Aggregated stress, workload, mood, participation, and week-over-week change crossed the support threshold.",
                                        }] : []), true), (consecutiveStressIncrease ? [{
                                            type: "stress_trend",
                                            title: "".concat(team.name, " stress has increased for three weeks"),
                                            detail: "Average stress has increased by at least 15% for three consecutive eligible weeks.",
                                        }] : []), true), (current.mood <= 2.5 ? [{
                                            type: "low_mood",
                                            title: "".concat(team.name, " mood is low"),
                                            detail: "The team's aggregated mood score is at or below 2.5.",
                                        }] : []), true), (previousParticipation !== undefined && previousParticipation >= 0.7 && currentParticipation <= 0.5 ? [{
                                            type: "participation_collapse",
                                            title: "".concat(team.name, " pulse participation has fallen"),
                                            detail: "Participation has fallen from at least 70% to 50% or less.",
                                        }] : []), true);
                                    _c = 0, candidates_1 = candidates;
                                    _d.label = 3;
                                case 3:
                                    if (!(_c < candidates_1.length)) return [3 /*break*/, 6];
                                    candidate = candidates_1[_c];
                                    return [4 /*yield*/, Alert_1.Alert.updateOne({ organizationId: organizationId, teamId: team._id, type: candidate.type, status: "open" }, {
                                            $set: {
                                                key: "".concat(team._id.toString(), ":").concat(week.toISOString(), ":").concat(candidate.type),
                                                title: candidate.title,
                                                detail: candidate.detail,
                                                severity: burnout.severity,
                                                score: burnout.score,
                                                metrics: __assign(__assign({}, burnout.components), { stress: current.stress, workload: current.workload, mood: current.mood, participation: currentParticipation }),
                                            },
                                            $setOnInsert: { organizationId: organizationId, teamId: team._id, type: candidate.type },
                                        }, { upsert: true })];
                                case 4:
                                    update = _d.sent();
                                    if (update.upsertedCount)
                                        created += 1;
                                    _d.label = 5;
                                case 5:
                                    _c++;
                                    return [3 /*break*/, 3];
                                case 6: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, teams_2 = teams;
                    _b.label = 5;
                case 5:
                    if (!(_i < teams_2.length)) return [3 /*break*/, 8];
                    team = teams_2[_i];
                    return [5 /*yield**/, _loop_1(team)];
                case 6:
                    _b.sent();
                    _b.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8: return [2 /*return*/, created];
            }
        });
    });
}
function analyticsTrends(organizationId, teamId, weeks, minResponses) {
    return __awaiter(this, void 0, void 0, function () {
        var start, teams, results, _i, teams_3, team, series;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    start = (0, week_1.weekStart)();
                    start.setUTCDate(start.getUTCDate() - (weeks - 1) * 7);
                    return [4 /*yield*/, Team_1.Team.find(__assign({ organizationId: organizationId, archivedAt: null }, (teamId ? { _id: teamId } : {}))).select("_id name").lean()];
                case 1:
                    teams = _a.sent();
                    results = [];
                    _i = 0, teams_3 = teams;
                    _a.label = 2;
                case 2:
                    if (!(_i < teams_3.length)) return [3 /*break*/, 5];
                    team = teams_3[_i];
                    return [4 /*yield*/, PulseResponse_1.PulseResponse.aggregate([
                            { $match: { organizationId: organizationId, teamId: team._id, weekStart: { $gte: start } } },
                            { $group: {
                                    _id: "$weekStart",
                                    responses: { $sum: 1 },
                                    mood: { $avg: "$mood" },
                                    stress: { $avg: "$stress" },
                                    workload: { $avg: "$workload" },
                                } },
                            { $match: { responses: { $gte: minResponses } } },
                            { $sort: { _id: 1 } },
                        ])];
                case 3:
                    series = _a.sent();
                    if (series.length) {
                        results.push({
                            teamId: team._id.toString(),
                            teamName: team.name,
                            weeks: series.map(function (entry) { return ({
                                weekStart: entry._id,
                                responses: entry.responses,
                                mood: Number(entry.mood.toFixed(2)),
                                stress: Number(entry.stress.toFixed(2)),
                                workload: Number(entry.workload.toFixed(2)),
                            }); }),
                        });
                    }
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, results];
            }
        });
    });
}
function analyticsHeatmap(organizationId, teamId, weeks, minResponses) {
    return __awaiter(this, void 0, void 0, function () {
        var start, rows, teams, names;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    start = (0, week_1.weekStart)();
                    start.setUTCDate(start.getUTCDate() - (weeks - 1) * 7);
                    return [4 /*yield*/, PulseResponse_1.PulseResponse.aggregate([
                            { $match: __assign(__assign({ organizationId: organizationId }, (teamId ? { teamId: teamId } : {})), { weekStart: { $gte: start } }) },
                            { $group: {
                                    _id: { teamId: "$teamId", weekStart: "$weekStart" },
                                    responses: { $sum: 1 },
                                    mood: { $avg: "$mood" },
                                    stress: { $avg: "$stress" },
                                    workload: { $avg: "$workload" },
                                } },
                            { $match: { responses: { $gte: minResponses } } },
                            { $sort: { "_id.weekStart": 1 } },
                        ])];
                case 1:
                    rows = _a.sent();
                    return [4 /*yield*/, Team_1.Team.find({
                            organizationId: organizationId,
                            _id: { $in: rows.map(function (row) { return row._id.teamId; }) },
                        }).select("_id name").lean()];
                case 2:
                    teams = _a.sent();
                    names = new Map(teams.map(function (team) { return [team._id.toString(), team.name]; }));
                    return [2 /*return*/, rows.map(function (entry) {
                            var _a;
                            return ({
                                teamId: entry._id.teamId.toString(),
                                teamName: (_a = names.get(entry._id.teamId.toString())) !== null && _a !== void 0 ? _a : "Team",
                                weekStart: entry._id.weekStart,
                                responses: entry.responses,
                                mood: Number(entry.mood.toFixed(2)),
                                stress: Number(entry.stress.toFixed(2)),
                                workload: Number(entry.workload.toFixed(2)),
                                riskScore: Math.round(((entry.stress + entry.workload + (6 - entry.mood)) / 15) * 100),
                            });
                        })];
            }
        });
    });
}
function organizationMinGroupSize(organizationId) {
    return __awaiter(this, void 0, void 0, function () {
        var organization;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Organization_1.Organization.findOne({ _id: organizationId })
                        .select("minGroupSize").lean()];
                case 1:
                    organization = _b.sent();
                    return [2 /*return*/, (_a = organization === null || organization === void 0 ? void 0 : organization.minGroupSize) !== null && _a !== void 0 ? _a : 5];
            }
        });
    });
}
function analyticsTeams(organizationId, minResponses, teamId) {
    return __awaiter(this, void 0, void 0, function () {
        var teams, currentWeek;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Team_1.Team.find({ organizationId: organizationId, archivedAt: null, ...(teamId ? { _id: teamId } : {}) }).select("_id name").lean()];
                case 1:
                    teams = _a.sent();
                    currentWeek = (0, week_1.weekStart)();
                    return [2 /*return*/, Promise.all(teams.map(function (team) { return __awaiter(_this, void 0, void 0, function () {
                            var latest, group;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, PulseResponse_1.PulseResponse.aggregate([
                                            { $match: { organizationId: organizationId, teamId: team._id, weekStart: currentWeek } },
                                            { $group: { _id: "$weekStart", responses: { $sum: 1 }, mood: { $avg: "$mood" }, stress: { $avg: "$stress" }, workload: { $avg: "$workload" } } },
                                        ])];
                                    case 1:
                                        latest = _a.sent();
                                        group = latest[0];
                                        if (!group || group.responses < minResponses) {
                                            return [2 /*return*/, { teamId: String(team._id), name: team.name, suppressed: true, reason: "MINIMUM_GROUP_SIZE" }];
                                        }
                                        return [2 /*return*/, {
                                                teamId: String(team._id),
                                                name: team.name,
                                                suppressed: false,
                                                responses: group.responses,
                                                mood: Number(group.mood.toFixed(1)),
                                                stress: Number(group.stress.toFixed(1)),
                                                workload: Number(group.workload.toFixed(1)),
                                            }];
                                }
                            });
                        }); }))];
            }
        });
    });
}
function analyticsTeamTrend(organizationId, teamId, weeks, minResponses) {
    return __awaiter(this, void 0, void 0, function () {
        var start, rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    start = (0, week_1.weekStart)();
                    start.setUTCDate(start.getUTCDate() - (weeks - 1) * 7);
                    return [4 /*yield*/, PulseResponse_1.PulseResponse.aggregate([
                            { $match: { organizationId: organizationId, teamId: teamId, weekStart: { $gte: start } } },
                            { $group: { _id: "$weekStart", responses: { $sum: 1 }, mood: { $avg: "$mood" }, stress: { $avg: "$stress" }, workload: { $avg: "$workload" } } },
                            { $sort: { _id: 1 } },
                        ])];
                case 1:
                    rows = _a.sent();
                    if (!rows.length || rows.some(function (row) { return row.responses < minResponses; })) {
                        return [2 /*return*/, { teamId: teamId.toString(), suppressed: true, reason: "MINIMUM_GROUP_SIZE" }];
                    }
                    return [2 /*return*/, {
                            teamId: teamId.toString(),
                            suppressed: false,
                            weeks: rows.map(function (row) { return ({
                                weekStart: row._id,
                                responses: row.responses,
                                mood: Number(row.mood.toFixed(2)),
                                stress: Number(row.stress.toFixed(2)),
                                workload: Number(row.workload.toFixed(2)),
                            }); }),
                        }];
            }
        });
    });
}
