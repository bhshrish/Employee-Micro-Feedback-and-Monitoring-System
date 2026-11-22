import type { Request, Response } from "express";

interface AuthContext {
    userId: import("mongoose").Types.ObjectId;
    organizationId: import("mongoose").Types.ObjectId;
    teamId: import("mongoose").Types.ObjectId | null;
    role: "employee" | "manager" | "admin";
}

interface ControllerRequest extends Request {
    auth?: AuthContext;
    validatedQuery?: Record<string, string | number | undefined>;
}


import * as async_handler_1 from "../utils/async-handler";
import * as pulse from "../services/pulse.service";
import * as workspace from "../services/workspace.service";
import * as errors_1 from "../utils/errors";
export const submit = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const result = await pulse.submitPulse(req.auth, req.body);
    res.status(201).json({ ...result, data: result });
});
export const submissionStatus = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const receipt = await pulse.hasSubmitted(req.auth.userId);
    const result = {
        submittedThisWeek: Boolean(receipt),
        burnoutMetrics: receipt?.burnoutMetrics ?? null,
    };
    res.json({ ...result, data: result });
});
export const teamScores = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
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
export const alerts = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const query = req.validatedQuery;
    const teamId = req.auth.role === "admin" ? undefined : req.auth.teamId ?? undefined;
    if (req.auth.role !== "admin" && !teamId)
        throw (0, errors_1.unauthorized)("A manager must be assigned to a team");
    const alerts = await pulse.listAlerts(req.auth.organizationId, query.status, teamId);
    res.json({ alerts });
});
export const updateAlert = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const teamId = req.auth.role === "admin" ? undefined : req.auth.teamId ?? undefined;
    if (req.auth.role !== "admin" && !teamId)
        throw (0, errors_1.unauthorized)("A manager must be assigned to a team");
    const result = await pulse.updateAlert(req.auth.organizationId, req.params.alertId, req.body.status, req.auth.userId, teamId);
    res.json({ alert: result });
});
