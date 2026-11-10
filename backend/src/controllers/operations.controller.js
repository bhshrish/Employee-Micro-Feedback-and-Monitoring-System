"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminSignIn = exports.adminSignOut = exports.adminMe = exports.overview = exports.businesses = exports.updateBusiness = exports.users = exports.updateUser = exports.teams = exports.createTeam = exports.archiveTeam = exports.assignTeam = exports.activity = exports.attendance = exports.attendanceExport = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const env_1 = require("../config/env");
const async_handler_1 = require("../utils/async-handler");
const operations = require("../services/operations.service");
const Organization_1 = require("../models/Organization");
const cookieName = "welltrack_operations";
function cookieOptions() {
    const config = (0, env_1.getConfig)();
    return {
        httpOnly: true,
        secure: config.COOKIE_SECURE || config.NODE_ENV === "production",
        sameSite: config.NODE_ENV === "production" ? "none" : "lax",
        path: "/api/v1/operations",
        maxAge: 8 * 60 * 60 * 1000,
    };
}
exports.adminSignIn = (0, async_handler_1.asyncHandler)(async (req, res) => {
    operations.verifyAdminCredentials(req.body.username, req.body.email, req.body.password);
    const config = (0, env_1.getConfig)();
    const token = (0, jsonwebtoken_1.sign)({ typ: "operations_admin" }, config.JWT_ACCESS_SECRET, {
        subject: operations.adminEmail,
        issuer: "welltrack-operations",
        audience: "welltrack-admin",
        expiresIn: "8h",
    });
    res.cookie(cookieName, token, cookieOptions());
    res.setHeader("Cache-Control", "no-store");
    res.json({ admin: { username: "admin", email: operations.adminEmail } });
});
exports.adminSignOut = (_req, res) => {
    res.clearCookie(cookieName, { ...cookieOptions(), maxAge: undefined });
    res.status(204).end();
};
exports.adminMe = (_req, res) => res.json({ admin: { username: "admin", email: operations.adminEmail } });
exports.overview = (0, async_handler_1.asyncHandler)(async (_req, res) => res.json({ overview: await operations.operationsOverview() }));
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
exports.users = (0, async_handler_1.asyncHandler)(async (req, res) => res.json(await operations.listUsers(req.validatedQuery)));
exports.updateUser = (0, async_handler_1.asyncHandler)(async (req, res) => {
    res.json({ user: await operations.setUserActive(req.params.userId, req.body.isActive) });
});
exports.teams = (0, async_handler_1.asyncHandler)(async (_req, res) => res.json({ teams: await operations.listTeams() }));
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
    res.setHeader("Content-Disposition", `attachment; filename="welltrack-attendance-${req.validatedQuery.date}.csv"`);
    res.send(csv);
});