"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./config/env");
const Organization_1 = require("./models/Organization");
const Team_1 = require("./models/Team");
const User_1 = require("./models/User");
async function seed() {
    const email = process.env.SEED_EMAIL?.trim();
    const password = process.env.SEED_PASSWORD;
    const name = process.env.SEED_NAME?.trim();
    if (!email || !password || !name)
        throw new Error("Set SEED_EMAIL, SEED_PASSWORD, and SEED_NAME to seed an owner account");
    if (password.length < 12)
        throw new Error("SEED_PASSWORD must contain at least 12 characters");
    await mongoose_1.default.connect((0, env_1.getConfig)().MONGODB_URI);
    if (await User_1.User.exists({ email })) {
        console.info("Seed account already exists; no changes made");
        return;
    }
    const ownerId = new mongoose_1.default.Types.ObjectId();
    const organization = await Organization_1.Organization.create({
        name: process.env.SEED_ORGANIZATION?.trim() || `${name}'s workspace`,
        ownerId,
    });
    const teamNames = (process.env.SEED_TEAMS || "General").split(",").map((item) => item.trim()).filter(Boolean);
    if (!teamNames.length)
        teamNames.push("General");
    const teams = await Team_1.Team.insertMany(teamNames.map((teamName) => ({ organizationId: organization._id, name: teamName })));
    await User_1.User.create({
        _id: ownerId,
        organizationId: organization._id,
        teamId: teams[0]._id,
        name,
        email,
        passwordHash: await bcryptjs_1.default.hash(password, 12),
        role: "admin",
        subscription: { plan: "Team", status: "trialing", trialEndsAt: new Date(Date.now() + 7 * 86_400_000) },
    });
    console.info("Seed owner account created");
}
void seed().finally(async () => mongoose_1.default.disconnect()).catch((error) => {
    console.error(error instanceof Error ? error.message : "Seed failed");
    process.exitCode = 1;
});
