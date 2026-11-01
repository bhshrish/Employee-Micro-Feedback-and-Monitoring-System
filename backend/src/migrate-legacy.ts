import "dotenv/config";
import mongoose from "mongoose";
import { getConfig } from "./config/env";
import { migrateLegacyData } from "./legacy-migration";

async function main() {
  await mongoose.connect(getConfig().MONGODB_URI);
  try {
    const result = await migrateLegacyData();
    console.info(`Legacy account migration complete: ${result.users} users and ${result.teams} teams updated.`);
  } finally {
    await mongoose.disconnect();
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Legacy account migration failed");
  process.exitCode = 1;
});
