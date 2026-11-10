"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expireTrials = expireTrials;
exports.startTrialExpirationJob = startTrialExpirationJob;
const node_cron_1 = __importDefault(require("node-cron"));
const User_1 = require("../models/User");
const logger_1 = require("../utils/logger");
async function expireTrials(now = new Date()) {
    const result = await User_1.User.updateMany({ "subscription.status": "trialing", "subscription.trialEndsAt": { $lte: now } }, { $set: { "subscription.status": "trial_expired" } });
    return result.modifiedCount;
}
function startTrialExpirationJob() {
    return node_cron_1.default.schedule("*/15 * * * *", async () => {
        try {
            const count = await expireTrials();
            if (count)
                logger_1.logger.info({ count }, "Expired WellTrack trials");
        }
        catch (error) {
            logger_1.logger.error({ err: error }, "Failed to expire WellTrack trials");
        }
    }, { timezone: "UTC" });
}
