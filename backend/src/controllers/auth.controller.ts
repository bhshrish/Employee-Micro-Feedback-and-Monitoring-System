import type { Request, Response } from "express";

interface AuthContext {
    userId: import("mongoose").Types.ObjectId;
    organizationId: import("mongoose").Types.ObjectId;
    teamId: import("mongoose").Types.ObjectId | null;
    role: import("../types/roles").UserRole;
}

interface ControllerRequest extends Request {
    auth?: AuthContext;
    validatedQuery?: Record<string, string | number | undefined>;
}


import * as env_1 from "../config/env";
import * as auth from "../services/auth.service";
import * as otp from "../services/otp.service";
import * as async_handler_1 from "../utils/async-handler";
import * as errors_1 from "../utils/errors";
const cookieName = "calmwork_refresh";
const accessCookieName = "calmwork_access";
interface SessionResult {
    refreshToken: string;
    accessToken: string;
    user: unknown;
}
function cookieOptions(path = "/api/v1/auth") {
    const config = (0, env_1.getConfig)();
    const isSecure = Boolean(config.COOKIE_SECURE);
    return {
        httpOnly: true,
        secure: isSecure,
        sameSite: isSecure ? "none" as const : "lax" as const,
        path,
        ...(config.COOKIE_DOMAIN ? { domain: config.COOKIE_DOMAIN } : {}),
        maxAge: config.REFRESH_TOKEN_DAYS * 86_400_000,
    };
}
function setSession(res: Response, result: SessionResult, statusCode = 200, exposeAccessToken = true): void {
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
function clearSessionCookies(res: Response): void {
    res.clearCookie(cookieName, { ...cookieOptions("/api/v1/auth"), maxAge: undefined });
    res.clearCookie(accessCookieName, { ...cookieOptions("/api/v1"), maxAge: undefined });
}
export const signup = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    res.setHeader("Cache-Control", "no-store");
    res.status(201).json({ user: await auth.signup(req.body) });
});
export const signupSession = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    setSession(res, await auth.signupSession(req.body), 201);
});
export const signin = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    setSession(res, await auth.signin(req.body));
});
export const acceptInvitation = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    const user = await auth.acceptInvitation(req.body);
    res.setHeader("Cache-Control", "no-store");
    res.status(201).json({ user });
});
export const acceptInvitationSession = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    setSession(res, await auth.acceptInvitationSession(req.body), 201);
});
export const refresh = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    const raw = req.cookies?.[cookieName];
    if (!raw)
        throw (0, errors_1.unauthorized)("Refresh cookie is required");
    setSession(res, await auth.rotateRefreshToken(raw), 200, true);
});
export const logout = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    await auth.revokeRefreshToken(req.cookies?.[cookieName]);
    clearSessionCookies(res);
    res.status(204).end();
});
export const logoutEverywhere = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    await auth.revokeAllRefreshTokens(req.auth.userId);
    clearSessionCookies(res);
    res.status(204).end();
});
export const me = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    res.json({ user: await auth.getCurrentUser(req.auth.userId) });
});
export const updateProfile = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    res.json(await auth.updateProfile(req.auth.userId, req.body));
});
export const verifyEmailChange = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    res.setHeader("Cache-Control", "no-store");
    res.json(await auth.verifyEmailChange(req.body));
});
export const forgotPassword = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(await auth.forgotPassword(req.body));
});
export const resetPassword = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(await auth.resetPassword(req.body));
});
export const requestOtp = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(await otp.requestOtp(req.body));
});
export const verifyOtp = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    const result = await otp.verifyOtp(req.body);
    res.setHeader("Cache-Control", "no-store");
    setSession(res, result, 200, false);
});
