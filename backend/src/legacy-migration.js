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
exports.migrateLegacyData = migrateLegacyData;
const mongoose_1 = __importStar(require("mongoose"));
const Organization_1 = require("./models/Organization");
const Team_1 = require("./models/Team");
const User_1 = require("./models/User");
const plans = new Set(["Starter", "Team", "Business"]);
const subscriptionStatuses = new Set(["trialing", "trial_expired", "active", "canceled"]);
function asObjectId(value) {
    return value instanceof mongoose_1.Types.ObjectId ? value : null;
}
function asDate(value) {
    const date = value instanceof Date ? value : typeof value === "string" ? new Date(value) : null;
    return date && Number.isFinite(date.getTime()) ? date : null;
}
async function migrateLegacyData() {
    const organizations = await Organization_1.Organization.collection.find({}).toArray();
    const organizationById = new Map(organizations.map((organization) => [String(organization._id), organization]));
    const legacyUsers = await User_1.User.collection.find({
        organizationId: { $exists: false },
        orgId: { $exists: true },
    }).toArray();
    const legacyTeams = await Team_1.Team.collection.find({
        organizationId: { $exists: false },
        orgId: { $exists: true },
    }).toArray();
    const subscriptions = mongoose_1.default.connection.collection("subscriptions");
    const userMigrations = [];
    for (const user of legacyUsers) {
        const orgId = asObjectId(user.orgId);
        const organization = orgId ? organizationById.get(orgId.toString()) : undefined;
        if (!orgId || !organization) {
            throw new Error(`Cannot migrate user ${String(user._id)}: legacy organization is missing`);
        }
        const legacySubscription = await subscriptions.findOne({ orgId });
        const status = legacySubscription?.status;
        const trialEndsAt = asDate(legacySubscription?.trialEndsAt);
        const plan = organization.plan ?? "Team";
        if (typeof status !== "string" || !subscriptionStatuses.has(status) || !trialEndsAt || typeof plan !== "string" || !plans.has(plan)) {
            throw new Error(`Cannot migrate user ${String(user._id)}: legacy subscription is invalid`);
        }
        const oldSettings = user.settings && typeof user.settings === "object" ? user.settings : {};
        const oldNotifications = "notifications" in oldSettings && oldSettings.notifications && typeof oldSettings.notifications === "object"
            ? oldSettings.notifications
            : {};
        const idleThresholdMinutes = "idleThresholdMinutes" in oldSettings && typeof oldSettings.idleThresholdMinutes === "number"
            ? oldSettings.idleThresholdMinutes
            : "idleThresholdMin" in oldSettings && typeof oldSettings.idleThresholdMin === "number"
                ? oldSettings.idleThresholdMin
                : 5;
        userMigrations.push({
            userId: user._id,
            orgId,
            subscription: { plan, status, trialEndsAt },
            idleThresholdMinutes,
            notifications: {
                weeklyPulse: "weeklyPulse" in oldNotifications && typeof oldNotifications.weeklyPulse === "boolean" ? oldNotifications.weeklyPulse : true,
                idlePrompt: "idlePrompt" in oldNotifications && typeof oldNotifications.idlePrompt === "boolean" ? oldNotifications.idlePrompt : true,
                productUpdates: "productUpdates" in oldNotifications && typeof oldNotifications.productUpdates === "boolean" ? oldNotifications.productUpdates : false,
            },
        });
    }
    for (const team of legacyTeams) {
        const orgId = asObjectId(team.orgId);
        if (!orgId || !organizationById.has(orgId.toString())) {
            throw new Error(`Cannot migrate team ${String(team._id)}: legacy organization is missing`);
        }
    }
    for (const team of legacyTeams) {
        await Team_1.Team.collection.updateOne({ _id: team._id, organizationId: { $exists: false } }, { $set: { organizationId: team.orgId } });
    }
    for (const user of userMigrations) {
        await User_1.User.collection.updateOne({ _id: user.userId, organizationId: { $exists: false } }, {
            $set: {
                organizationId: user.orgId,
                subscription: user.subscription,
                "settings.idleThresholdMinutes": user.idleThresholdMinutes,
                "settings.notifications": user.notifications,
            },
        });
    }
    return { users: userMigrations.length, teams: legacyTeams.length };
}
