"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.requireRole = requireRole;
exports.requireEntitlement = requireEntitlement;
exports.requirePlan = requirePlan;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = require("mongoose");
const env_1 = require("../config/env");
const User_1 = require("../models/User");
const OperationsAdmin_1 = require("../models/OperationsAdmin");
const errors_1 = require("../utils/errors");
async function requireOperationsAdmin(req, _res, next) {
    try {
        const token = req.cookies?.calmwork_operations;
        if (!token)
            throw (0, errors_1.unauthorized)();
        const payload = jsonwebtoken_1.default.verify(token, (0, env_1.getConfig)().JWT_ADMIN_SECRET, {
            issuer: "calmwork-operations",
            audience: "calmwork-admin",
        });
        const admin = await OperationsAdmin_1.OperationsAdmin.findById("platform-admin").select("email passwordChangedAt");
        if (payload.typ !== "operations_admin" ||
            payload.sub !== (0, env_1.getConfig)().OPS_ADMIN_EMAIL.toLowerCase() ||
            !admin ||
            admin.email !== payload.sub ||
            admin.passwordChangedAt.getTime() !== payload.passwordChangedAt)
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
exports.requireOperationsAdmin = requireOperationsAdmin;
async function authenticate(req, _res, next) {
    try {
        const header = req.get("authorization");
        const token = req.cookies?.calmwork_access || (header?.startsWith("Bearer ") ? header.slice(7) : null);
        if (!token)
            throw (0, errors_1.unauthorized)();
        const payload = jsonwebtoken_1.default.verify(token, (0, env_1.getConfig)().JWT_ACCESS_SECRET, {
            issuer: "calmwork-api",
            audience: "calmwork-client",
        });
        if (payload.typ !== "access" || !mongoose_1.Types.ObjectId.isValid(payload.sub))
            throw (0, errors_1.unauthorized)();
        const user = await User_1.User.findById(payload.sub).select("organizationId teamId role isActive subscription.status subscription.trialEndsAt");
        if (!user || !user.isActive)
            throw (0, errors_1.unauthorized)();
        const { Organization } = require("../models/Organization");
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
function requireRole(...roles) {
    return (req, _res, next) => {
        if (!req.auth || !roles.includes(req.auth.role)) {
            next((0, errors_1.forbidden)());
            return;
        }
        next();
    };
}
async function requireEntitlement(req, _res, next) {
    try {
        if (!req.auth)
            throw (0, errors_1.unauthorized)();
        const user = await User_1.User.findById(req.auth.userId).select("subscription.plan subscription.status subscription.trialEndsAt");
        if (!user)
            throw (0, errors_1.unauthorized)();
        const sub = user.subscription;
        if (sub.status === "trialing" && sub.trialEndsAt <= new Date()) {
            sub.status = "trial_expired";
            await user.save();
        }
        if (user.subscription.status === "trial_expired" || user.subscription.status === "canceled") {
            next((0, errors_1.forbidden)("A current trial or subscription is required"));
            return;
        }
        next();
    }
    catch (error) {
        next(error);
    }
}
function requirePlan(...plans) {
    return async (req, _res, next) => {
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
