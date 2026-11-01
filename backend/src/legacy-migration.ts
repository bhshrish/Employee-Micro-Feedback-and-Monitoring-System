import mongoose, { Types } from "mongoose";
import { Organization } from "./models/Organization";
import { Team } from "./models/Team";
import { User } from "./models/User";

const plans = new Set(["Starter", "Team", "Business"]);
const subscriptionStatuses = new Set(["trialing", "trial_expired", "active", "canceled"]);

function asObjectId(value: unknown): Types.ObjectId | null {
  return value instanceof Types.ObjectId ? value : null;
}

function asDate(value: unknown): Date | null {
  const date = value instanceof Date ? value : typeof value === "string" ? new Date(value) : null;
  return date && Number.isFinite(date.getTime()) ? date : null;
}

export async function migrateLegacyData() {
  const organizations = await Organization.collection.find({}).toArray();
  const organizationById = new Map(organizations.map((organization) => [String(organization._id), organization]));
  const legacyUsers = await User.collection.find({
    organizationId: { $exists: false },
    orgId: { $exists: true },
  }).toArray();
  const legacyTeams = await Team.collection.find({
    organizationId: { $exists: false },
    orgId: { $exists: true },
  }).toArray();
  const subscriptions = mongoose.connection.collection("subscriptions");

  const userMigrations = [];
  for (const user of legacyUsers) {
    const orgId = asObjectId(user.orgId);
    const organization = orgId ? organizationById.get(orgId.toString()) : undefined;
    if (!orgId || !organization) {
      throw new Error(`Cannot migrate user ${String(user._id)}: legacy organization is missing`);
    }

    const legacySubscription = await subscriptions.findOne({ orgId });
    const status = legacySubscription?.status;
    const trialEndsAt = asDate(legacySubscription?.trialEndsAt);
    const plan = organization.plan ?? "Team";
    if (typeof status !== "string" || !subscriptionStatuses.has(status) || !trialEndsAt || typeof plan !== "string" || !plans.has(plan)) {
      throw new Error(`Cannot migrate user ${String(user._id)}: legacy subscription is invalid`);
    }

    const oldSettings = user.settings && typeof user.settings === "object" ? user.settings : {};
    const oldNotifications = "notifications" in oldSettings && oldSettings.notifications && typeof oldSettings.notifications === "object"
      ? oldSettings.notifications
      : {};
    const idleThresholdMinutes = "idleThresholdMinutes" in oldSettings && typeof oldSettings.idleThresholdMinutes === "number"
      ? oldSettings.idleThresholdMinutes
      : "idleThresholdMin" in oldSettings && typeof oldSettings.idleThresholdMin === "number"
        ? oldSettings.idleThresholdMin
        : 5;

    userMigrations.push({
      userId: user._id,
      orgId,
      subscription: { plan, status, trialEndsAt },
      idleThresholdMinutes,
      notifications: {
        weeklyPulse: "weeklyPulse" in oldNotifications && typeof oldNotifications.weeklyPulse === "boolean" ? oldNotifications.weeklyPulse : true,
        idlePrompt: "idlePrompt" in oldNotifications && typeof oldNotifications.idlePrompt === "boolean" ? oldNotifications.idlePrompt : true,
        productUpdates: "productUpdates" in oldNotifications && typeof oldNotifications.productUpdates === "boolean" ? oldNotifications.productUpdates : false,
      },
    });
  }

  for (const team of legacyTeams) {
    const orgId = asObjectId(team.orgId);
    if (!orgId || !organizationById.has(orgId.toString())) {
      throw new Error(`Cannot migrate team ${String(team._id)}: legacy organization is missing`);
    }
  }

  for (const team of legacyTeams) {
    await Team.collection.updateOne(
      { _id: team._id, organizationId: { $exists: false } },
      { $set: { organizationId: team.orgId } },
    );
  }

  for (const user of userMigrations) {
    await User.collection.updateOne(
      { _id: user.userId, organizationId: { $exists: false } },
      {
        $set: {
          organizationId: user.orgId,
          subscription: user.subscription,
          "settings.idleThresholdMinutes": user.idleThresholdMinutes,
          "settings.notifications": user.notifications,
        },
      },
    );
  }

  return { users: userMigrations.length, teams: legacyTeams.length };
}
