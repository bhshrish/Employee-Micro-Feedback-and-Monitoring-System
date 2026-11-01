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
exports.stop = exports.resume = exports.pause = exports.summary = exports.history = exports.tags = exports.idle = exports.heartbeat = exports.start = exports.dashboard = void 0;
var async_handler_1 = require("../utils/async-handler");
var activity = require("../services/activity.service");
var errors_1 = require("../utils/errors");
exports.dashboard = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                query = req.validatedQuery;
                _b = (_a = res).json;
                return [4 /*yield*/, activity.dashboard(req.auth.userId, req.auth.organizationId, query.range)];
            case 1:
                _b.apply(_a, [_c.sent()]);
                return [2 /*return*/];
        }
    });
}); });
exports.start = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var session;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                return [4 /*yield*/, activity.startActivity(req.auth, req.body)];
            case 1:
                session = _a.sent();
                res.status(201).json({ session: session });
                return [2 /*return*/];
        }
    });
}); });
exports.heartbeat = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var sessionId, session;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                sessionId = (_a = req.params.sessionId) !== null && _a !== void 0 ? _a : (_b = req.body) === null || _b === void 0 ? void 0 : _b.sessionId;
                return [4 /*yield*/, activity.heartbeatActivity(req.auth.userId, req.auth.organizationId, sessionId)];
            case 1:
                session = _c.sent();
                res.json({ session: session });
                return [2 /*return*/];
        }
    });
}); });
exports.idle = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var session;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                return [4 /*yield*/, activity.setActivityIdle(req.auth.userId, req.auth.organizationId, req.params.sessionId, req.body.idle)];
            case 1:
                session = _a.sent();
                res.json({ session: session });
                return [2 /*return*/];
        }
    });
}); });
exports.tags = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var session;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                return [4 /*yield*/, activity.setActivityTags(req.auth.userId, req.auth.organizationId, req.params.sessionId, req.body)];
            case 1:
                session = _a.sent();
                res.json({ session: session });
                return [2 /*return*/];
        }
    });
}); });
exports.history = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                query = req.validatedQuery;
                return [4 /*yield*/, activity.activityHistory(req.auth.userId, req.auth.organizationId, query)];
            case 1:
                result = _a.sent();
                res.json(__assign(__assign({}, result), { data: result }));
                return [2 /*return*/];
        }
    });
}); });
exports.summary = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, dashboard;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                query = req.validatedQuery;
                return [4 /*yield*/, activity.dashboard(req.auth.userId, req.auth.organizationId, query.range)];
            case 1:
                dashboard = _a.sent();
                res.json({ range: dashboard.range, summary: dashboard.summary });
                return [2 /*return*/];
        }
    });
}); });
exports.pause = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var session;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                return [4 /*yield*/, activity.pauseActivity(req.auth.userId, req.auth.organizationId, req.params.sessionId)];
            case 1:
                session = _a.sent();
                res.json({ session: session });
                return [2 /*return*/];
        }
    });
}); });
exports.resume = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var session;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                return [4 /*yield*/, activity.resumeActivity(req.auth.userId, req.auth.organizationId, req.params.sessionId)];
            case 1:
                session = _a.sent();
                res.json({ session: session });
                return [2 /*return*/];
        }
    });
}); });
exports.stop = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var session;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                return [4 /*yield*/, activity.finishActivity(req.auth.userId, req.auth.organizationId, req.params.sessionId)];
            case 1:
                session = _a.sent();
                res.json({ session: session });
                return [2 /*return*/];
        }
    });
}); });
