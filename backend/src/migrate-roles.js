"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./config/env");
const Invitation_1 = require("./models/Invitation");
const User_1 = require("./models/User");
async function migrateRoles() {
    await mongoose_1.default.connect((0, env_1.getConfig)().MONGODB_URI);
    const [businessAccounts, individuals, invitations] = await Promise.all([
        User_1.User.collection.updateMany({ role: "admin" }, { $set: { role: "business" } }),
        User_1.User.collection.updateMany({ role: { $in: ["manager", "employee"] } }, { $set: { role: "individual" } }),
        Invitation_1.Invitation.collection.updateMany({ role: { $ne: "individual" } }, { $set: { role: "individual" } }),
    ]);
    console.info(`Migrated roles: ${businessAccounts.modifiedCount} business accounts, ${individuals.modifiedCount} individuals, ${invitations.modifiedCount} invitations`);
}
void migrateRoles().finally(async () => mongoose_1.default.disconnect()).catch((error) => {
    console.error(error instanceof Error ? error.message : "Role migration failed");
    process.exitCode = 1;
});
