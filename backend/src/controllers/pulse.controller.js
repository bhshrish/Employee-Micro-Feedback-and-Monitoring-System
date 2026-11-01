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
exports.updateAlert = exports.alerts = exports.teamScores = exports.submissionStatus = exports.submit = void 0;
var async_handler_1 = require("../utils/async-handler");
var pulse = require("../services/pulse.service");
var workspace = require("../services/workspace.service");
var errors_1 = require("../utils/errors");
exports.submit = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, mood, stress, workload, result;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                _a = req.body, mood = _a.mood, stress = _a.stress, workload = _a.workload;
                return [4 /*yield*/, pulse.submitPulse(req.auth, { mood: mood, stress: stress, workload: workload })];
            case 1:
                result = _b.sent();
                res.status(201).json(__assign(__assign({}, result), { data: result }));
                return [2 /*return*/];
        }
    });
}); });
exports.submissionStatus = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                _a = {};
                return [4 /*yield*/, pulse.hasSubmitted(req.auth.userId)];
            case 1:
                result = (_a.submittedThisWeek = _b.sent(), _a);
                res.json(__assign(__assign({}, result), { data: result }));
                return [2 /*return*/];
        }
    });
}); });
exports.teamScores = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, canViewAll, teamId, minGroupSize, teams;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                query = req.validatedQuery;
                canViewAll = req.auth.role === "admin";
                teamId = (_a = query.teamId) !== null && _a !== void 0 ? _a : (!canViewAll ? (_b = req.auth.teamId) === null || _b === void 0 ? void 0 : _b.toString() : undefined);
                if (!canViewAll && !teamId)
                    throw (0, errors_1.unauthorized)("A manager must be assigned to a team");
                if (!teamId) return [3 /*break*/, 2];
                return [4 /*yield*/, workspace.ensureTeamAccess(req.auth.organizationId, teamId, req.auth.teamId, canViewAll)];
            case 1:
                _c.sent();
                _c.label = 2;
            case 2: return [4 /*yield*/, pulse.organizationMinGroupSize(req.auth.organizationId)];
            case 3:
                minGroupSize = _c.sent();
                return [4 /*yield*/, pulse.teamPulse(req.auth.organizationId, teamId, minGroupSize)];
            case 4:
                teams = _c.sent();
                res.json({ teams: teams, minimumGroupSize: minGroupSize, data: { teams: teams, minimumGroupSize: minGroupSize } });
                return [2 /*return*/];
        }
    });
}); });
exports.alerts = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, teamId, alerts;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                query = req.validatedQuery;
                teamId = req.auth.role === "admin" ? undefined : (_a = req.auth.teamId) !== null && _a !== void 0 ? _a : undefined;
                if (req.auth.role !== "admin" && !teamId)
                    throw (0, errors_1.unauthorized)("A manager must be assigned to a team");
                return [4 /*yield*/, pulse.listAlerts(req.auth.organizationId, query.status, teamId)];
            case 1:
                alerts = _b.sent();
                res.json({ alerts: alerts });
                return [2 /*return*/];
        }
    });
}); });
exports.updateAlert = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var teamId, result;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                teamId = req.auth.role === "admin" ? undefined : (_a = req.auth.teamId) !== null && _a !== void 0 ? _a : undefined;
                if (req.auth.role !== "admin" && !teamId)
                    throw (0, errors_1.unauthorized)("A manager must be assigned to a team");
                return [4 /*yield*/, pulse.updateAlert(req.auth.organizationId, req.params.alertId, req.body.status, req.auth.userId, teamId)];
            case 1:
                result = _b.sent();
                res.json({ alert: result });
                return [2 /*return*/];
        }
    });
}); });
