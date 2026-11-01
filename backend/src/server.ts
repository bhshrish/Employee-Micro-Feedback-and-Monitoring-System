import "dotenv/config";
import { createApp } from "./app";
import { getConfig } from "./config/env";
import { connectDatabase } from "./db";
import { startAlertJobs } from "./jobs/alerts";
import { startTrialExpirationJob } from "./jobs/subscriptions";
import { logger } from "./utils/logger";

async function main() {
  const config = getConfig();
  await connectDatabase();
  const app = createApp();
  const jobs = startAlertJobs();
  const trialJob = startTrialExpirationJob();
  const server = app.listen(config.PORT, () => logger.info({ port: config.PORT }, "PULSE API listening"));
  const shutdown = () => {
    jobs.stop();
    trialJob.stop();
    server.close(() => {
      void import("mongoose").then(({ default: mongoose }) => mongoose.disconnect()).finally(() => process.exit(0));
    });
  };
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
}

void main().catch((error) => {
  logger.fatal({ err: error }, "PULSE API failed to start");
  process.exitCode = 1;
});
