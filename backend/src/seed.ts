import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { getConfig } from "./config/env";
import { Organization } from "./models/Organization";
import { Team } from "./models/Team";
import { User } from "./models/User";

async function seed() {
  const email = process.env.SEED_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_PASSWORD;
  const name = process.env.SEED_NAME?.trim();
  if (!email || !password || !name) throw new Error("Set SEED_EMAIL, SEED_PASSWORD, and SEED_NAME to seed an owner account");
  if (password.length < 12) throw new Error("SEED_PASSWORD must contain at least 12 characters");
  await mongoose.connect(getConfig().MONGODB_URI);
  if (await User.exists({ email })) {
    console.info("Seed account already exists; no changes made");
    return;
  }
  const ownerId = new mongoose.Types.ObjectId();
  const organization = await Organization.create({
    name: process.env.SEED_ORGANIZATION?.trim() || `${name}'s workspace`,
    ownerId,
  });
  const teamNames = (process.env.SEED_TEAMS || "General").split(",").map((item) => item.trim()).filter(Boolean);
  if (!teamNames.length) teamNames.push("General");
  const teams = await Team.insertMany(teamNames.map((teamName) => ({ organizationId: organization._id, name: teamName })));
  await User.create({
    _id: ownerId,
    organizationId: organization._id,
    teamId: teams[0]._id,
    name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: "admin",
    subscription: { plan: "Team", status: "trialing", trialEndsAt: new Date(Date.now() + 7 * 86_400_000) },
  });
  console.info("Seed owner account created");
}

void seed().finally(async () => mongoose.disconnect()).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Seed failed");
  process.exitCode = 1;
});
