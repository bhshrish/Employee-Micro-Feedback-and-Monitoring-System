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
const errors_1 = require("../utils/errors");
async function authenticate(req, _res, next) {
    try {
        const header = req.get("authorization");
        if (!header?.startsWith("Bearer "))
            throw (0, errors_1.unauthorized)();
        const token = header.slice(7);
        const payload = jsonwebtoken_1.default.verify(token, (0, env_1.getConfig)().JWT_ACCESS_SECRET, {
            issuer: "pulse-api",
            audience: "pulse-client",
        });
        if (payload.typ !== "access" || !mongoose_1.Types.ObjectId.isValid(payload.sub))
            throw (0, errors_1.unauthorized)();
        const user = await User_1.User.findById(payload.sub).select("organizationId teamId role subscription.status subscription.trialEndsAt");
        if (!user)
            throw (0, errors_1.unauthorized)();
        req.auth = {
            userId: user._id,
            organizationId: user.organizationId,
            teamId: user.teamId,
            role: user.role,
        };
        next();
    }
    catch (error) {
        next(error instanceof Error && error.name === "TokenExpiredError" ? (0, errors_1.unauthorized)("Access token expired") : error);
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
