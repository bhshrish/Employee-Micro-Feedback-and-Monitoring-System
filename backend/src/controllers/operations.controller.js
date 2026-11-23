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
exports.decideLeaveApplication = exports.leaveApplications = exports.attendanceExport = exports.attendance = exports.activity = exports.assignTeam = exports.archiveTeam = exports.createTeam = exports.teams = exports.users = exports.updateUser = exports.updateBusiness = exports.businesses = exports.overview = exports.adminMe = exports.adminSignOut = exports.verifyAdminOtp = exports.requestAdminOtp = exports.signInAdminWithPassword = void 0;
const async_handler_1 = __importStar(require("../utils/async-handler"));
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const env_1 = __importStar(require("../config/env"));
const operations = __importStar(require("../services/operations.service"));
const otp = __importStar(require("../services/otp.service"));
const operationsAuth = __importStar(require("../services/operations-auth.service"));
const Organization_1 = __importStar(require("../models/Organization"));
const cookieName = "calmwork_operations";
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
function setOperationsAdminSession(res, admin) {
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
exports.signInAdminWithPassword = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const admin = await operationsAuth.signInOperationsAdmin(req.body);
    setOperationsAdminSession(res, admin);
});
exports.requestAdminOtp = (0, async_handler_1.asyncHandler)(async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.json(await otp.requestAdminOtp(req.body.email));
});
exports.verifyAdminOtp = (0, async_handler_1.asyncHandler)(async (req, res) => {
    await otp.verifyOtp({ email: req.body.email, code: req.body.code, purpose: "admin" });
    const admin = await operationsAuth.getOperationsAdmin();
    setOperationsAdminSession(res, admin);
});
const adminSignOut = (_req, res) => {
    res.clearCookie(cookieName, { ...cookieOptions(), maxAge: undefined });
    res.status(204).end();
};
exports.adminSignOut = adminSignOut;
exports.adminMe = (0, async_handler_1.asyncHandler)(async (_req, res) => {
    res.json({ admin: await operationsAuth.getOperationsAdminProfile() });
});
exports.overview = (0, async_handler_1.asyncHandler)(async (_req, res) => {
    res.json(await operations.operationsOverview());
});
exports.businesses = (0, async_handler_1.asyncHandler)(async (req, res) => {
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
exports.updateBusiness = (0, async_handler_1.asyncHandler)(async (req, res) => {
    res.json({ business: await operations.setBusinessActive(req.params.businessId, req.body.isActive) });
});
exports.updateUser = (0, async_handler_1.asyncHandler)(async (req, res) => {
    res.json({ user: await operations.setUserActive(req.params.userId, req.body.isActive) });
});
exports.users = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const rawRole = req.validatedQuery?.role;
    const role = rawRole === "individual" || rawRole === "business" || rawRole === "admin"
        ? rawRole
        : undefined;
    const rawPage = req.validatedQuery?.page;
    const page = typeof rawPage === "number" ? rawPage : Number(rawPage ?? 1);
    const q = typeof req.validatedQuery?.q === "string" ? req.validatedQuery.q : undefined;
    res.json(await operations.listUsers({ page, q, role }));
});
exports.teams = (0, async_handler_1.asyncHandler)(async (_req, res) => {
    res.json({ teams: await operations.listTeams() });
});
exports.createTeam = (0, async_handler_1.asyncHandler)(async (req, res) => {
    res.status(201).json({ team: await operations.createTeam(req.body.organizationId, req.body.name) });
});
exports.archiveTeam = (0, async_handler_1.asyncHandler)(async (req, res) => {
    res.json({ team: await operations.archiveTeam(req.params.teamId) });
});
exports.assignTeam = (0, async_handler_1.asyncHandler)(async (req, res) => {
    res.json({ user: await operations.assignUserTeam(req.params.userId, req.body.teamId) });
});
exports.activity = (0, async_handler_1.asyncHandler)(async (req, res) => {
    res.json({ date: req.validatedQuery.date, businesses: await operations.activitySummary(req.validatedQuery.date) });
});
exports.attendance = (0, async_handler_1.asyncHandler)(async (req, res) => {
    res.json(await operations.attendanceDashboard(req.validatedQuery.date, req.validatedQuery.page));
});
exports.attendanceExport = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const csv = await operations.attendanceCsv(req.validatedQuery.date);
    res.type("text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="calmwork-attendance-${req.validatedQuery.date}.csv"`);
    res.send(csv);
});
exports.leaveApplications = (0, async_handler_1.asyncHandler)(async (_req, res) => {
    res.json({ requests: await operations.leaveApplications() });
});
exports.decideLeaveApplication = (0, async_handler_1.asyncHandler)(async (req, res) => {
    res.json({ request: await operations.decideLeaveApplication(req.params.toolId, req.body.status) });
});
