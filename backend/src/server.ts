import "dotenv/config";
import mongoose from "mongoose";
import type { Request, Response } from "express";
import { createRequire } from "node:module";
import app, { ensureDatabaseConnected } from "./app";
import { getConfig } from "./config/env";
import { logger } from "./utils/logger";

interface ScheduledJob { stop: () => void }
const require = createRequire(import.meta.url);
const { startAlertJobs } = require("./jobs/alerts") as { startAlertJobs: () => ScheduledJob };
const { startTrialExpirationJob } = require("./jobs/subscriptions") as { startTrialExpirationJob: () => ScheduledJob };
const { startReminderJob } = require("./jobs/reminders") as { startReminderJob: () => ScheduledJob };

function handler(req: Request, res: Response): void {
    app(req, res);
}

async function main(): Promise<void> {
    const config = getConfig();
    await ensureDatabaseConnected();
    const jobs = startAlertJobs();
    const trialJob = startTrialExpirationJob();
    const reminderJob = startReminderJob();
    const server = app.listen(config.PORT, () => logger.info({ port: config.PORT }, "CalmWork API listening"));
    const shutdown = (): void => {
        jobs.stop();
        trialJob.stop();
        reminderJob.stop();
        server.close(() => {
            void mongoose.disconnect().finally(() => process.exit(0));
        });
    };
    process.once("SIGTERM", shutdown);
    process.once("SIGINT", shutdown);
}

module.exports = handler;
if (require.main === module) {
    void main().catch((error: unknown) => {
        logger.fatal({ err: error }, "CalmWork API failed to start");
        process.exitCode = 1;
    });
}
