import "dotenv/config";
import mongoose from "mongoose";
import { getConfig } from "./config/env";
import { OperationsAdmin } from "./models/OperationsAdmin";

const ADMIN_ID = "platform-admin";
const BCRYPT_ROUNDS = 12;
const bcrypt = require("bcryptjs") as {
    hash(value: string, rounds: number): Promise<string>;
};

async function seedAdmin(): Promise<void> {
    const config = getConfig();
    if (!config.OPS_ADMIN_INITIAL_PASSWORD) {
        throw new Error("Set OPS_ADMIN_INITIAL_PASSWORD in backend/.env before running npm run seed:admin");
    }

    await mongoose.connect(config.MONGODB_URI);
    const admin = await OperationsAdmin.findById(ADMIN_ID);
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

    await OperationsAdmin.create({
        _id: ADMIN_ID,
        name: config.OPS_ADMIN_NAME,
        email: config.OPS_ADMIN_EMAIL.toLowerCase(),
        passwordHash: await bcrypt.hash(config.OPS_ADMIN_INITIAL_PASSWORD, BCRYPT_ROUNDS),
        passwordChangedAt: new Date(),
    });
    console.info("Platform administrator seeded");
}

void seedAdmin().finally(async () => mongoose.disconnect()).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Platform administrator seed failed");
    process.exitCode = 1;
});
