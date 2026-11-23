import type { Request, Response } from "express";

interface AuthContext {
    userId: import("mongoose").Types.ObjectId;
    organizationId: import("mongoose").Types.ObjectId;
    teamId: import("mongoose").Types.ObjectId | null;
    role: import("../types/roles").UserRole;
}

interface ControllerRequest extends Request {
    auth?: AuthContext;
    validatedQuery?: Record<string, string | number | undefined>;
}

import { asyncHandler } from "../utils/async-handler";
import { unauthorized } from "../utils/errors";
import * as admin from "../services/admin.service";

function context(req: ControllerRequest) {
    if (!req.auth)
        throw unauthorized();
    return { organizationId: req.auth.organizationId, actorId: req.auth.userId };
}

export const overview = asyncHandler(async (req: ControllerRequest, res: Response) => {
    const { organizationId } = context(req);
    res.json({ overview: await admin.adminOverview(organizationId) });
});

export const members = asyncHandler(async (req: ControllerRequest, res: Response) => {
    const { organizationId } = context(req);
    res.json(await admin.listMembers(organizationId, req.validatedQuery ?? {}));
});

export const updateMember = asyncHandler(async (req: ControllerRequest, res: Response) => {
    const { organizationId, actorId } = context(req);
    const member = await admin.updateMember(organizationId, actorId, req.params.userId, req.body);
    res.json({ member });
});

export const invite = asyncHandler(async (req: ControllerRequest, res: Response) => {
    const { organizationId, actorId } = context(req);
    const invitation = await admin.inviteMember(organizationId, actorId, req.body);
    res.status(201).json({ invitation });
});

export const resendInvite = asyncHandler(async (req: ControllerRequest, res: Response) => {
    const { organizationId, actorId } = context(req);
    const invitation = await admin.resendInvitation(organizationId, actorId, req.params.email);
    res.status(201).json({ invitation });
});

export const invitations = asyncHandler(async (req: ControllerRequest, res: Response) => {
    const { organizationId } = context(req);
    res.json({ invitations: await admin.listInvitations(organizationId) });
});

export const cancelInvite = asyncHandler(async (req: ControllerRequest, res: Response) => {
    const { organizationId, actorId } = context(req);
    const invitation = await admin.cancelInvitation(organizationId, actorId, req.params.invitationId);
    res.json({ invitation });
});

export const teams = asyncHandler(async (req: ControllerRequest, res: Response) => {
    const { organizationId } = context(req);
    res.json({ teams: await admin.listTeams(organizationId) });
});

export const createTeam = asyncHandler(async (req: ControllerRequest, res: Response) => {
    const { organizationId, actorId } = context(req);
    const team = await admin.createTeam(organizationId, actorId, req.body.name);
    res.status(201).json({ team });
});

export const renameTeam = asyncHandler(async (req: ControllerRequest, res: Response) => {
    const { organizationId, actorId } = context(req);
    const team = await admin.renameTeam(organizationId, actorId, req.params.teamId, req.body.name);
    res.json({ team });
});

export const archiveTeam = asyncHandler(async (req: ControllerRequest, res: Response) => {
    const { organizationId, actorId } = context(req);
    const team = await admin.archiveTeam(organizationId, actorId, req.params.teamId);
    res.json({ team });
});

export const alerts = asyncHandler(async (req: ControllerRequest, res: Response) => {
    const { organizationId } = context(req);
    res.json(await admin.listAlerts(organizationId, req.validatedQuery ?? {}));
});

export const updateAlert = asyncHandler(async (req: ControllerRequest, res: Response) => {
    const { organizationId, actorId } = context(req);
    const alert = await admin.updateAlert(organizationId, actorId, req.params.alertId, req.body.status);
    res.json({ alert });
});

export const reports = asyncHandler(async (req: ControllerRequest, res: Response) => {
    const { organizationId } = context(req);
    res.json(await admin.listReports(organizationId, req.validatedQuery ?? {}));
});

export const settings = asyncHandler(async (req: ControllerRequest, res: Response) => {
    const { organizationId } = context(req);
    res.json(await admin.getSettings(organizationId));
});

export const updateSettings = asyncHandler(async (req: ControllerRequest, res: Response) => {
    const { organizationId, actorId } = context(req);
    res.json(await admin.updateSettings(organizationId, actorId, req.body));
});

export const auditLogs = asyncHandler(async (req: ControllerRequest, res: Response) => {
    const { organizationId } = context(req);
    res.json(await admin.listAuditLogs(organizationId, req.validatedQuery ?? {}));
});
