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
exports.auditLogs = exports.updateSettings = exports.settings = exports.reports = exports.updateAlert = exports.alerts = exports.archiveTeam = exports.renameTeam = exports.createTeam = exports.teams = exports.cancelInvite = exports.invitations = exports.resendInvite = exports.invite = exports.updateMember = exports.members = exports.overview = void 0;
const async_handler_1 = require("../utils/async-handler");
const errors_1 = require("../utils/errors");
const admin = __importStar(require("../services/admin.service"));
function context(req) {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    return { organizationId: req.auth.organizationId, actorId: req.auth.userId };
}
exports.overview = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { organizationId } = context(req);
    res.json({ overview: await admin.adminOverview(organizationId) });
});
exports.members = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { organizationId } = context(req);
    res.json(await admin.listMembers(organizationId, req.validatedQuery ?? {}));
});
exports.updateMember = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { organizationId, actorId } = context(req);
    const member = await admin.updateMember(organizationId, actorId, req.params.userId, req.body);
    res.json({ member });
});
exports.invite = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { organizationId, actorId } = context(req);
    const invitation = await admin.inviteMember(organizationId, actorId, req.body);
    res.status(201).json({ invitation });
});
exports.resendInvite = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { organizationId, actorId } = context(req);
    const invitation = await admin.resendInvitation(organizationId, actorId, req.params.email);
    res.status(201).json({ invitation });
});
exports.invitations = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { organizationId } = context(req);
    res.json({ invitations: await admin.listInvitations(organizationId) });
});
exports.cancelInvite = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { organizationId, actorId } = context(req);
    const invitation = await admin.cancelInvitation(organizationId, actorId, req.params.invitationId);
    res.json({ invitation });
});
exports.teams = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { organizationId } = context(req);
    res.json({ teams: await admin.listTeams(organizationId) });
});
exports.createTeam = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { organizationId, actorId } = context(req);
    const team = await admin.createTeam(organizationId, actorId, req.body.name);
    res.status(201).json({ team });
});
exports.renameTeam = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { organizationId, actorId } = context(req);
    const team = await admin.renameTeam(organizationId, actorId, req.params.teamId, req.body.name);
    res.json({ team });
});
exports.archiveTeam = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { organizationId, actorId } = context(req);
    const team = await admin.archiveTeam(organizationId, actorId, req.params.teamId);
    res.json({ team });
});
exports.alerts = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { organizationId } = context(req);
    res.json(await admin.listAlerts(organizationId, req.validatedQuery ?? {}));
});
exports.updateAlert = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { organizationId, actorId } = context(req);
    const alert = await admin.updateAlert(organizationId, actorId, req.params.alertId, req.body.status);
    res.json({ alert });
});
exports.reports = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { organizationId } = context(req);
    res.json(await admin.listReports(organizationId, req.validatedQuery ?? {}));
});
exports.settings = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { organizationId } = context(req);
    res.json(await admin.getSettings(organizationId));
});
exports.updateSettings = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { organizationId, actorId } = context(req);
    res.json(await admin.updateSettings(organizationId, actorId, req.body));
});
exports.auditLogs = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { organizationId } = context(req);
    res.json(await admin.listAuditLogs(organizationId, req.validatedQuery ?? {}));
});
