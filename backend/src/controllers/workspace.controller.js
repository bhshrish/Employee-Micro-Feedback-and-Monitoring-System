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
exports.archiveTeam = exports.updateMember = exports.members = exports.inviteMember = exports.createTeam = exports.teams = void 0;
const async_handler_1 = require("../utils/async-handler");
const workspace = __importStar(require("../services/workspace.service"));
const errors_1 = require("../utils/errors");
exports.teams = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    res.json({ teams: await workspace.listTeams(req.auth.organizationId) });
});
exports.createTeam = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const team = await workspace.createTeam(req.auth.organizationId, req.body.name);
    res.status(201).json({ team });
});
exports.inviteMember = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    if (req.auth.role === "manager" && req.auth.teamId?.toString() !== req.body.teamId) {
        throw (0, errors_1.forbidden)("Managers can invite members only to their assigned team");
    }
    const invitation = await workspace.createInvitation(req.auth.organizationId, req.auth.userId, req.body.email, req.body.teamId);
    const result = {
        email: invitation.email,
        teamId: invitation.teamId,
        expiresAt: invitation.expiresAt,
        token: invitation.token,
    };
    res.status(201).json({ invitation: result, data: { invitation: result } });
});
exports.members = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const teamId = req.auth.role === "admin" ? undefined : req.auth.teamId ?? undefined;
    if (req.auth.role !== "admin" && !teamId)
        throw (0, errors_1.forbidden)("A manager must be assigned to a team");
    res.json({ members: await workspace.listMembers(req.auth.organizationId, teamId) });
});
exports.updateMember = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const member = await workspace.updateMember(req.auth.organizationId, req.auth.userId, req.params.memberId ?? req.params.userId, req.body);
    res.json({ member });
});
exports.archiveTeam = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const team = await workspace.archiveTeam(req.auth.organizationId, req.params.teamId);
    res.json({ team });
});
