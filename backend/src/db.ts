import mongoose from "mongoose";
import { getConfig } from "./config/env";
import { migrateLegacyData } from "./legacy-migration";
import { logger } from "./utils/logger";
export async function connectDatabase(): Promise<void> {
    await mongoose.connect(getConfig().MONGODB_URI, {
        autoIndex: getConfig().NODE_ENV !== "production",
        serverSelectionTimeoutMS: 10_000,
    });
    if (getConfig().NODE_ENV === "production") {
        await Promise.all(mongoose.modelNames().map((name) => mongoose.model(name).createIndexes()));
    }
    const migration = await migrateLegacyData();
    if (migration.users > 0 || migration.teams > 0) {
        logger.info(migration, "Migrated legacy workspace data");
    }
    logger.info("MongoDB connected");
}
