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
exports.updateAlert = exports.alerts = exports.teamScores = exports.submissionStatus = exports.submit = void 0;
const async_handler_1 = require("../utils/async-handler");
const pulse = __importStar(require("../services/pulse.service"));
const workspace = __importStar(require("../services/workspace.service"));
const errors_1 = require("../utils/errors");
exports.submit = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const { mood, stress, workload } = req.body;
    const result = await pulse.submitPulse(req.auth, { mood, stress, workload });
    res.status(201).json({ ...result, data: result });
});
exports.submissionStatus = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const result = { submittedThisWeek: await pulse.hasSubmitted(req.auth.userId) };
    res.json({ ...result, data: result });
});
exports.teamScores = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const query = req.validatedQuery;
    const canViewAll = req.auth.role === "admin";
    const teamId = query.teamId ?? (!canViewAll ? req.auth.teamId?.toString() : undefined);
    if (!canViewAll && !teamId)
        throw (0, errors_1.unauthorized)("A manager must be assigned to a team");
    if (teamId)
        await workspace.ensureTeamAccess(req.auth.organizationId, teamId, req.auth.teamId, canViewAll);
    const minGroupSize = await pulse.organizationMinGroupSize(req.auth.organizationId);
    const teams = await pulse.teamPulse(req.auth.organizationId, teamId, minGroupSize);
    res.json({ teams, minimumGroupSize: minGroupSize, data: { teams, minimumGroupSize: minGroupSize } });
});
exports.alerts = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const query = req.validatedQuery;
    const teamId = req.auth.role === "admin" ? undefined : req.auth.teamId ?? undefined;
    if (req.auth.role !== "admin" && !teamId)
        throw (0, errors_1.unauthorized)("A manager must be assigned to a team");
    const alerts = await pulse.listAlerts(req.auth.organizationId, query.status, teamId);
    res.json({ alerts });
});
exports.updateAlert = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const teamId = req.auth.role === "admin" ? undefined : req.auth.teamId ?? undefined;
    if (req.auth.role !== "admin" && !teamId)
        throw (0, errors_1.unauthorized)("A manager must be assigned to a team");
    const result = await pulse.updateAlert(req.auth.organizationId, req.params.alertId, req.body.status, req.auth.userId, teamId);
    res.json({ alert: result });
});
