import cron from "node-cron";
import { Organization } from "../models/Organization";
import { scoreTeamAlerts } from "../services/pulse.service";
import { logger } from "../utils/logger";
import { Types } from "mongoose";

export function startAlertJobs() {
  return cron.schedule("15 8 * * *", async () => {
    const organizations = await Organization.find().select("_id").lean();
    for (const organization of organizations) {
      try {
        const created = await scoreTeamAlerts(organization._id as Types.ObjectId);
        if (created) logger.info({ count: created }, "Aggregated wellbeing alerts refreshed");
      } catch (error) {
        logger.error({ err: error }, "Failed to score wellbeing alerts");
      }
    }
  }, { timezone: "UTC" });
}
