"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAlertJobs = startAlertJobs;
const node_cron_1 = __importDefault(require("node-cron"));
const Organization_1 = require("../models/Organization");
const pulse_service_1 = require("../services/pulse.service");
const logger_1 = require("../utils/logger");
function startAlertJobs() {
    return node_cron_1.default.schedule("15 8 * * *", async () => {
        const organizations = await Organization_1.Organization.find().select("_id").lean();
        for (const organization of organizations) {
            try {
                const created = await (0, pulse_service_1.scoreTeamAlerts)(organization._id);
                if (created)
                    logger_1.logger.info({ count: created }, "Aggregated wellbeing alerts refreshed");
            }
            catch (error) {
                logger_1.logger.error({ err: error }, "Failed to score wellbeing alerts");
            }
        }
    }, { timezone: "UTC" });
}
