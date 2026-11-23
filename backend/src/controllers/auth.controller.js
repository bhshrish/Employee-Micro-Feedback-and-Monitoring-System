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
exports.verifyOtp = exports.requestOtp = exports.resetPassword = exports.forgotPassword = exports.verifyEmailChange = exports.updateProfile = exports.me = exports.logoutEverywhere = exports.logout = exports.refresh = exports.acceptInvitationSession = exports.acceptInvitation = exports.signin = exports.signupSession = exports.signup = void 0;
const env_1 = __importStar(require("../config/env"));
const auth = __importStar(require("../services/auth.service"));
const otp = __importStar(require("../services/otp.service"));
const async_handler_1 = __importStar(require("../utils/async-handler"));
const errors_1 = __importStar(require("../utils/errors"));
const cookieName = "calmwork_refresh";
const accessCookieName = "calmwork_access";
function cookieOptions(path = "/api/v1/auth") {
    const config = (0, env_1.getConfig)();
    const isSecure = Boolean(config.COOKIE_SECURE);
    return {
        httpOnly: true,
        secure: isSecure,
        sameSite: isSecure ? "none" : "lax",
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
exports.signupSession = (0, async_handler_1.asyncHandler)(async (req, res) => {
    setSession(res, await auth.signupSession(req.body), 201);
});
exports.signin = (0, async_handler_1.asyncHandler)(async (req, res) => {
    setSession(res, await auth.signin(req.body));
});
exports.acceptInvitation = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = await auth.acceptInvitation(req.body);
    res.setHeader("Cache-Control", "no-store");
    res.status(201).json({ user });
});
exports.acceptInvitationSession = (0, async_handler_1.asyncHandler)(async (req, res) => {
    setSession(res, await auth.acceptInvitationSession(req.body), 201);
});
exports.refresh = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const raw = req.cookies?.[cookieName];
    if (!raw)
        throw (0, errors_1.unauthorized)("Refresh cookie is required");
    setSession(res, await auth.rotateRefreshToken(raw), 200, true);
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
    res.json(await auth.updateProfile(req.auth.userId, req.body));
});
exports.verifyEmailChange = (0, async_handler_1.asyncHandler)(async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.json(await auth.verifyEmailChange(req.body));
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
