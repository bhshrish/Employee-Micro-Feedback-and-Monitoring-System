"use strict";
const { createHash } = require("node:crypto");
const { Types } = require("mongoose");
const { EmployeeTool } = require("../models/EmployeeTool");
const { User } = require("../models/User");
const { asyncHandler } = require("../utils/async-handler");
const { unauthorized, notFound, badRequest, forbidden } = require("../utils/errors");

function authOf(req) {
    if (!req.auth)
        throw unauthorized();
    return req.auth;
}

exports.listPlanner = asyncHandler(async (req, res) => {
    const auth = authOf(req);
    const tasks = await EmployeeTool.find({ organizationId: auth.organizationId, userId: auth.userId, kind: "planner_task" })
        .sort({ startsAt: 1, createdAt: -1 }).lean();
    res.json({ tasks });
});

exports.createPlanner = asyncHandler(async (req, res) => {
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

exports.updatePlanner = asyncHandler(async (req, res) => {
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

exports.deletePlanner = asyncHandler(async (req, res) => {
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

exports.listLeave = asyncHandler(async (req, res) => {
    const auth = authOf(req);
    const scope = auth.role === "admin" || auth.role === "manager" ? {} : { userId: auth.userId };
    const requests = await EmployeeTool.find({ organizationId: auth.organizationId, kind: "leave_request", ...scope })
        .populate("userId", "name email")
        .sort({ createdAt: -1 }).lean();
    res.json({ requests });
});

exports.createLeave = asyncHandler(async (req, res) => {
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

exports.decideLeave = asyncHandler(async (req, res) => {
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

exports.listCalendar = asyncHandler(async (req, res) => {
    const auth = authOf(req);
    const events = await EmployeeTool.find({
        organizationId: auth.organizationId,
        userId: auth.userId,
        kind: { $in: ["meeting", "reminder"] },
        startsAt: { $gte: new Date(Date.now() - 90 * 86_400_000) },
    }).sort({ startsAt: 1 }).lean();
    res.json({ events });
});

exports.createCalendarEvent = asyncHandler(async (req, res) => {
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

exports.listSignatures = asyncHandler(async (req, res) => {
    const auth = authOf(req);
    const scope = auth.role === "admin" || auth.role === "manager"
        ? { createdBy: auth.userId }
        : { userId: auth.userId };
    const documents = await EmployeeTool.find({
        organizationId: auth.organizationId,
        kind: "signature",
        ...scope,
    }).populate("userId", "name email").sort({ createdAt: -1 }).lean();
    res.json({ documents });
});

exports.createSignature = asyncHandler(async (req, res) => {
    const auth = authOf(req);
    if (!Types.ObjectId.isValid(req.body.employeeId))
        throw badRequest("Employee id is invalid");
    const employee = await User.findOne({
        _id: req.body.employeeId,
        organizationId: auth.organizationId,
        role: "employee",
        isActive: true,
    }).select("_id");
    if (!employee)
        throw notFound("Active employee not found in this business");
    const document = await EmployeeTool.create({
        organizationId: auth.organizationId,
        userId: employee._id,
        createdBy: auth.userId,
        kind: "signature",
        title: req.body.title,
        description: req.body.documentText,
        status: "pending",
    });
    res.status(201).json({ document });
});

exports.signDocument = asyncHandler(async (req, res) => {
    const auth = authOf(req);
    const document = await EmployeeTool.findOne({
        _id: req.params.toolId,
        organizationId: auth.organizationId,
        userId: auth.userId,
        kind: "signature",
        status: "pending",
    });
    if (!document)
        throw notFound("Pending signature request not found");
    const signatureHash = createHash("sha256")
        .update(`${document.title}\n${document.description}\n${req.body.signedName}\n${req.body.confirmation}`)
        .digest("hex");
    const signed = await EmployeeTool.findOneAndUpdate({
        _id: document._id,
        organizationId: auth.organizationId,
        userId: auth.userId,
        kind: "signature",
        status: "pending",
    }, {
        $set: {
            signedName: req.body.signedName,
            signatureHash,
            signedAt: new Date(),
            status: "signed",
        },
    }, { new: true, runValidators: true });
    if (!signed)
        throw notFound("Pending signature request not found");
    res.json({ document: signed });
});

exports.salaryCheck = asyncHandler(async (req, res) => {
    const auth = authOf(req);
    if (auth.role !== "employee")
        throw forbidden("Salary estimates are available only in an employee account");
    const grossMonthly = req.body.grossMonthly;
    const deductionsMonthly = req.body.deductionsMonthly || 0;
    const estimatedTaxRate = req.body.estimatedTaxRate || 0;
    const taxMonthly = Math.round(grossMonthly * estimatedTaxRate / 100);
    res.setHeader("Cache-Control", "no-store");
    res.json({
        estimate: {
            grossMonthly,
            deductionsMonthly,
            estimatedTaxRate,
            estimatedTaxMonthly: taxMonthly,
            estimatedTakeHomeMonthly: Math.max(0, grossMonthly - deductionsMonthly - taxMonthly),
            estimatedTakeHomeAnnual: Math.max(0, grossMonthly - deductionsMonthly - taxMonthly) * 12,
            note: "Estimate only; based on the inputs you provided. CalmWork does not save salary inputs.",
        },
    });
});
