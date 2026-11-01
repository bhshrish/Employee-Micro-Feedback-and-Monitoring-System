import cron from "node-cron";
import { User } from "../models/User";
import { logger } from "../utils/logger";

export async function expireTrials(now = new Date()): Promise<number> {
  const result = await User.updateMany(
    { "subscription.status": "trialing", "subscription.trialEndsAt": { $lte: now } },
    { $set: { "subscription.status": "trial_expired" } },
  );
  return result.modifiedCount;
}

export function startTrialExpirationJob() {
  return cron.schedule("*/15 * * * *", async () => {
    try {
      const count = await expireTrials();
      if (count) logger.info({ count }, "Expired PULSE trials");
    } catch (error) {
      logger.error({ err: error }, "Failed to expire PULSE trials");
    }
  }, { timezone: "UTC" });
}
