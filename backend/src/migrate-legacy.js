"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./config/env");
const legacy_migration_1 = require("./legacy-migration");
async function main() {
    await mongoose_1.default.connect((0, env_1.getConfig)().MONGODB_URI);
    try {
        const result = await (0, legacy_migration_1.migrateLegacyData)();
        console.info(`Legacy account migration complete: ${result.users} users and ${result.teams} teams updated.`);
    }
    finally {
        await mongoose_1.default.disconnect();
    }
}
void main().catch((error) => {
    console.error(error instanceof Error ? error.message : "Legacy account migration failed");
    process.exitCode = 1;
});
