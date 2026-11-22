import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import jsonwebtoken_1 from "jsonwebtoken";
import * as mongoose_1 from "mongoose";
import * as env_1 from "../config/env";
import * as User_1 from "../models/User";
import * as OperationsAdmin_1 from "../models/OperationsAdmin";
import { Organization } from "../models/Organization";
import * as errors_1 from "../utils/errors";
interface AuthContext {
    userId: Types.ObjectId | string;
    organizationId: Types.ObjectId | string;
    teamId: Types.ObjectId | string | null;
    role: "employee" | "manager" | "admin";
}

interface AuthenticatedRequest extends Request {
    auth?: AuthContext;
    cookies: Record<string, string | undefined>;
}

interface OperationsAdminPayload extends JwtPayload {
    typ: string;
    sub: string;
    passwordChangedAt: number;
}

interface AccessPayload extends JwtPayload {
    typ: string;
    sub: string;
}

export async function requireOperationsAdmin(req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> {
    try {
        const header = req.get("authorization");
        const token = req.cookies?.calmwork_operations || (header?.startsWith("Bearer ") ? header.slice(7) : null);
        if (!token)
            throw (0, errors_1.unauthorized)();
        const payload = jsonwebtoken_1.default.verify(token, (0, env_1.getConfig)().JWT_ADMIN_SECRET, {
            issuer: "calmwork-operations",
            audience: "calmwork-admin",
        });
        if (typeof payload === "string")
            throw (0, errors_1.unauthorized)();
        const operationPayload = payload as OperationsAdminPayload;
        const admin = await OperationsAdmin_1.OperationsAdmin.findById("platform-admin").select("email passwordChangedAt");
        if (        operationPayload.typ !== "operations_admin" ||
        operationPayload.sub !== (0, env_1.getConfig)().OPS_ADMIN_EMAIL.toLowerCase() ||
            !admin ||
            admin.email !== payload.sub ||
            admin.passwordChangedAt.getTime() !== operationPayload.passwordChangedAt)
            throw (0, errors_1.unauthorized)();
        next();
    }
    catch (error) {
        if (error instanceof Error && ["JsonWebTokenError", "NotBeforeError", "TokenExpiredError"].includes(error.name)) {
            next((0, errors_1.unauthorized)("Admin session is invalid or expired"));
            return;
        }
        next(error);
    }
}
export async function authenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> {
    try {
        const header = req.get("authorization");
        const token = req.cookies?.calmwork_access || (header?.startsWith("Bearer ") ? header.slice(7) : null);
        if (!token)
            throw (0, errors_1.unauthorized)();
        const payload = jsonwebtoken_1.default.verify(token, (0, env_1.getConfig)().JWT_ACCESS_SECRET, {
            issuer: "calmwork-api",
            audience: "calmwork-client",
        });
        if (typeof payload === "string")
            throw (0, errors_1.unauthorized)();
        const accessPayload = payload as AccessPayload;
        if (accessPayload.typ !== "access" || !mongoose_1.Types.ObjectId.isValid(accessPayload.sub))
            throw (0, errors_1.unauthorized)();
        const user = await User_1.User.findById(accessPayload.sub).select("organizationId teamId role isActive subscription.status subscription.trialEndsAt");
        if (!user || !user.isActive)
            throw (0, errors_1.unauthorized)();
        if (!await Organization.exists({ _id: user.organizationId, isActive: { $ne: false } }))
            throw (0, errors_1.unauthorized)("This business workspace is inactive");
        req.auth = {
            userId: user._id,
            organizationId: user.organizationId,
            teamId: user.teamId,
            role: user.role,
        };
        next();
    }
    catch (error) {
        if (error instanceof Error && ["JsonWebTokenError", "NotBeforeError", "TokenExpiredError"].includes(error.name)) {
            next((0, errors_1.unauthorized)(error.name === "TokenExpiredError" ? "Access token expired" : "Access token is invalid"));
            return;
        }
        next(error);
    }
}
export function requireRole(...roles: Array<"employee" | "manager" | "admin">): RequestHandler {
    return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
        if (!req.auth || !roles.includes(req.auth.role)) {
            next((0, errors_1.forbidden)());
            return;
        }
        next();
    };
}
export async function requireEntitlement(req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> {
    try {
        if (!req.auth)
            throw (0, errors_1.unauthorized)();
        next();
    }
    catch (error) {
        next(error);
    }
}
export function requirePlan(...plans: Array<"Starter" | "Team" | "Business">): RequestHandler {
    return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.auth)
                throw (0, errors_1.unauthorized)();
            const user = await User_1.User.findById(req.auth.userId).select("subscription.plan subscription.status subscription.trialEndsAt");
            if (!user)
                throw (0, errors_1.unauthorized)();
            if (user.subscription.status === "trialing" && user.subscription.trialEndsAt <= new Date()) {
                user.subscription.status = "trial_expired";
                await user.save();
            }
            if (user.subscription.status === "trial_expired" || user.subscription.status === "canceled") {
                next((0, errors_1.forbidden)("A current trial or subscription is required"));
                return;
            }
            if (!plans.includes(user.subscription.plan)) {
                next((0, errors_1.forbidden)("This feature is not available on your current plan"));
                return;
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
