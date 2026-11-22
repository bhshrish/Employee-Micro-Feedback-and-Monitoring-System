import "dotenv/config";
import mongoose from "mongoose";
import type { Request, Response } from "express";
import app, { ensureDatabaseConnected } from "./app";
import { getConfig } from "./config/env";
import { logger } from "./utils/logger";
import { startAlertJobs } from "./jobs/alerts";
import { startTrialExpirationJob } from "./jobs/subscriptions";
import { startReminderJob } from "./jobs/reminders";

interface ScheduledJob { stop: () => void }
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

export default handler;
if (process.env.NODE_ENV !== "test") {
    void main().catch((error: unknown) => {
        logger.fatal({ err: error }, "CalmWork API failed to start");
        process.exitCode = 1;
    });
}
