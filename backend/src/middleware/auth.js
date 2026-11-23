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
exports.requireOperationsAdmin = requireOperationsAdmin;
exports.authenticate = authenticate;
exports.requireRole = requireRole;
exports.requireEntitlement = requireEntitlement;
exports.requirePlan = requirePlan;
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const mongoose_1 = __importStar(require("mongoose"));
const env_1 = __importStar(require("../config/env"));
const User_1 = __importStar(require("../models/User"));
const OperationsAdmin_1 = __importStar(require("../models/OperationsAdmin"));
const Organization_1 = require("../models/Organization");
const errors_1 = __importStar(require("../utils/errors"));
async function requireOperationsAdmin(req, _res, next) {
    try {
        const header = req.get("authorization");
        const token = req.cookies?.calmwork_operations || (header?.startsWith("Bearer ") ? header.slice(7) : null);
        if (!token)
            throw (0, errors_1.unauthorized)();
        const payload = jsonwebtoken_1.verify(token, (0, env_1.getConfig)().JWT_ADMIN_SECRET, {
            issuer: "calmwork-operations",
            audience: "calmwork-admin",
        });
        if (typeof payload === "string")
            throw (0, errors_1.unauthorized)();
        const operationPayload = payload;
        const admin = await OperationsAdmin_1.OperationsAdmin.findById("platform-admin").select("email passwordChangedAt");
        if (operationPayload.typ !== "operations_admin" ||
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
async function authenticate(req, _res, next) {
    try {
        const header = req.get("authorization");
        const token = req.cookies?.calmwork_access || (header?.startsWith("Bearer ") ? header.slice(7) : null);
        if (!token)
            throw (0, errors_1.unauthorized)();
        const payload = jsonwebtoken_1.verify(token, (0, env_1.getConfig)().JWT_ACCESS_SECRET, {
            issuer: "calmwork-api",
            audience: "calmwork-client",
        });
        if (typeof payload === "string")
            throw (0, errors_1.unauthorized)();
        const accessPayload = payload;
        if (accessPayload.typ !== "access" || !mongoose_1.Types.ObjectId.isValid(accessPayload.sub))
            throw (0, errors_1.unauthorized)();
        const user = await User_1.User.findById(accessPayload.sub).select("organizationId teamId role isActive subscription.status subscription.trialEndsAt");
        if (!user || !user.isActive)
            throw (0, errors_1.unauthorized)();
        if (!await Organization_1.Organization.exists({ _id: user.organizationId, isActive: { $ne: false } }))
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
