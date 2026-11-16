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
exports.updateProfile = exports.me = exports.logoutEverywhere = exports.logout = exports.refresh = exports.acceptInvitation = exports.signin = exports.signup = exports.forgotPassword = exports.resetPassword = void 0;
const env_1 = require("../config/env");
const auth = __importStar(require("../services/auth.service"));
const otp = require("../services/otp.service");
const async_handler_1 = require("../utils/async-handler");
const errors_1 = require("../utils/errors");
const cookieName = "calmwork_refresh";
const accessCookieName = "calmwork_access";
function cookieOptions(path = "/api/v1/auth") {
    const config = (0, env_1.getConfig)();
    return {
        httpOnly: true,
        secure: config.COOKIE_SECURE || config.NODE_ENV === "production",
        sameSite: config.NODE_ENV === "production" ? "none" : "lax",
        path,
        ...(config.COOKIE_DOMAIN ? { domain: config.COOKIE_DOMAIN } : {}),
        maxAge: config.REFRESH_TOKEN_DAYS * 86_400_000,
    };
}
function setSession(res, result, statusCode = 200, exposeAccessToken = true) {
    res.cookie(cookieName, result.refreshToken, cookieOptions("/api/v1/auth"));
    res.cookie(accessCookieName, result.accessToken, {
        ...cookieOptions("/api/v1"),
        maxAge: undefined,
    });
    res.setHeader("Cache-Control", "no-store");
    res.status(statusCode).json({
        user: result.user,
        ...(exposeAccessToken ? { accessToken: result.accessToken, tokenType: "Bearer" } : {}),
    });
}
function clearSessionCookies(res) {
    res.clearCookie(cookieName, { ...cookieOptions("/api/v1/auth"), maxAge: undefined });
    res.clearCookie(accessCookieName, { ...cookieOptions("/api/v1"), maxAge: undefined });
}
exports.signup = (0, async_handler_1.asyncHandler)(async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.status(201).json({ user: await auth.signup(req.body) });
});
exports.signin = (0, async_handler_1.asyncHandler)(async (req, res) => setSession(res, await auth.signin(req.body)));
exports.acceptInvitation = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = await auth.acceptInvitation(req.body);
    res.setHeader("Cache-Control", "no-store");
    res.status(201).json({ user });
});
exports.refresh = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const raw = req.cookies?.[cookieName];
    if (!raw)
        throw (0, errors_1.unauthorized)("Refresh cookie is required");
    setSession(res, await auth.rotateRefreshToken(raw), 200, false);
});
exports.logout = (0, async_handler_1.asyncHandler)(async (req, res) => {
    await auth.revokeRefreshToken(req.cookies?.[cookieName]);
    clearSessionCookies(res);
    res.status(204).end();
});
exports.logoutEverywhere = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    await auth.revokeAllRefreshTokens(req.auth.userId);
    clearSessionCookies(res);
    res.status(204).end();
});
exports.me = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    res.json({ user: await auth.getCurrentUser(req.auth.userId) });
});
exports.updateProfile = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const { User } = await Promise.resolve().then(() => __importStar(require("../models/User")));
    const update = {};
    if (req.body.name !== undefined)
        update.name = req.body.name;
    if (req.body.phone !== undefined)
        update.phone = req.body.phone;
    if (req.body.settings?.idleThresholdMinutes !== undefined)
        update["settings.idleThresholdMinutes"] = req.body.settings.idleThresholdMinutes;
    for (const [key, value] of Object.entries(req.body.settings?.notifications ?? {})) {
        update[`settings.notifications.${key}`] = value;
    }
    const user = await User.findOneAndUpdate({ _id: req.auth.userId, organizationId: req.auth.organizationId }, { $set: update }, { new: true, runValidators: true });
    if (!user)
        throw (0, errors_1.unauthorized)();
    res.json({ user: await auth.getCurrentUser(user._id) });
});
exports.forgotPassword = (0, async_handler_1.asyncHandler)(async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(await auth.forgotPassword(req.body));
});
exports.resetPassword = (0, async_handler_1.asyncHandler)(async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(await auth.resetPassword(req.body));
});
exports.requestOtp = (0, async_handler_1.asyncHandler)(async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(await otp.requestOtp(req.body));
});
exports.verifyOtp = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const result = await otp.verifyOtp(req.body);
    res.setHeader("Cache-Control", "no-store");
    setSession(res, result, 200, false);
});
