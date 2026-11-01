"use strict";
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
exports.teamTrend = exports.teams = exports.heatmap = exports.trends = void 0;
var pulse = require("../services/pulse.service");
var workspace = require("../services/workspace.service");
var async_handler_1 = require("../utils/async-handler");
var errors_1 = require("../utils/errors");
var mongoose_1 = require("mongoose");
var Team_1 = require("../models/Team");
function teamScope(req, requested) {
    return __awaiter(this, void 0, void 0, function () {
        var canViewAll, teamId;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!req.auth)
                        throw (0, errors_1.unauthorized)();
                    canViewAll = req.auth.role === "admin";
                    teamId = requested !== null && requested !== void 0 ? requested : (!canViewAll ? (_a = req.auth.teamId) === null || _a === void 0 ? void 0 : _a.toString() : undefined);
                    if (!canViewAll && req.auth.role !== "manager")
                        throw (0, errors_1.forbidden)("Analytics are available to workspace managers only");
                    if (!canViewAll && !teamId)
                        throw (0, errors_1.forbidden)("A manager must be assigned to a team");
                    if (!teamId) return [3 /*break*/, 2];
                    return [4 /*yield*/, workspace.ensureTeamAccess(req.auth.organizationId, teamId, req.auth.teamId, canViewAll)];
                case 1:
                    _b.sent();
                    _b.label = 2;
                case 2: return [2 /*return*/, teamId ? new mongoose_1.Types.ObjectId(teamId) : undefined];
            }
        });
    });
}
exports.trends = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, teamId, minGroupSize, _a, _b;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                query = req.validatedQuery;
                return [4 /*yield*/, teamScope(req, query.teamId)];
            case 1:
                teamId = _d.sent();
                return [4 /*yield*/, pulse.organizationMinGroupSize(req.auth.organizationId)];
            case 2:
                minGroupSize = _d.sent();
                _b = (_a = res).json;
                _c = {
                    minimumGroupSize: minGroupSize
                };
                return [4 /*yield*/, pulse.analyticsTrends(req.auth.organizationId, teamId, query.weeks, minGroupSize)];
            case 3:
                _b.apply(_a, [(_c.trends = _d.sent(),
                        _c)]);
                return [2 /*return*/];
        }
    });
}); });
exports.heatmap = (0, async_handler_1.asyncHandler)(async function (req, res) {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    var query = req.validatedQuery;
    var teamId = await teamScope(req, query.teamId);
    var minGroupSize = await pulse.organizationMinGroupSize(req.auth.organizationId);
    var teams = await Team_1.Team.find({
        organizationId: req.auth.organizationId,
        archivedAt: null,
        ...(teamId ? { _id: teamId } : {}),
    }).select("_id name").lean();
    var teamIds = new Set(teams.map(function (team) { return team._id.toString(); }));
    var cells = await pulse.analyticsHeatmap(req.auth.organizationId, teamId, query.weeks, minGroupSize);
    res.json({
        minimumGroupSize: minGroupSize,
        teams: teams.map(function (team) { return ({ teamId: team._id.toString(), name: team.name }); }),
        cells: cells.filter(function (cell) { return teamIds.has(cell.teamId); }),
    });
});
exports.teams = (0, async_handler_1.asyncHandler)(async function (req, res) {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    var teamId = await teamScope(req);
    var minGroupSize = await pulse.organizationMinGroupSize(req.auth.organizationId);
    var teams = await pulse.analyticsTeams(req.auth.organizationId, minGroupSize, teamId);
    res.json({ minimumGroupSize: minGroupSize, teams: teams, data: { minimumGroupSize: minGroupSize, teams: teams } });
});
exports.teamTrend = (0, async_handler_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, teamId, scopedId, _a, query, minGroupSize, trend;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!req.auth)
                    throw (0, errors_1.unauthorized)();
                id = req.params.teamId;
                if (!mongoose_1.Types.ObjectId.isValid(id))
                    throw (0, errors_1.notFound)("Team not found");
                teamId = new mongoose_1.Types.ObjectId(id);
                return [4 /*yield*/, teamScope(req, id)];
            case 1:
                scopedId = _b.sent();
                _a = !scopedId;
                if (_a) return [3 /*break*/, 3];
                return [4 /*yield*/, Team_1.Team.exists({ _id: teamId, organizationId: req.auth.organizationId, archivedAt: null })];
            case 2:
                _a = !(_b.sent());
                _b.label = 3;
            case 3:
                if (_a) {
                    throw (0, errors_1.notFound)("Team not found");
                }
                query = req.validatedQuery;
                return [4 /*yield*/, pulse.organizationMinGroupSize(req.auth.organizationId)];
            case 4:
                minGroupSize = _b.sent();
                return [4 /*yield*/, pulse.analyticsTeamTrend(req.auth.organizationId, teamId, query.weeks, minGroupSize)];
            case 5:
                trend = _b.sent();
                res.json({ minimumGroupSize: minGroupSize, trend: trend, data: { minimumGroupSize: minGroupSize, trend: trend } });
                return [2 /*return*/];
        }
    });
}); });
