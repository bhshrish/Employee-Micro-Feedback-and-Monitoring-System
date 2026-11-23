"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./config/env");
const OperationsAdmin_1 = require("./models/OperationsAdmin");
const ADMIN_ID = "platform-admin";
const BCRYPT_ROUNDS = 12;
const bcrypt = require("bcryptjs");
async function seedAdmin() {
    const config = (0, env_1.getConfig)();
    if (!config.OPS_ADMIN_INITIAL_PASSWORD) {
        throw new Error("Set OPS_ADMIN_INITIAL_PASSWORD in backend/.env before running npm run seed:admin");
    }
    await mongoose_1.default.connect(config.MONGODB_URI);
    const admin = await OperationsAdmin_1.OperationsAdmin.findById(ADMIN_ID);
    if (admin) {
        if (admin.email !== config.OPS_ADMIN_EMAIL.toLowerCase()) {
            admin.email = config.OPS_ADMIN_EMAIL.toLowerCase();
        }
        if (admin.name !== config.OPS_ADMIN_NAME) {
            admin.name = config.OPS_ADMIN_NAME;
        }
        await admin.save();
        console.info("Platform administrator profile synchronized; existing password was not changed");
        return;
    }
    await OperationsAdmin_1.OperationsAdmin.create({
        _id: ADMIN_ID,
        name: config.OPS_ADMIN_NAME,
        email: config.OPS_ADMIN_EMAIL.toLowerCase(),
        passwordHash: await bcrypt.hash(config.OPS_ADMIN_INITIAL_PASSWORD, BCRYPT_ROUNDS),
        passwordChangedAt: new Date(),
    });
    console.info("Platform administrator seeded");
}
void seedAdmin().finally(async () => mongoose_1.default.disconnect()).catch((error) => {
    console.error(error instanceof Error ? error.message : "Platform administrator seed failed");
    process.exitCode = 1;
});
