"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    teamId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Team", default: null },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, trim: true, unique: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["employee", "manager", "admin"], default: "employee", required: true },
    isActive: { type: Boolean, default: true, index: true },
    failedLoginAttempts: { type: Number, default: 0, select: false },
    lockedUntil: { type: Date, default: null, select: false },
    subscription: {
        plan: { type: String, enum: ["Starter", "Team", "Business"], default: "Team" },
        status: { type: String, enum: ["trialing", "trial_expired", "active", "canceled"], default: "trialing" },
        trialEndsAt: { type: Date, required: true },
        stripeCustomerId: { type: String, default: null, select: false },
        stripeSubscriptionId: { type: String, default: null },
        cancelAtPeriodEnd: { type: Boolean, default: false },
        currentPeriodEnd: { type: Date, default: null },
    },
    settings: {
        idleThresholdMinutes: { type: Number, min: 1, max: 30, default: 5 },
        notifications: {
            weeklyPulse: { type: Boolean, default: true },
            idlePrompt: { type: Boolean, default: true },
            productUpdates: { type: Boolean, default: false },
        },
    },
}, { timestamps: true, minimize: false });
userSchema.index({ organizationId: 1, teamId: 1 });
exports.User = mongoose_1.models.User || (0, mongoose_1.model)("User", userSchema);
