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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importStar(require("./app"));
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const alerts_1 = require("./jobs/alerts");
const subscriptions_1 = require("./jobs/subscriptions");
const reminders_1 = require("./jobs/reminders");
function handler(req, res) {
    (0, app_1.default)(req, res);
}
async function main() {
    const config = (0, env_1.getConfig)();
    await (0, app_1.ensureDatabaseConnected)();
    const jobs = (0, alerts_1.startAlertJobs)();
    const trialJob = (0, subscriptions_1.startTrialExpirationJob)();
    const reminderJob = (0, reminders_1.startReminderJob)();
    const server = app_1.default.listen(config.PORT, () => logger_1.logger.info({ port: config.PORT }, "CalmWork API listening"));
    const shutdown = () => {
        jobs.stop();
        trialJob.stop();
        reminderJob.stop();
        server.close(() => {
            void mongoose_1.default.disconnect().finally(() => process.exit(0));
        });
    };
    process.once("SIGTERM", shutdown);
    process.once("SIGINT", shutdown);
}
exports.default = handler;
if (process.env.NODE_ENV !== "test") {
    void main().catch((error) => {
        logger_1.logger.fatal({ err: error }, "CalmWork API failed to start");
        process.exitCode = 1;
    });
}
