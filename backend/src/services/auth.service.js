"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.signin = signin;
exports.acceptInvitation = acceptInvitation;
exports.rotateRefreshToken = rotateRefreshToken;
exports.revokeRefreshToken = revokeRefreshToken;
exports.revokeAllRefreshTokens = revokeAllRefreshTokens;
exports.getCurrentUser = getCurrentUser;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
const node_crypto_1 = require("node:crypto");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = require("mongoose");
const env_1 = require("../config/env");
const Organization_1 = require("../models/Organization");
const Invitation_1 = require("../models/Invitation");
const RefreshToken_1 = require("../models/RefreshToken");
const PasswordResetToken_1 = require("../models/PasswordResetToken");
const Team_1 = require("../models/Team");
const User_1 = require("../models/User");
const email_1 = require("./email.service");
const errors_1 = require("../utils/errors");
const BCRYPT_ROUNDS = 12;
function hashRefreshToken(token) {
    return (0, node_crypto_1.createHmac)("sha256", (0, env_1.getConfig)().JWT_REFRESH_SECRET).update(token).digest("hex");
}
function accessToken(user) {
    return jsonwebtoken_1.default.sign({ typ: "access", org: user.organizationId.toString(), role: user.role }, (0, env_1.getConfig)().JWT_ACCESS_SECRET, {
        subject: user._id.toString(),
        expiresIn: (0, env_1.getConfig)().ACCESS_TOKEN_TTL,
        issuer: "calmwork-api",
        audience: "calmwork-client",
    });
}
async function createRefreshToken(userId, familyId = (0, node_crypto_1.randomUUID)()) {
    const raw = (0, node_crypto_1.randomBytes)(48).toString("base64url");
    await RefreshToken_1.RefreshToken.create({
        userId,
        tokenHash: hashRefreshToken(raw),
        familyId,
        expiresAt: new Date(Date.now() + (0, env_1.getConfig)().REFRESH_TOKEN_DAYS * 86_400_000),
    });
    return { raw, familyId };
}
function publicUser(user) {
    const subscription = user.subscription;
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
async function signup(input) {
    if (input.email === "admin@gmail.com")
        throw (0, errors_1.conflict)("This email is reserved for the platform administrator", "EMAIL_RESERVED");
    if (await User_1.User.exists({ email: input.email }))
        throw (0, errors_1.conflict)("An account with this email already exists", "EMAIL_IN_USE");
    const ownerId = new mongoose_1.Types.ObjectId();
    const organization = await Organization_1.Organization.create({
        name: input.organizationName?.trim() || `${input.name.trim()}'s workspace`,
        ownerId,
    });
    const team = await Team_1.Team.create({ organizationId: organization._id, name: "General" });
    let user;
    try {
        user = await User_1.User.create({
            _id: ownerId,
            organizationId: organization._id,
            teamId: team._id,
            name: input.name.trim(),
            email: input.email,
            passwordHash: await bcryptjs_1.default.hash(input.password, BCRYPT_ROUNDS),
            role: "admin",
            subscription: { plan: "Team", status: "trialing", trialEndsAt: new Date(Date.now() + 7 * 86_400_000) },
        });
    }
    catch (error) {
        await Team_1.Team.deleteOne({ _id: team._id });
        await Organization_1.Organization.deleteOne({ _id: organization._id });
        throw error;
    }
    return publicUser(user);
}
async function signin(input) {
    const user = await User_1.User.findOne({ email: input.email }).select("+passwordHash");
    if (!user || !user.isActive || !(await bcryptjs_1.default.compare(input.password, user.passwordHash)))
        throw (0, errors_1.unauthorized)("Email or password is incorrect");
    if (!await Organization_1.Organization.exists({ _id: user.organizationId, isActive: { $ne: false } }))
        throw (0, errors_1.unauthorized)("This business workspace is inactive");
    if (user.subscription.status === "trialing" && user.subscription.trialEndsAt <= new Date()) {
        user.subscription.status = "trial_expired";
        await user.save();
    }
    const refresh = await createRefreshToken(user._id);
    return { user: publicUser(user), accessToken: accessToken(user), refreshToken: refresh.raw };
}
async function acceptInvitation(input) {
    if (input.email === "admin@gmail.com")
        throw (0, errors_1.conflict)("This email is reserved for the platform administrator", "EMAIL_RESERVED");
    const tokenHash = hashRefreshToken(input.token);
    const now = new Date();
    const invitation = await Invitation_1.Invitation.findOneAndUpdate({ tokenHash, email: input.email, acceptedAt: null, expiresAt: { $gt: now } }, { $set: { acceptedAt: now } }, { new: false });
    if (!invitation)
        throw (0, errors_1.unauthorized)("Invitation is invalid or expired");
    try {
        if (await User_1.User.exists({ email: input.email })) {
            throw (0, errors_1.conflict)("An account with this email already exists", "EMAIL_IN_USE");
        }
        const organization = await Organization_1.Organization.findById(invitation.organizationId).select("ownerId isActive");
        if (!organization || organization.isActive === false)
            throw (0, errors_1.unauthorized)("This business workspace is inactive");
        const owner = await User_1.User.findById(organization.ownerId);
        if (!owner)
            throw (0, errors_1.unauthorized)("Workspace owner account is unavailable");
        const user = await User_1.User.create({
            organizationId: invitation.organizationId,
            teamId: invitation.teamId,
            name: input.name.trim(),
            email: input.email,
            passwordHash: await bcryptjs_1.default.hash(input.password, BCRYPT_ROUNDS),
            role: invitation.role === "manager" ? "manager" : "employee",
            subscription: owner.subscription.toObject(),
        });
        return publicUser(user);
    }
    catch (error) {
        await Invitation_1.Invitation.updateOne({ _id: invitation._id, acceptedAt: now }, { $set: { acceptedAt: null } });
        throw error;
    }
}
async function rotateRefreshToken(raw) {
    if (!raw || raw.length < 40)
        throw (0, errors_1.unauthorized)("Refresh token is invalid");
    const old = await RefreshToken_1.RefreshToken.findOne({ tokenHash: hashRefreshToken(raw) }).select("+tokenHash");
    if (!old)
        throw (0, errors_1.unauthorized)("Refresh token is invalid");
    if (old.revokedAt || old.expiresAt <= new Date()) {
        await RefreshToken_1.RefreshToken.updateMany({ familyId: old.familyId, revokedAt: null }, { revokedAt: new Date() });
        throw (0, errors_1.unauthorized)(old.revokedAt ? "Refresh token reuse detected" : "Refresh token has expired");
    }
    const user = await User_1.User.findById(old.userId);
    if (!user || !user.isActive || !await Organization_1.Organization.exists({ _id: user.organizationId, isActive: { $ne: false } })) {
        await RefreshToken_1.RefreshToken.updateMany({ familyId: old.familyId, revokedAt: null }, { revokedAt: new Date() });
        throw (0, errors_1.unauthorized)("This account is inactive");
    }
    const replacement = await createRefreshToken(old.userId, old.familyId);
    const result = await RefreshToken_1.RefreshToken.updateOne({ _id: old._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
    if (!result.modifiedCount) {
        await RefreshToken_1.RefreshToken.updateMany({ familyId: old.familyId, revokedAt: null }, { revokedAt: new Date() });
        await RefreshToken_1.RefreshToken.deleteOne({ tokenHash: hashRefreshToken(replacement.raw) });
        throw (0, errors_1.unauthorized)("Refresh token reuse detected");
    }
    const replacementDoc = await RefreshToken_1.RefreshToken.findOne({ tokenHash: hashRefreshToken(replacement.raw) }).select("_id");
    old.replacedByTokenId = replacementDoc?._id ?? null;
    await old.save();
    const expired = user.subscription.status === "trialing" && user.subscription.trialEndsAt <= new Date();
    if (expired) {
        user.subscription.status = "trial_expired";
        await user.save();
    }
    return { user: publicUser(user), accessToken: accessToken(user), refreshToken: replacement.raw };
}
async function revokeRefreshToken(raw) {
    if (!raw)
        return;
    const tokenHash = hashRefreshToken(raw);
    await RefreshToken_1.RefreshToken.updateOne({ tokenHash, revokedAt: null }, { revokedAt: new Date() });
}
async function revokeAllRefreshTokens(userId) {
    const now = new Date();
    const active = await RefreshToken_1.RefreshToken.find({ userId, revokedAt: null }).select("familyId");
    if (active.length)
        await RefreshToken_1.RefreshToken.updateMany({ familyId: { $in: active.map((token) => token.familyId) }, revokedAt: null }, { revokedAt: now });
}
async function getCurrentUser(userId) {
    const user = await User_1.User.findById(userId);
    if (!user)
        throw (0, errors_1.unauthorized)();
    if (user.subscription.status === "trialing" && user.subscription.trialEndsAt <= new Date()) {
        user.subscription.status = "trial_expired";
        await user.save();
    }
    return publicUser(user);
}
const RESET_TOKEN_LENGTH = 48;
function hashResetToken(token) {
    return (0, node_crypto_1.createHmac)("sha256", (0, env_1.getConfig)().JWT_REFRESH_SECRET).update(token).digest("hex");
}
async function createPasswordResetToken(userId) {
    const config = (0, env_1.getConfig)();
    const raw = (0, node_crypto_1.randomBytes)(RESET_TOKEN_LENGTH).toString("base64url");
    const tokenHash = hashResetToken(raw);
    const expiresAt = new Date(Date.now() + config.PASSWORD_RESET_TTL_MINUTES * 60 * 1000);
    await PasswordResetToken_1.PasswordResetToken.create({
        userId,
        tokenHash,
        expiresAt,
    });
    return raw;
}
async function forgotPassword(input) {
    const user = await User_1.User.findOne({ email: input.email.trim().toLowerCase() });
    if (user) {
        const raw = await createPasswordResetToken(user._id);
        await (0, email_1.sendPasswordResetEmail)({ to: user.email, token: raw });
    }
    // Always succeed without revealing whether the email exists.
    return { message: "If an account exists for this email, a password reset link has been sent." };
}
async function resetPassword(input) {
    const tokenHash = hashResetToken(input.token);
    const now = new Date();
    const record = await PasswordResetToken_1.PasswordResetToken.findOne({
        tokenHash,
        usedAt: null,
        revokedAt: null,
        expiresAt: { $gt: now },
    }).select("+tokenHash");
    if (!record)
        throw (0, errors_1.unauthorized)("Reset token is invalid or expired");
    const user = await User_1.User.findOne({ _id: record.userId, isActive: true }).select("+passwordHash");
    if (!user) {
        await PasswordResetToken_1.PasswordResetToken.updateOne({ _id: record._id }, { revokedAt: now });
        throw (0, errors_1.unauthorized)("Reset token is invalid or expired");
    }
    user.passwordHash = await bcryptjs_1.default.hash(input.password, BCRYPT_ROUNDS);
    await user.save();
    await PasswordResetToken_1.PasswordResetToken.updateOne({ _id: record._id }, { usedAt: now });
    await PasswordResetToken_1.PasswordResetToken.updateMany({ userId: record.userId, revokedAt: null }, { revokedAt: now });
    await RefreshToken_1.RefreshToken.updateMany({ userId: record.userId, revokedAt: null }, { revokedAt: now });
    return { message: "Your password has been reset. You can sign in with your new password." };
}

