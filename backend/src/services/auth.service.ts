import { randomBytes, randomUUID, createHmac } from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import type { HydratedDocument } from "mongoose";
import { getConfig } from "../config/env";
import { Organization } from "../models/Organization";
import { Invitation } from "../models/Invitation";
import { RefreshToken } from "../models/RefreshToken";
import { Team } from "../models/Team";
import { User, type UserRecord } from "../models/User";
import { conflict, unauthorized } from "../utils/errors";

const BCRYPT_ROUNDS = 12;

function hashRefreshToken(token: string): string {
  return createHmac("sha256", getConfig().JWT_REFRESH_SECRET).update(token).digest("hex");
}

function accessToken(user: { _id: Types.ObjectId; organizationId: Types.ObjectId; role: string }): string {
  return jwt.sign({ typ: "access", org: user.organizationId.toString(), role: user.role }, getConfig().JWT_ACCESS_SECRET, {
    subject: user._id.toString(),
    expiresIn: getConfig().ACCESS_TOKEN_TTL as jwt.SignOptions["expiresIn"],
    issuer: "pulse-api",
    audience: "pulse-client",
  });
}

async function createRefreshToken(userId: Types.ObjectId, familyId = randomUUID()): Promise<{ raw: string; familyId: string }> {
  const raw = randomBytes(48).toString("base64url");
  await RefreshToken.create({
    userId,
    tokenHash: hashRefreshToken(raw),
    familyId,
    expiresAt: new Date(Date.now() + getConfig().REFRESH_TOKEN_DAYS * 86_400_000),
  });
  return { raw, familyId };
}

function publicUser(user: HydratedDocument<UserRecord>) {
  const subscription = user.subscription!;
  const trialExpired = subscription.status === "trialing" && subscription.trialEndsAt <= new Date();
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    organizationId: user.organizationId.toString(),
    teamId: user.teamId?.toString() ?? null,
    role: user.role,
    subscription: {
      plan: subscription.plan,
      status: trialExpired ? "trial_expired" : subscription.status,
      trialEndsAt: subscription.trialEndsAt,
      currentPeriodEnd: subscription.currentPeriodEnd,
      trialDaysLeft: trialExpired ? 0 : subscription.status === "trialing"
        ? Math.max(0, Math.ceil((subscription.trialEndsAt.getTime() - Date.now()) / 86_400_000))
        : 0,
    },
    settings: user.settings,
  };
}

export async function signup(input: { name: string; email: string; password: string; organizationName?: string }) {
  if (await User.exists({ email: input.email.toLowerCase() })) throw conflict("An account with this email already exists", "EMAIL_IN_USE");
  const ownerId = new Types.ObjectId();
  const organization = await Organization.create({
    name: input.organizationName?.trim() || `${input.name.trim()}'s workspace`,
    ownerId,
  });
  const team = await Team.create({ organizationId: organization._id, name: "General" });
  let user;
  try {
    user = await User.create({
      _id: ownerId,
      organizationId: organization._id,
      teamId: team._id,
      name: input.name.trim(),
      email: input.email.toLowerCase(),
      passwordHash: await bcrypt.hash(input.password, BCRYPT_ROUNDS),
      role: "admin",
      subscription: { plan: "Team", status: "trialing", trialEndsAt: new Date(Date.now() + 7 * 86_400_000) },
    });
  } catch (error) {
    await Team.deleteOne({ _id: team._id });
    await Organization.deleteOne({ _id: organization._id });
    throw error;
  }
  const refresh = await createRefreshToken(user._id);
  return { user: publicUser(user), accessToken: accessToken(user), refreshToken: refresh.raw };
}

export async function signin(input: { email: string; password: string }) {
  const user = await User.findOne({ email: input.email.toLowerCase() }).select("+passwordHash");
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) throw unauthorized("Email or password is incorrect");
  if (user.subscription.status === "trialing" && user.subscription.trialEndsAt <= new Date()) {
    user.subscription.status = "trial_expired";
    await user.save();
  }
  const refresh = await createRefreshToken(user._id);
  return { user: publicUser(user), accessToken: accessToken(user), refreshToken: refresh.raw };
}

export async function acceptInvitation(input: { token: string; email: string; name: string; password: string }) {
  const tokenHash = hashRefreshToken(input.token);
  const now = new Date();
  const invitation = await Invitation.findOneAndUpdate(
    { tokenHash, email: input.email.toLowerCase(), acceptedAt: null, expiresAt: { $gt: now } },
    { $set: { acceptedAt: now } },
    { new: false },
  );
  if (!invitation) throw unauthorized("Invitation is invalid or expired");
  try {
    if (await User.exists({ email: input.email.toLowerCase() })) {
      throw conflict("An account with this email already exists", "EMAIL_IN_USE");
    }
    const organization = await Organization.findById(invitation.organizationId).select("ownerId");
    const owner = organization ? await User.findById(organization.ownerId) : null;
    if (!owner) throw unauthorized("Workspace owner account is unavailable");
    const user = await User.create({
      organizationId: invitation.organizationId,
      teamId: invitation.teamId,
      name: input.name.trim(),
      email: input.email.toLowerCase(),
      passwordHash: await bcrypt.hash(input.password, BCRYPT_ROUNDS),
      role: "employee",
      subscription: owner.subscription.toObject(),
    });
    const refresh = await createRefreshToken(user._id);
    return { user: publicUser(user), accessToken: accessToken(user), refreshToken: refresh.raw };
  } catch (error) {
    await Invitation.updateOne({ _id: invitation._id, acceptedAt: now }, { $set: { acceptedAt: null } });
    throw error;
  }
}

export async function rotateRefreshToken(raw: string) {
  if (!raw || raw.length < 40) throw unauthorized("Refresh token is invalid");
  const old = await RefreshToken.findOne({ tokenHash: hashRefreshToken(raw) }).select("+tokenHash");
  if (!old) throw unauthorized("Refresh token is invalid");
  if (old.revokedAt || old.expiresAt <= new Date()) {
    await RefreshToken.updateMany({ familyId: old.familyId, revokedAt: null }, { revokedAt: new Date() });
    throw unauthorized(old.revokedAt ? "Refresh token reuse detected" : "Refresh token has expired");
  }
  const replacement = await createRefreshToken(old.userId, old.familyId);
  const result = await RefreshToken.updateOne(
    { _id: old._id, revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
  if (!result.modifiedCount) {
    await RefreshToken.updateMany({ familyId: old.familyId, revokedAt: null }, { revokedAt: new Date() });
    await RefreshToken.deleteOne({ tokenHash: hashRefreshToken(replacement.raw) });
    throw unauthorized("Refresh token reuse detected");
  }
  const replacementDoc = await RefreshToken.findOne({ tokenHash: hashRefreshToken(replacement.raw) }).select("_id");
  old.replacedByTokenId = replacementDoc?._id ?? null;
  await old.save();
  const user = await User.findById(old.userId);
  if (!user) throw unauthorized();
  const expired = user.subscription.status === "trialing" && user.subscription.trialEndsAt <= new Date();
  if (expired) {
    user.subscription.status = "trial_expired";
    await user.save();
  }
  return { user: publicUser(user), accessToken: accessToken(user), refreshToken: replacement.raw };
}

export async function revokeRefreshToken(raw?: string): Promise<void> {
  if (!raw) return;
  const tokenHash = hashRefreshToken(raw);
  await RefreshToken.updateOne({ tokenHash, revokedAt: null }, { revokedAt: new Date() });
}

export async function revokeAllRefreshTokens(userId: Types.ObjectId): Promise<void> {
  const now = new Date();
  const active = await RefreshToken.find({ userId, revokedAt: null }).select("familyId");
  if (active.length) await RefreshToken.updateMany({ familyId: { $in: active.map((token) => token.familyId) }, revokedAt: null }, { revokedAt: now });
}

export async function getCurrentUser(userId: Types.ObjectId) {
  const user = await User.findById(userId);
  if (!user) throw unauthorized();
  if (user.subscription.status === "trialing" && user.subscription.trialEndsAt <= new Date()) {
    user.subscription.status = "trial_expired";
    await user.save();
  }
  return publicUser(user);
}
