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


import * as pulse from "../services/pulse.service";
import * as workspace from "../services/workspace.service";
import * as async_handler_1 from "../utils/async-handler";
import * as errors_1 from "../utils/errors";
import * as mongoose_1 from "mongoose";
import * as Team_1 from "../models/Team";
async function teamScope(req: ControllerRequest, requested?: string): Promise<import("mongoose").Types.ObjectId | undefined> {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const canViewAll = req.auth.role === "business";
    const teamId = requested ?? (!canViewAll ? req.auth.teamId?.toString() : undefined);
    if (!canViewAll)
        throw (0, errors_1.forbidden)("Analytics are available to Business accounts only");
    if (!canViewAll && !teamId)
        throw (0, errors_1.forbidden)("A team assignment is required");
    if (teamId) {
        await workspace.ensureTeamAccess(req.auth.organizationId, teamId, req.auth.teamId, canViewAll);
    }
    return teamId ? new mongoose_1.Types.ObjectId(teamId) : undefined;
}
export const trends = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
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
export const heatmap = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
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
export const teams = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const teamId = await teamScope(req);
    const minGroupSize = await pulse.organizationMinGroupSize(req.auth.organizationId);
    const teams = await pulse.analyticsTeams(req.auth.organizationId, minGroupSize, teamId);
    res.json({ minimumGroupSize: minGroupSize, teams, data: { minimumGroupSize: minGroupSize, teams } });
});
export const teamTrend = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
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
