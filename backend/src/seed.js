"use strict";
require("dotenv/config");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { randomUUID } = require("node:crypto");
const { getConfig } = require("./config/env");
const { Organization } = require("./models/Organization");
const { Team } = require("./models/Team");
const { User } = require("./models/User");
const { PulseResponse } = require("./models/PulseResponse");
const { PulseQuestion } = require("./models/PulseQuestion");
const { AlertRule } = require("./models/AlertRule");
const { weekStart } = require("./utils/week");

async function seedDemoUsers(organization, teams, passwordHash) {
    const groups = [
        { role: "manager", count: 2 },
        { role: "employee", count: 10 },
    ];
    let managerIndex = 0;
    for (const group of groups) {
        for (let index = 1; index <= group.count; index += 1) {
            const email = `seed+${group.role}${String(index).padStart(2, "0")}-${organization._id}@example.test`;
            const team = group.role === "manager"
                ? teams[managerIndex++ % teams.length]
                : teams[(index - 1) % teams.length];
            await User.updateOne({ email }, {
                $setOnInsert: {
                    organizationId: organization._id,
                    teamId: team._id,
                    name: `${group.role === "manager" ? "Manager" : "Employee"} ${String(index).padStart(2, "0")}`,
                    email,
                    passwordHash,
                    role: group.role,
                    subscription: {
                        plan: "Team",
                        status: "trialing",
                        trialEndsAt: organization.trialEndsAt,
                    },
                },
            }, { upsert: true });
        }
    }
}

async function seedPulseData(organization, teams) {
    const thisWeek = weekStart();
    for (const team of teams) {
        for (let offset = 0; offset < 12; offset += 1) {
            const currentWeek = new Date(thisWeek.getTime() - offset * 7 * 86_400_000);
            if (await PulseResponse.exists({ organizationId: organization._id, teamId: team._id, weekStart: currentWeek }))
                continue;
            const responses = Array.from({ length: 5 }, (_, index) => {
                const morale = Math.max(1, Math.min(5, 3.2 + (11 - offset) * 0.06 + (index % 3) * 0.25));
                return {
                    _id: randomUUID(),
                    organizationId: organization._id,
                    teamId: team._id,
                    weekStart: currentWeek,
                    mood: Math.round(morale),
                    stress: Math.max(1, Math.min(5, 4 - Math.floor(morale / 2))),
                    workload: Math.max(1, Math.min(5, 3 + (index % 2))),
                };
            });
            await PulseResponse.insertMany(responses);
        }
    }
}

async function seed() {
    const email = process.env.SEED_EMAIL?.trim();
    const password = process.env.SEED_PASSWORD;
    const name = process.env.SEED_NAME?.trim();
    if (!email || !password || !name)
        throw new Error("Set SEED_EMAIL, SEED_PASSWORD, and SEED_NAME to seed a demo organization");
    if (password.length < 12 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password))
        throw new Error("SEED_PASSWORD must be at least 12 characters and include uppercase, lowercase, and number characters");
    await mongoose.connect(getConfig().MONGODB_URI);

    let admin = await User.findOne({ email });
    let organization = admin ? await Organization.findById(admin.organizationId) : null;
    if (!organization) {
        const ownerId = new mongoose.Types.ObjectId();
        const trialEndsAt = new Date(Date.now() + 7 * 86_400_000);
        organization = await Organization.create({
            name: process.env.SEED_ORGANIZATION?.trim() || `${name}'s workspace`,
            ownerId,
            trialEndsAt,
        });
        admin = await User.create({
            _id: ownerId,
            organizationId: organization._id,
            name,
            email,
            passwordHash: await bcrypt.hash(password, 12),
            role: "admin",
            subscription: { plan: "Team", status: "trialing", trialEndsAt },
        });
        console.info("Seed admin account created");
    }
    else if (admin.role !== "admin") {
        throw new Error("SEED_EMAIL already belongs to a non-admin account");
    }

    const names = (process.env.SEED_TEAMS || "Product,People,Operations").split(",").map((item) => item.trim()).filter(Boolean);
    if (names.length !== 3)
        throw new Error("SEED_TEAMS must contain exactly three comma-separated team names");
    const teams = [];
    for (const teamName of names) {
        let team = await Team.findOne({ organizationId: organization._id, name: teamName });
        if (!team)
            team = await Team.create({ organizationId: organization._id, name: teamName });
        teams.push(team);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await seedDemoUsers(organization, teams, passwordHash);
    await Promise.all([
        PulseQuestion.updateOne(
            { organizationId: organization._id, prompt: "How is your mood this week?" },
            { $setOnInsert: { type: "scale", required: true, active: true, frequency: "weekly", scheduleDay: 1, order: 0 } },
            { upsert: true },
        ),
        PulseQuestion.updateOne(
            { organizationId: organization._id, prompt: "How manageable was your workload?" },
            { $setOnInsert: { type: "scale", required: true, active: true, frequency: "weekly", scheduleDay: 1, order: 1 } },
            { upsert: true },
        ),
        PulseQuestion.updateOne(
            { organizationId: organization._id, prompt: "Would you like support from your manager?" },
            { $setOnInsert: { type: "yes_no", required: false, active: true, frequency: "weekly", scheduleDay: 1, order: 2 } },
            { upsert: true },
        ),
        AlertRule.updateOne({ organizationId: organization._id }, { $setOnInsert: { organizationId: organization._id } }, { upsert: true }),
    ]);
    await seedPulseData(organization, teams);
    console.info("Seed demo organization ready: 1 admin, 2 managers, 10 employees, 3 teams, and 12 weeks of anonymous pulse data");
}

void seed().finally(async () => mongoose.disconnect()).catch((error) => {
    console.error(error instanceof Error ? error.message : "Seed failed");
    process.exitCode = 1;
});
