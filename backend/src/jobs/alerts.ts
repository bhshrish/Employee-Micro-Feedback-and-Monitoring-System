const node_cron_1 = require("node-cron");
const Organization_1 = require("../models/Organization");
const pulse_service_1 = require("../services/pulse.service");
const logger_1 = require("../utils/logger");
export function startAlertJobs() {
    return node_cron_1.schedule("15 8 * * *", async () => {
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
