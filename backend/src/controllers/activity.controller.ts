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
import * as activity from "../services/activity.service";
import * as errors_1 from "../utils/errors";
exports.dashboard = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const query = req.validatedQuery;
    res.json(await activity.dashboard(req.auth.userId, req.auth.organizationId, query.range));
});
exports.start = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const session = await activity.startActivity(req.auth, req.body);
    res.status(201).json({ session });
});
exports.heartbeat = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const sessionId = req.params.sessionId ?? req.body?.sessionId;
    const session = await activity.heartbeatActivity(req.auth.userId, req.auth.organizationId, sessionId);
    res.json({ session });
});
exports.idle = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const session = await activity.setActivityIdle(req.auth.userId, req.auth.organizationId, req.params.sessionId, req.body.idle);
    res.json({ session });
});
exports.tags = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const session = await activity.setActivityTags(req.auth.userId, req.auth.organizationId, req.params.sessionId, req.body);
    res.json({ session });
});
exports.history = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const query = req.validatedQuery;
    const result = await activity.activityHistory(req.auth.userId, req.auth.organizationId, query);
    res.json({ ...result, data: result });
});
exports.summary = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const query = req.validatedQuery;
    const dashboard = await activity.dashboard(req.auth.userId, req.auth.organizationId, query.range);
    res.json({ range: dashboard.range, summary: dashboard.summary });
});
exports.pause = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const session = await activity.pauseActivity(req.auth.userId, req.auth.organizationId, req.params.sessionId);
    res.json({ session });
});
exports.resume = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const session = await activity.resumeActivity(req.auth.userId, req.auth.organizationId, req.params.sessionId);
    res.json({ session });
});
exports.stop = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const session = await activity.finishActivity(req.auth.userId, req.auth.organizationId, req.params.sessionId);
    res.json({ session });
});
