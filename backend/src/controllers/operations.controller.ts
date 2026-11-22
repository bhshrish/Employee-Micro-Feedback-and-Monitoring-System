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
import * as jsonwebtoken_1 from "jsonwebtoken";
import * as env_1 from "../config/env";
import * as operations from "../services/operations.service";
import * as otp from "../services/otp.service";
import * as operationsAuth from "../services/operations-auth.service";
import * as Organization_1 from "../models/Organization";
const cookieName = "calmwork_operations";
interface OperationsAdminProfile {
    name: string;
    email: string;
    passwordChangedAt: Date;
}
function cookieOptions() {
    const config = (0, env_1.getConfig)();
    const isSecure = Boolean(config.COOKIE_SECURE);
    return {
        httpOnly: true,
        secure: isSecure,
        sameSite: isSecure ? "none" : "lax",
        path: "/api/v1/operations",
        maxAge: 8 * 60 * 60 * 1000,
    };
}
function setOperationsAdminSession(res: Response, admin: OperationsAdminProfile): void {
    const config = (0, env_1.getConfig)();
    const token = (0, jsonwebtoken_1.sign)({
        typ: "operations_admin",
        passwordChangedAt: admin.passwordChangedAt.getTime(),
    }, config.JWT_ADMIN_SECRET, {
        subject: admin.email,
        issuer: "calmwork-operations",
        audience: "calmwork-admin",
        expiresIn: "8h",
    });
    res.cookie(cookieName, token, cookieOptions());
    res.setHeader("Cache-Control", "no-store");
    res.json({ admin: { name: admin.name, username: "admin", email: admin.email }, token });
}
exports.signInAdminWithPassword = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    const admin = await operationsAuth.signInOperationsAdmin(req.body);
    setOperationsAdminSession(res, admin);
});
exports.requestAdminOtp = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    res.setHeader("Cache-Control", "no-store");
    res.json(await otp.requestAdminOtp(req.body.email));
});
exports.verifyAdminOtp = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    await otp.verifyOtp({ email: req.body.email, code: req.body.code, purpose: "admin" });
    const admin = await operationsAuth.getOperationsAdmin();
    setOperationsAdminSession(res, admin);
});
exports.adminSignOut = (_req: ControllerRequest, res: Response) => {
    res.clearCookie(cookieName, { ...cookieOptions(), maxAge: undefined });
    res.status(204).end();
};
exports.adminMe = (0, async_handler_1.asyncHandler)(async (_req: ControllerRequest, res: Response) => {
    res.json({ admin: await operationsAuth.getOperationsAdminProfile() });
});
exports.businesses = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    const query = req.validatedQuery;
    const filter = query.q
        ? { name: new RegExp(query.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") }
        : {};
    const [businesses, total] = await Promise.all([
        operations.listBusinesses(query),
        Organization_1.Organization.countDocuments(filter),
    ]);
    res.json({ businesses, page: query.page, total, totalPages: Math.ceil(total / 50) });
});
exports.updateBusiness = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    res.json({ business: await operations.setBusinessActive(req.params.businessId, req.body.isActive) });
});
exports.updateUser = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    res.json({ user: await operations.setUserActive(req.params.userId, req.body.isActive) });
});
exports.createTeam = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    res.status(201).json({ team: await operations.createTeam(req.body.organizationId, req.body.name) });
});
exports.archiveTeam = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    res.json({ team: await operations.archiveTeam(req.params.teamId) });
});
exports.assignTeam = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    res.json({ user: await operations.assignUserTeam(req.params.userId, req.body.teamId) });
});
exports.activity = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    res.json({ date: req.validatedQuery.date, businesses: await operations.activitySummary(req.validatedQuery.date) });
});
exports.attendance = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    res.json(await operations.attendanceDashboard(req.validatedQuery.date, req.validatedQuery.page));
});
exports.attendanceExport = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    const csv = await operations.attendanceCsv(req.validatedQuery.date);
    res.type("text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="calmwork-attendance-${req.validatedQuery.date}.csv"`);
    res.send(csv);
});
exports.leaveApplications = (0, async_handler_1.asyncHandler)(async (_req: ControllerRequest, res: Response) => {
    res.json({ requests: await operations.leaveApplications() });
});
exports.decideLeaveApplication = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    res.json({ request: await operations.decideLeaveApplication(req.params.toolId, req.body.status) });
});
