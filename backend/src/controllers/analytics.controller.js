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
exports.teamTrend = exports.teams = exports.heatmap = exports.trends = void 0;
const pulse = __importStar(require("../services/pulse.service"));
const workspace = __importStar(require("../services/workspace.service"));
const async_handler_1 = require("../utils/async-handler");
const errors_1 = require("../utils/errors");
const mongoose_1 = require("mongoose");
const Team_1 = require("../models/Team");
async function teamScope(req, requested) {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const canViewAll = req.auth.role === "admin";
    const teamId = requested ?? (!canViewAll ? req.auth.teamId?.toString() : undefined);
    if (!canViewAll && req.auth.role !== "manager")
        throw (0, errors_1.forbidden)("Analytics are available to workspace managers only");
    if (!canViewAll && !teamId)
        throw (0, errors_1.forbidden)("A manager must be assigned to a team");
    if (teamId) {
        await workspace.ensureTeamAccess(req.auth.organizationId, teamId, req.auth.teamId, canViewAll);
    }
    return teamId ? new mongoose_1.Types.ObjectId(teamId) : undefined;
}
exports.trends = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const query = req.validatedQuery;
    const teamId = await teamScope(req, query.teamId);
    const minGroupSize = await pulse.organizationMinGroupSize(req.auth.organizationId);
    res.json({
        minimumGroupSize: minGroupSize,
        trends: await pulse.analyticsTrends(req.auth.organizationId, teamId, query.weeks, minGroupSize),
    });
});
exports.heatmap = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const query = req.validatedQuery;
    const teamId = await teamScope(req, query.teamId);
    const minGroupSize = await pulse.organizationMinGroupSize(req.auth.organizationId);
    const teams = await Team_1.Team.find({
        organizationId: req.auth.organizationId,
        archivedAt: null,
        ...(teamId ? { _id: teamId } : {}),
    }).select("_id name").lean();
    const teamIds = new Set(teams.map((team) => team._id.toString()));
    res.json({
        minimumGroupSize: minGroupSize,
        teams: teams.map((team) => ({ teamId: team._id.toString(), name: team.name })),
        cells: (await pulse.analyticsHeatmap(req.auth.organizationId, teamId, query.weeks, minGroupSize))
            .filter((cell) => teamIds.has(cell.teamId)),
    });
});
exports.teams = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const teamId = await teamScope(req);
    const minGroupSize = await pulse.organizationMinGroupSize(req.auth.organizationId);
    const teams = await pulse.analyticsTeams(req.auth.organizationId, minGroupSize, teamId);
    res.json({ minimumGroupSize: minGroupSize, teams, data: { minimumGroupSize: minGroupSize, teams } });
});
exports.teamTrend = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const id = req.params.teamId;
    if (!mongoose_1.Types.ObjectId.isValid(id))
        throw (0, errors_1.notFound)("Team not found");
    const teamId = new mongoose_1.Types.ObjectId(id);
    const scopedId = await teamScope(req, id);
    if (!scopedId || !await Team_1.Team.exists({ _id: teamId, organizationId: req.auth.organizationId, archivedAt: null })) {
        throw (0, errors_1.notFound)("Team not found");
    }
    const query = req.validatedQuery;
    const minGroupSize = await pulse.organizationMinGroupSize(req.auth.organizationId);
    const trend = await pulse.analyticsTeamTrend(req.auth.organizationId, teamId, query.weeks, minGroupSize);
    res.json({ minimumGroupSize: minGroupSize, trend, data: { minimumGroupSize: minGroupSize, trend } });
});
