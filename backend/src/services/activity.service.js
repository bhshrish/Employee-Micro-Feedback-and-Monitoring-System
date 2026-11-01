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
exports.startActivity = startActivity;
exports.heartbeatActivity = heartbeatActivity;
exports.setActivityIdle = setActivityIdle;
exports.setActivityTags = setActivityTags;
exports.pauseActivity = pauseActivity;
exports.resumeActivity = resumeActivity;
exports.finishActivity = finishActivity;
exports.activityHistory = activityHistory;
exports.dashboard = dashboard;
var TeamActivity_1 = require("../models/TeamActivity");
var errors_1 = require("../utils/errors");
var week_1 = require("../utils/week");
function startActivity(scope, input) {
    return __awaiter(this, void 0, void 0, function () {
        var running, startedAt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, TeamActivity_1.TeamActivity.findOne({ userId: scope.userId, status: { $in: ["running", "paused"] } })];
                case 1:
                    running = _a.sent();
                    if (running)
                        throw (0, errors_1.badRequest)("Stop the current activity session before starting another", "SESSION_ALREADY_OPEN");
                    startedAt = new Date();
                    return [2 /*return*/, TeamActivity_1.TeamActivity.create(__assign(__assign({}, scope), { task: input.task, category: input.category, startedAt: startedAt, heartbeatAt: startedAt, openSessionUserId: scope.userId }))];
            }
        });
    });
}
function heartbeatActivity(userId, organizationId, sessionId) {
    return __awaiter(this, void 0, void 0, function () {
        var session;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, TeamActivity_1.TeamActivity.findOneAndUpdate({ _id: sessionId, userId: userId, organizationId: organizationId, status: "running" }, { $set: { heartbeatAt: new Date() } }, { new: true })];
                case 1:
                    session = _a.sent();
                    if (!session)
                        throw (0, errors_1.notFound)("Running activity session not found");
                    return [2 /*return*/, session];
            }
        });
    });
}
function setActivityIdle(userId, organizationId, sessionId, idle) {
    return __awaiter(this, void 0, void 0, function () {
        var session, now;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, TeamActivity_1.TeamActivity.findOne({ _id: sessionId, userId: userId, organizationId: organizationId })];
                case 1:
                    session = _a.sent();
                    if (!session)
                        throw (0, errors_1.notFound)("Activity session not found");
                    if (session.status !== "running")
                        throw (0, errors_1.badRequest)("Idle state can only change while a session is running");
                    now = new Date();
                    if (idle && !session.idleStartedAt)
                        session.idleStartedAt = now;
                    if (!idle && session.idleStartedAt) {
                        session.idleSeconds += Math.max(0, Math.floor((now.getTime() - session.idleStartedAt.getTime()) / 1000));
                        session.idleStartedAt = null;
                    }
                    session.heartbeatAt = now;
                    return [4 /*yield*/, session.save()];
                case 2:
                    _a.sent();
                    return [2 /*return*/, session];
            }
        });
    });
}
function setActivityTags(userId, organizationId, sessionId, input) {
    return __awaiter(this, void 0, void 0, function () {
        var session;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, TeamActivity_1.TeamActivity.findOne({ _id: sessionId, userId: userId, organizationId: organizationId, status: { $ne: "stopped" } })];
                case 1:
                    session = _a.sent();
                    if (!session)
                        throw (0, errors_1.notFound)("Active activity session not found");
                    if (input.tags)
                        session.tags = __spreadArray([], new Set(input.tags.map(function (tag) { return tag.trim(); }).filter(Boolean)), true);
                    if (input.category)
                        session.category = input.category;
                    return [4 /*yield*/, session.save()];
                case 2:
                    _a.sent();
                    return [2 /*return*/, session];
            }
        });
    });
}
function pauseActivity(userId, organizationId, sessionId) {
    return __awaiter(this, void 0, void 0, function () {
        var session;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, TeamActivity_1.TeamActivity.findOne({ _id: sessionId, userId: userId, organizationId: organizationId })];
                case 1:
                    session = _a.sent();
                    if (!session)
                        throw (0, errors_1.notFound)("Activity session not found");
                    if (session.status !== "running")
                        throw (0, errors_1.badRequest)("Only a running activity can be paused");
                    if (session.idleStartedAt) {
                        session.idleSeconds += Math.max(0, Math.floor((Date.now() - session.idleStartedAt.getTime()) / 1000));
                        session.idleStartedAt = null;
                    }
                    session.status = "paused";
                    session.pausedAt = new Date();
                    return [4 /*yield*/, session.save()];
                case 2:
                    _a.sent();
                    return [2 /*return*/, session];
            }
        });
    });
}
function resumeActivity(userId, organizationId, sessionId) {
    return __awaiter(this, void 0, void 0, function () {
        var session;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, TeamActivity_1.TeamActivity.findOne({ _id: sessionId, userId: userId, organizationId: organizationId })];
                case 1:
                    session = _a.sent();
                    if (!session)
                        throw (0, errors_1.notFound)("Activity session not found");
                    if (session.status !== "paused" || !session.pausedAt)
                        throw (0, errors_1.badRequest)("Only a paused activity can be resumed");
                    session.pausedSeconds += Math.max(0, Math.floor((Date.now() - session.pausedAt.getTime()) / 1000));
                    session.pausedAt = null;
                    session.heartbeatAt = new Date();
                    session.status = "running";
                    return [4 /*yield*/, session.save()];
                case 2:
                    _a.sent();
                    return [2 /*return*/, session];
            }
        });
    });
}
function finishActivity(userId, organizationId, sessionId) {
    return __awaiter(this, void 0, void 0, function () {
        var session, pausedSeconds, elapsedSeconds, unpausedSeconds;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, TeamActivity_1.TeamActivity.findOne({ _id: sessionId, userId: userId, organizationId: organizationId })];
                case 1:
                    session = _a.sent();
                    if (!session)
                        throw (0, errors_1.notFound)("Activity session not found");
                    if (session.status === "stopped")
                        throw (0, errors_1.badRequest)("Activity session is already stopped");
                    if (session.idleStartedAt) {
                        session.idleSeconds += Math.max(0, Math.floor((Date.now() - session.idleStartedAt.getTime()) / 1000));
                        session.idleStartedAt = null;
                    }
                    pausedSeconds = session.pausedSeconds;
                    if (session.pausedAt)
                        pausedSeconds += Math.max(0, Math.floor((Date.now() - session.pausedAt.getTime()) / 1000));
                    elapsedSeconds = Math.max(0, Math.floor((Date.now() - session.startedAt.getTime()) / 1000));
                    unpausedSeconds = Math.max(0, elapsedSeconds - pausedSeconds);
                    session.activeSeconds = Math.max(0, unpausedSeconds - session.idleSeconds);
                    session.pausedSeconds = pausedSeconds;
                    session.pausedAt = null;
                    if (session.activeSeconds + session.idleSeconds > unpausedSeconds + 300)
                        throw (0, errors_1.badRequest)("Session durations exceed elapsed time");
                    session.status = "stopped";
                    session.endedAt = new Date();
                    session.openSessionUserId = null;
                    return [4 /*yield*/, session.save()];
                case 2:
                    _a.sent();
                    return [2 /*return*/, session];
            }
        });
    });
}
function activityHistory(userId, organizationId, query) {
    return __awaiter(this, void 0, void 0, function () {
        var filter, _a, items, total;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    filter = __assign({ userId: userId, organizationId: organizationId }, (query.from || query.to ? {
                        startedAt: __assign(__assign({}, (query.from ? { $gte: new Date(query.from) } : {})), (query.to ? { $lte: new Date(query.to) } : {})),
                    } : {}));
                    return [4 /*yield*/, Promise.all([
                            TeamActivity_1.TeamActivity.find(filter).sort({ startedAt: -1 }).skip((query.page - 1) * query.limit).limit(query.limit).lean(),
                            TeamActivity_1.TeamActivity.countDocuments(filter),
                        ])];
                case 1:
                    _a = _b.sent(), items = _a[0], total = _a[1];
                    return [2 /*return*/, {
                            items: items.map(function (item) { return ({
                                id: String(item._id),
                                task: item.task,
                                category: item.category,
                                tags: item.tags,
                                startedAt: item.startedAt,
                                endedAt: item.endedAt,
                                activeSeconds: item.activeSeconds,
                                idleSeconds: item.idleSeconds,
                                status: item.status,
                            }); }),
                            pagination: { page: query.page, limit: query.limit, total: total, pages: Math.ceil(total / query.limit) },
                        }];
            }
        });
    });
}
function dashboard(userId, organizationId, range) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, start, end, sessions, now, durations, active, idle, total, productive, days, _i, durations_1, _b, session, activeSeconds, idleSeconds, key, current;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = (0, week_1.dateRange)(range), start = _a.start, end = _a.end;
                    return [4 /*yield*/, TeamActivity_1.TeamActivity.find({ userId: userId, organizationId: organizationId, startedAt: { $gte: start, $lte: end } }).lean()];
                case 1:
                    sessions = _d.sent();
                    now = Date.now();
                    durations = sessions.map(function (item) {
                        if (item.status === "stopped")
                            return { item: item, activeSeconds: item.activeSeconds, idleSeconds: item.idleSeconds };
                        var elapsed = Math.max(0, Math.floor((now - item.startedAt.getTime()) / 1000));
                        var paused = item.pausedSeconds + (item.pausedAt ? Math.max(0, Math.floor((now - item.pausedAt.getTime()) / 1000)) : 0);
                        var unpaused = Math.max(0, elapsed - paused);
                        var idleSeconds = item.idleSeconds + (item.idleStartedAt
                            ? Math.max(0, Math.floor((now - item.idleStartedAt.getTime()) / 1000))
                            : 0);
                        return { item: item, activeSeconds: Math.max(0, unpaused - idleSeconds), idleSeconds: idleSeconds };
                    });
                    active = durations.reduce(function (sum, session) { return sum + session.activeSeconds; }, 0);
                    idle = durations.reduce(function (sum, session) { return sum + session.idleSeconds; }, 0);
                    total = active + idle;
                    productive = durations.filter(function (_a) {
                        var item = _a.item;
                        return item.category === "Productive";
                    })
                        .reduce(function (sum, session) { return sum + session.activeSeconds; }, 0);
                    days = new Map();
                    for (_i = 0, durations_1 = durations; _i < durations_1.length; _i++) {
                        _b = durations_1[_i], session = _b.item, activeSeconds = _b.activeSeconds, idleSeconds = _b.idleSeconds;
                        key = session.startedAt.toISOString().slice(0, 10);
                        current = (_c = days.get(key)) !== null && _c !== void 0 ? _c : { active: 0, idle: 0, productive: 0, neutral: 0 };
                        current.active += activeSeconds;
                        current.idle += idleSeconds;
                        if (session.category === "Productive")
                            current.productive += activeSeconds;
                        else
                            current.neutral += activeSeconds;
                        days.set(key, current);
                    }
                    return [2 /*return*/, {
                            range: range,
                            summary: {
                                totalSeconds: total,
                                activeSeconds: active,
                                idleSeconds: idle,
                                productivityPercent: active ? Math.round((productive / active) * 100) : 0,
                                sessionCount: sessions.length,
                            },
                            daily: __spreadArray([], days.entries(), true).sort(function (_a, _b) {
                                var a = _a[0];
                                var b = _b[0];
                                return a.localeCompare(b);
                            }).map(function (_a) {
                                var date = _a[0], value = _a[1];
                                return (__assign({ date: date }, value));
                            }),
                            sessions: durations.map(function (_a) {
                                var item = _a.item, activeSeconds = _a.activeSeconds, idleSeconds = _a.idleSeconds;
                                return ({
                                    id: item._id.toString(),
                                    task: item.task,
                                    category: item.category,
                                    startedAt: item.startedAt,
                                    endedAt: item.endedAt,
                                    activeSeconds: activeSeconds,
                                    idleSeconds: idleSeconds,
                                    status: item.status,
                                });
                            }),
                        }];
            }
        });
    });
}
