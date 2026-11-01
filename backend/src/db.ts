import mongoose from "mongoose";
import { getConfig } from "./config/env";
import { logger } from "./utils/logger";

export async function connectDatabase(): Promise<void> {
  await mongoose.connect(getConfig().MONGODB_URI, {
    autoIndex: getConfig().NODE_ENV !== "production",
    serverSelectionTimeoutMS: 10_000,
  });
  if (getConfig().NODE_ENV === "production") {
    await Promise.all(mongoose.modelNames().map((name) => mongoose.model(name).createIndexes()));
  }
  logger.info("MongoDB connected");
}
