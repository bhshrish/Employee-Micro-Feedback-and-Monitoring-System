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


import * as async_handler_1 from "../utils/async-handler";
import * as workspace from "../services/workspace.service";
import * as errors_1 from "../utils/errors";
export const teams = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    res.json({ teams: await workspace.listTeams(req.auth.organizationId) });
});
export const createTeam = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const team = await workspace.createTeam(req.auth.organizationId, req.body.name);
    res.status(201).json({ team });
});
export const inviteMember = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const invitation = await workspace.createInvitation(req.auth.organizationId, req.auth.userId, req.body.email, req.body.teamId);
    const result = {
        email: invitation.email,
        teamId: invitation.teamId,
        expiresAt: invitation.expiresAt,
        token: invitation.token,
    };
    res.status(201).json({ invitation: result, data: { invitation: result } });
});
export const members = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const teamId = req.auth.role === "business" ? undefined : req.auth.teamId ?? undefined;
    if (req.auth.role !== "business" && !teamId)
        throw (0, errors_1.forbidden)("A team assignment is required");
    res.json({ members: await workspace.listMembers(req.auth.organizationId, teamId) });
});
export const updateMember = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const member = await workspace.updateMember(req.auth.organizationId, req.auth.userId, req.params.memberId ?? req.params.userId, req.body);
    res.json({ member });
});
export const archiveTeam = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const team = await workspace.archiveTeam(req.auth.organizationId, req.params.teamId);
    res.json({ team });
});
