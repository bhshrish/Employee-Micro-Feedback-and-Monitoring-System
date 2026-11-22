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

import { EmployeeTool } from "../models/EmployeeTool";
import { asyncHandler } from "../utils/async-handler";
import { unauthorized, notFound } from "../utils/errors";

function authOf(req: ControllerRequest) {
    if (!req.auth)
        throw unauthorized();
    return req.auth;
}

export const listPlanner = asyncHandler(async (req: ControllerRequest, res: Response) => {
    const auth = authOf(req);
    const tasks = await EmployeeTool.find({ organizationId: auth.organizationId, userId: auth.userId, kind: "planner_task" })
        .sort({ startsAt: 1, createdAt: -1 }).lean();
    res.json({ tasks });
});

export const createPlanner = asyncHandler(async (req: ControllerRequest, res: Response) => {
    const auth = authOf(req);
    const task = await EmployeeTool.create({
        organizationId: auth.organizationId,
        userId: auth.userId,
        createdBy: auth.userId,
        kind: "planner_task",
        title: req.body.title,
        description: req.body.description || "",
        estimatedMinutes: req.body.estimatedMinutes || 0,
        startsAt: req.body.dueAt ? new Date(req.body.dueAt) : undefined,
        status: "open",
    });
    res.status(201).json({ task });
});

export const updatePlanner = asyncHandler(async (req: ControllerRequest, res: Response) => {
    const auth = authOf(req);
    const update = { ...req.body };
    if (Object.hasOwn(update, "dueAt")) {
        update.startsAt = update.dueAt ? new Date(update.dueAt) : null;
        delete update.dueAt;
    }
    const updated = await EmployeeTool.findOneAndUpdate({
        _id: req.params.toolId,
        organizationId: auth.organizationId,
        userId: auth.userId,
        kind: "planner_task",
    }, { $set: update }, { new: true, runValidators: true });
    if (!updated)
        throw notFound("Planner task not found");
    res.json({ task: updated });
});

export const deletePlanner = asyncHandler(async (req: ControllerRequest, res: Response) => {
    const auth = authOf(req);
    const deleted = await EmployeeTool.findOneAndDelete({
        _id: req.params.toolId,
        organizationId: auth.organizationId,
        userId: auth.userId,
        kind: "planner_task",
    });
    if (!deleted)
        throw notFound("Planner task not found");
    res.status(204).end();
});

export const listLeave = asyncHandler(async (req: ControllerRequest, res: Response) => {
    const auth = authOf(req);
    const scope = auth.role === "admin" || auth.role === "manager" ? {} : { userId: auth.userId };
    const requests = await EmployeeTool.find({ organizationId: auth.organizationId, kind: "leave_request", ...scope })
        .populate("userId", "name email")
        .sort({ createdAt: -1 }).lean();
    res.json({ requests });
});

export const createLeave = asyncHandler(async (req: ControllerRequest, res: Response) => {
    const auth = authOf(req);
    const request = await EmployeeTool.create({
        organizationId: auth.organizationId,
        userId: auth.userId,
        createdBy: auth.userId,
        kind: "leave_request",
        title: `${req.body.leaveType} leave`,
        description: req.body.reason || "",
        leaveType: req.body.leaveType,
        startsAt: new Date(req.body.startsAt),
        endsAt: new Date(req.body.endsAt),
        status: "pending",
    });
    res.status(201).json({ request });
});

export const decideLeave = asyncHandler(async (req: ControllerRequest, res: Response) => {
    const auth = authOf(req);
    const request = await EmployeeTool.findOneAndUpdate({
        _id: req.params.toolId,
        organizationId: auth.organizationId,
        kind: "leave_request",
        status: "pending",
    }, { $set: { status: req.body.status } }, { new: true, runValidators: true });
    if (!request)
        throw notFound("Pending leave request not found");
    res.json({ request });
});

export const listCalendar = asyncHandler(async (req: ControllerRequest, res: Response) => {
    const auth = authOf(req);
    const events = await EmployeeTool.find({
        organizationId: auth.organizationId,
        userId: auth.userId,
        kind: { $in: ["meeting", "reminder"] },
        startsAt: { $gte: new Date(Date.now() - 90 * 86_400_000) },
    }).sort({ startsAt: 1 }).lean();
    res.json({ events });
});

export const createCalendarEvent = asyncHandler(async (req: ControllerRequest, res: Response) => {
    const auth = authOf(req);
    const startsAt = new Date(req.body.startsAt);
    const endsAt = new Date(req.body.endsAt);
    const reminderAt = req.body.reminderMinutes === undefined
        ? undefined
        : new Date(startsAt.getTime() - req.body.reminderMinutes * 60_000);
    const event = await EmployeeTool.create({
        organizationId: auth.organizationId,
        userId: auth.userId,
        createdBy: auth.userId,
        kind: req.body.kind,
        title: req.body.title,
        description: req.body.description || "",
        startsAt,
        endsAt,
        reminderAt,
        estimatedMinutes: Math.ceil((endsAt.getTime() - startsAt.getTime()) / 60_000),
        status: "open",
    });
    res.status(201).json({ event });
});
