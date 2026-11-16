import { Types } from "mongoose";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { connectDatabase } from "@/lib/server/db";
import { ApiError, apiRequest, parseJson, successResponse } from "@/lib/server/http";
import { getConfig } from "../../../../../../backend/src/config/env";
import * as auth from "../../../../../../backend/src/services/auth.service";
import * as otp from "../../../../../../backend/src/services/otp.service";
import * as schemas from "../../../../../../backend/src/next/auth-schemas";
import { Organization } from "../../../../../../backend/src/models/Organization";
import { User } from "../../../../../../backend/src/models/User";
import { unauthorized } from "../../../../../../backend/src/utils/errors";

type SessionResult = {
    user: unknown;
    accessToken: string;
    refreshToken: string;
};

type AuthContext = {
    userId: Types.ObjectId;
    organizationId: Types.ObjectId;
};

type ProfileInput = {
    name?: string;
    phone?: string | null;
    settings?: {
        idleThresholdMinutes?: number;
        notifications?: {
            weeklyPulse?: boolean;
            idlePrompt?: boolean;
            productUpdates?: boolean;
        };
    };
};

const refreshCookie = "calmwork_refresh";
const accessCookie = "calmwork_access";

function cookieValue(request: Request, name: string): string | undefined {
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) return undefined;
    const cookie = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
    return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : undefined;
}

function cookieAttributes(path: string): string {
    const config = getConfig();
    return [
        `Path=${path}`,
        "HttpOnly",
        `SameSite=${config.NODE_ENV === "production" ? "None" : "Lax"}`,
        ...(config.COOKIE_SECURE || config.NODE_ENV === "production" ? ["Secure"] : []),
        ...(config.COOKIE_DOMAIN ? [`Domain=${config.COOKIE_DOMAIN}`] : []),
    ].join("; ");
}

function withSessionCookies(response: Response, session: SessionResult): Response {
    const config = getConfig();
    response.headers.append(
        "Set-Cookie",
        `${refreshCookie}=${encodeURIComponent(session.refreshToken)}; ${cookieAttributes("/api/v1/auth")}; Max-Age=${config.REFRESH_TOKEN_DAYS * 86_400}`,
    );
    response.headers.append(
        "Set-Cookie",
        `${accessCookie}=${encodeURIComponent(session.accessToken)}; ${cookieAttributes("/api/v1")}`,
    );

    return response;
}

function clearSessionCookies(response: Response): Response {
    response.headers.append(
        "Set-Cookie",
        `${refreshCookie}=; ${cookieAttributes("/api/v1/auth")}; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
    );
    response.headers.append(
        "Set-Cookie",
        `${accessCookie}=; ${cookieAttributes("/api/v1")}; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
    );
    return response;
}

async function authenticate(request: Request): Promise<AuthContext> {
    const authorization = request.headers.get("authorization");
    const token = cookieValue(request, accessCookie) ??
        (authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined);
    if (!token) throw unauthorized();

    let payload: string | JwtPayload;
    try {
        const config = getConfig();
        payload = jwt.verify(token, config.JWT_ACCESS_SECRET, {
            issuer: "calmwork-api",
            audience: "calmwork-client",
        });
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.NotBeforeError || error instanceof jwt.TokenExpiredError) {
            throw unauthorized(error instanceof jwt.TokenExpiredError ? "Access token expired" : "Access token is invalid");
        }
        throw error;
    }

    if (
        typeof payload === "string" ||
        payload.typ !== "access" ||
        typeof payload.sub !== "string" ||
        !Types.ObjectId.isValid(payload.sub)
    ) {
        throw unauthorized("Access token is invalid");
    }

    const user = await User.findById(payload.sub)
        .select("organizationId isActive")
        .lean();
    if (!user || !user.isActive) throw unauthorized();
    if (!await Organization.exists({ _id: user.organizationId, isActive: { $ne: false } })) {
        throw unauthorized("This business workspace is inactive");
    }

    return { userId: user._id, organizationId: user.organizationId };
}

async function handle(request: Request, action: string[]): Promise<Response> {
    const name = action.join("/");
    if (!name) throw new ApiError(404, "Route not found", "NOT_FOUND");
    const method = request.method.toUpperCase();

    await connectDatabase();

    if (method === "POST") {
        if (name === "signup") {
            const body = await parseJson(request, schemas.signupSchema);
            return successResponse({ user: await auth.signup(body) }, 201);
        }
        if (name === "signin" || name === "login") {
            const body = await parseJson(request, schemas.signinSchema);
            const session = await auth.signin(body) as SessionResult;
            return withSessionCookies(successResponse({
                user: session.user,
                accessToken: session.accessToken,
                tokenType: "Bearer",
            }), session);
        }
        if (name === "accept-invitation") {
            const body = await parseJson(request, schemas.invitationAcceptSchema);
            return successResponse({ user: await auth.acceptInvitation(body) }, 201);
        }
        if (name === "forgot-password") {
            const body = await parseJson(request, schemas.forgotPasswordSchema);
            return successResponse(await auth.forgotPassword(body));
        }
        if (name === "reset-password") {
            const body = await parseJson(request, schemas.resetPasswordSchema);
            return successResponse(await auth.resetPassword(body));
        }
        if (name === "otp/request") {
            const body = await parseJson(request, schemas.otpRequestSchema);
            return successResponse(await otp.requestOtp(body));
        }
        if (name === "otp/verify") {
            const body = await parseJson(request, schemas.otpVerifySchema);
            const session = await otp.verifyOtp(body) as SessionResult;
            return withSessionCookies(successResponse({ user: session.user }), session);
        }
        if (name === "refresh") {
            const refreshToken = cookieValue(request, refreshCookie);
            if (!refreshToken) throw unauthorized("Refresh cookie is required");
            const session = await auth.rotateRefreshToken(refreshToken) as SessionResult;
            return withSessionCookies(successResponse({ user: session.user }), session);
        }
        if (name === "logout") {
            await auth.revokeRefreshToken(cookieValue(request, refreshCookie));
            return clearSessionCookies(new Response(null, { status: 204 }));
        }
        if (name === "logout-all") {
            const context = await authenticate(request);
            await auth.revokeAllRefreshTokens(context.userId);
            return clearSessionCookies(new Response(null, { status: 204 }));
        }
    }

    if (method === "GET" && name === "me") {
        const context = await authenticate(request);
        return successResponse({ user: await auth.getCurrentUser(context.userId) });
    }

    if (method === "PATCH" && name === "me") {
        const context = await authenticate(request);
        const body = await parseJson(request, schemas.profileSchema) as ProfileInput;
        const update: Record<string, unknown> = {};
        if (body.name !== undefined) update.name = body.name;
        if (body.phone !== undefined) update.phone = body.phone;
        if (body.settings?.idleThresholdMinutes !== undefined) {
            update["settings.idleThresholdMinutes"] = body.settings.idleThresholdMinutes;
        }
        for (const [key, value] of Object.entries(body.settings?.notifications ?? {})) {
            update[`settings.notifications.${key}`] = value;
        }
        const user = await User.findOneAndUpdate(
            { _id: context.userId, organizationId: context.organizationId },
            { $set: update },
            { new: true, runValidators: true },
        );
        if (!user) throw unauthorized();
        return successResponse({ user: await auth.getCurrentUser(user._id) });
    }

    throw new ApiError(404, "Route not found", "NOT_FOUND");
}

async function dispatch(
    request: Request,
    context: { params: Promise<{ action: string[] }> },
): Promise<Response> {
    return apiRequest(request, async () => {
        const { action } = await context.params;
        return handle(request, action);
    });
}

export const GET = dispatch;
export const POST = dispatch;
export const PATCH = dispatch;
