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
const oauth = require("../services/oauth.service");
const otp = __importStar(require("../services/otp.service"));
const async_handler_1 = __importStar(require("../utils/async-handler"));
const errors_1 = __importStar(require("../utils/errors"));
const logger_1 = require("../utils/logger");
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
function oauthStateCookieName(provider) {
    return `calmwork_oauth_state_${provider}`;
}
function oauthStateCookieOptions(provider, includeMaxAge = true) {
    const config = (0, env_1.getConfig)();
    return {
        httpOnly: true,
        secure: Boolean(config.COOKIE_SECURE),
        sameSite: "lax",
        path: `/api/v1/auth/oauth/${provider}/callback`,
        ...(includeMaxAge ? { maxAge: 10 * 60 * 1000 } : {}),
    };
}
function setSession(res, result, statusCode = 200, exposeAccessToken = true) {
    setSessionCookies(res, result);
    res.setHeader("Cache-Control", "no-store");
    res.status(statusCode).json({
        user: result.user,
        ...(exposeAccessToken ? { accessToken: result.accessToken, tokenType: "Bearer" } : {}),
    });
}
function setSessionCookies(res, result) {
    res.cookie(cookieName, result.refreshToken, cookieOptions("/api/v1/auth"));
    res.cookie(accessCookieName, result.accessToken, {
        ...cookieOptions("/api/v1"),
        maxAge: undefined,
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
exports.oauthStart = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const provider = req.params.provider;
    try {
        const authorization = await oauth.createAuthorizationUrl(provider);
        res.cookie(oauthStateCookieName(provider), authorization.state, oauthStateCookieOptions(provider));
        res.redirect(302, authorization.authorizationUrl);
    } catch (error) {
        if (!(error instanceof errors_1.AppError))
            throw error;
        const code = error.code === "OAUTH_NOT_CONFIGURED" ? "not_configured" : "failed";
        res.redirect(303, `${(0, env_1.getConfig)().FRONTEND_URL.replace(/\/$/, "")}/login?oauth_provider=${encodeURIComponent(provider)}&oauth_error=${code}`);
    }
});
exports.oauthCallback = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const provider = req.params.provider;
    res.clearCookie(oauthStateCookieName(provider), oauthStateCookieOptions(provider, false));
    try {
        const state = req.query.state;
        if (typeof state !== "string" || req.cookies?.[oauthStateCookieName(provider)] !== state)
            throw new errors_1.AppError(400, "The sign-in request could not be verified. Please try again.", "OAUTH_STATE_INVALID");
        const result = await oauth.completeAuthorization(provider, {
            ...req.query,
            state,
        });
        setSessionCookies(res, result);
        res.setHeader("Cache-Control", "no-store");
        res.redirect(303, `${(0, env_1.getConfig)().FRONTEND_URL.replace(/\/$/, "")}/login?oauth=success&oauth_provider=${encodeURIComponent(provider)}`);
    } catch (error) {
        if (!(error instanceof errors_1.AppError)) {
            logger_1.logger.error({ provider, errorName: error instanceof Error ? error.name : "UnknownError" }, "OAuth callback failed");
        }
        const code = error instanceof errors_1.AppError && error.code === "OAUTH_CANCELLED"
            ? "cancelled"
            : error instanceof errors_1.AppError && error.code === "OAUTH_NOT_CONFIGURED"
                ? "not_configured"
                : error instanceof errors_1.AppError && error.statusCode < 500
                    ? "rejected"
                    : "failed";
        res.redirect(303, `${(0, env_1.getConfig)().FRONTEND_URL.replace(/\/$/, "")}/login?oauth_provider=${encodeURIComponent(provider)}&oauth_error=${code}`);
    }
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
