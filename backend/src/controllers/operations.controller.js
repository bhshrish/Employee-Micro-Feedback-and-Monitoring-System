"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
const env_1 = require("../config/env");
const async_handler_1 = require("../utils/async-handler");
const operations_service_1 = require("../services/operations.service");
const cookieName = "workwell_operations";
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
    (0, operations_service_1.verifyAdminCredentials)(req.body.email, req.body.password);
    const config = (0, env_1.getConfig)();
    const token = (0, jsonwebtoken_1.sign)({ typ: "operations_admin" }, config.JWT_ACCESS_SECRET, {
        subject: operations_service_1.adminEmail,
        issuer: "workwell-operations",
        audience: "workwell-admin",
        expiresIn: "8h",
    });
    res.cookie(cookieName, token, cookieOptions());
    res.setHeader("Cache-Control", "no-store");
    res.json({ admin: { email: operations_service_1.adminEmail } });
});
exports.adminSignOut = (_req, res) => {
    res.clearCookie(cookieName, { ...cookieOptions(), maxAge: undefined });
    res.status(204).end();
};
exports.adminMe = (_req, res) => res.json({ admin: { email: operations_service_1.adminEmail } });
exports.attendance = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const query = req.validatedQuery;
    res.json(await (0, operations_service_1.attendanceDashboard)(query.date, query.page));
});
exports.attendanceExport = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const query = req.validatedQuery;
    const csv = await (0, operations_service_1.attendanceCsv)(query.date);
    res.type("text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="workwell-attendance-${query.date}.csv"`);
    res.send(csv);
});
