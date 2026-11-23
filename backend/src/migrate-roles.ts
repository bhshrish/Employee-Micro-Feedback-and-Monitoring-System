import "dotenv/config";
import mongoose from "mongoose";
import { getConfig } from "./config/env";
import { Invitation } from "./models/Invitation";
import { User } from "./models/User";

async function migrateRoles(): Promise<void> {
    await mongoose.connect(getConfig().MONGODB_URI);
    const [businessAccounts, individuals, invitations] = await Promise.all([
        User.collection.updateMany({ role: "admin" }, { $set: { role: "business" } }),
        User.collection.updateMany({ role: { $in: ["manager", "employee"] } }, { $set: { role: "individual" } }),
        Invitation.collection.updateMany(
            { role: { $ne: "individual" } },
            { $set: { role: "individual" } },
        ),
    ]);

    console.info(`Migrated roles: ${businessAccounts.modifiedCount} business accounts, ${individuals.modifiedCount} individuals, ${invitations.modifiedCount} invitations`);
}

void migrateRoles().finally(async () => mongoose.disconnect()).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Role migration failed");
    process.exitCode = 1;
});
