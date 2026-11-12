"use strict";
const { createHmac, randomInt, timingSafeEqual, randomBytes } = require("node:crypto");
const bcrypt = require("bcryptjs");
const { getConfig } = require("../config/env");
const { OtpChallenge } = require("../models/OtpChallenge");
const { User } = require("../models/User");
const { Invitation } = require("../models/Invitation");
const { Team } = require("../models/Team");
const { Organization } = require("../models/Organization");
const { sendOtpEmail } = require("./email.service");
const { sendSms } = require("./sms.service");
const auth = require("./auth.service");
const { AppError, unauthorized, conflict, notFound } = require("../utils/errors");

const OTP_TTL_MS = 5 * 60_000;
const RESEND_COOLDOWN_MS = 60_000;
const MAX_ATTEMPTS = 5;

function normalizeDestination(input) {
    const channel = input.channel || "email";
    if (channel === "email")
        return { channel, destination: input.email.trim().toLowerCase() };
    const destination = input.phone.trim();
    if (!/^\+[1-9]\d{7,14}$/.test(destination))
        throw new AppError(400, "Enter a phone number in international E.164 format.", "INVALID_PHONE");
    return { channel, destination };
}

function emailPattern(email) {
    return new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
}

function hashCode(destination, purpose, code, channel = "email") {
    return createHmac("sha256", getConfig().JWT_REFRESH_SECRET)
        .update(`${channel}:${purpose}:${destination}:${code}`)
        .digest("hex");
}

function matchesCode(expected, actual) {
    const left = Buffer.from(expected, "hex");
    const right = Buffer.from(actual, "hex");
    return left.length === right.length && timingSafeEqual(left, right);
}

function invitationTokenHash(token) {
    return createHmac("sha256", getConfig().JWT_REFRESH_SECRET).update(token).digest("hex");
}

async function ensurePurposeAllowed(destination, purpose, payload, channel) {
    if (purpose === "signin") {
        const filter = channel === "sms" ? { phone: destination } : { email: emailPattern(destination) };
        return Boolean(await User.findOne({ ...filter, isActive: true }).select("_id"));
    }
    if (purpose === "business_signup") {
        if (channel !== "email")
            throw new AppError(400, "Business registration requires an email address.", "EMAIL_REQUIRED");
        if (destination === getConfig().OPS_ADMIN_EMAIL.toLowerCase())
            throw conflict("This email is reserved for the platform administrator", "EMAIL_RESERVED");
        if (await User.exists({ email: emailPattern(destination) }))
            throw conflict("An account with this email already exists", "EMAIL_IN_USE");
        return true;
    }
    if (purpose === "invitation") {
        if (channel !== "email")
            throw new AppError(400, "Invitation verification requires the invited email address.", "EMAIL_REQUIRED");
        const invite = await Invitation.findOne({
            tokenHash: invitationTokenHash(payload.invitationToken),
            email: emailPattern(destination),
            acceptedAt: null,
            expiresAt: { $gt: new Date() },
        }).select("email");
        if (!invite)
            throw unauthorized("Invitation is invalid or expired");
        return { email: invite.email };
    }
    return purpose === "admin" &&
        channel === "email" &&
        destination === getConfig().OPS_ADMIN_EMAIL.toLowerCase();
}

async function requestOtp(input) {
    const { channel, destination } = normalizeDestination(input);
    const purpose = input.purpose;
    const filter = { channel, destination, purpose };
    const prior = await OtpChallenge.findOne(filter).select("resendAfter");
    const now = new Date();
    if (prior && prior.resendAfter > now)
        throw new AppError(429, "Please wait before requesting another code.", "OTP_COOLDOWN");

    const allowed = await ensurePurposeAllowed(destination, purpose, input, channel);
    if (!allowed) {
        return { message: "If the account can sign in, a verification code has been sent.", expiresInSeconds: 300, resendAfterSeconds: 60 };
    }

    const code = String(randomInt(100000, 1000000));
    const challenge = {
        ...filter,
        codeHash: hashCode(destination, purpose, code, channel),
        payload: purpose === "business_signup"
            ? { name: input.name.trim(), organizationName: input.organizationName.trim() }
            : purpose === "invitation"
                ? { invitationToken: input.invitationToken.trim(), invitationEmail: allowed.email }
                : {},
        attempts: 0,
        resendAfter: new Date(now.getTime() + RESEND_COOLDOWN_MS),
        expiresAt: new Date(now.getTime() + OTP_TTL_MS),
        consumedAt: null,
    };
    const savedChallenge = await OtpChallenge.findOneAndUpdate(filter, { $set: challenge }, { upsert: true, new: true, runValidators: true });
    try {
        if (channel === "email")
            await sendOtpEmail({ to: destination, code, expiresInMinutes: 5 });
        else
            await sendSms({ to: destination, message: `Your CalmWork verification code is ${code}. It expires in 5 minutes.` });
    }
    catch (error) {
        await OtpChallenge.deleteOne({ _id: savedChallenge._id });
        throw error;
    }
    return { message: "If the account can sign in, a verification code has been sent.", expiresInSeconds: 300, resendAfterSeconds: 60 };
}

async function verifyOtp(input) {
    const { channel, destination } = normalizeDestination(input);
    const purpose = input.purpose;
    const now = new Date();
    const challenge = await OtpChallenge.findOneAndUpdate({
        channel,
        destination,
        purpose,
        consumedAt: null,
        expiresAt: { $gt: now },
        attempts: { $lt: MAX_ATTEMPTS },
    }, { $inc: { attempts: 1 } }, { new: true }).select("+codeHash");
    if (!challenge)
        throw unauthorized("The code is invalid, expired, or has reached its attempt limit.");

    const candidateHash = hashCode(destination, purpose, input.code, channel);
    if (!matchesCode(challenge.codeHash, candidateHash))
        throw unauthorized("The code is incorrect.");
    const consumed = await OtpChallenge.updateOne({
        _id: challenge._id,
        consumedAt: null,
        attempts: challenge.attempts,
    }, { $set: { consumedAt: now } });
    if (consumed.modifiedCount !== 1)
        throw unauthorized("This code has already been used.");

    if (purpose === "admin") {
        if (channel !== "email" || destination !== getConfig().OPS_ADMIN_EMAIL.toLowerCase())
            throw unauthorized();
        return { admin: true };
    }

    if (purpose === "business_signup") {
        const password = randomBytes(48).toString("base64url");
        if (await User.exists({ email: emailPattern(destination) }))
            throw conflict("An account with this email already exists", "EMAIL_IN_USE");
        const ownerId = new (require("mongoose").Types.ObjectId)();
        const organization = await Organization.create({
            name: challenge.payload.organizationName,
            ownerId,
        });
        const team = await Team.create({ organizationId: organization._id, name: "General" });
        let user;
        try {
            user = await User.create({
                _id: ownerId,
                organizationId: organization._id,
                teamId: team._id,
                name: challenge.payload.name,
                email: destination,
                passwordHash: await bcrypt.hash(password, 12),
                role: "admin",
                subscription: { plan: "Team", status: "trialing", trialEndsAt: new Date(Date.now() + 7 * 86_400_000) },
            });
        }
        catch (error) {
            await Team.deleteOne({ _id: team._id });
            await Organization.deleteOne({ _id: organization._id });
            throw error;
        }
        return auth.createSessionForUser(user);
    }

    if (purpose === "invitation") {
        await auth.acceptInvitation({
            token: challenge.payload.invitationToken,
            email: challenge.payload.invitationEmail,
            name: input.name.trim(),
            password: randomBytes(48).toString("base64url"),
        });
    }

    const userFilter = channel === "sms" ? { phone: destination } : { email: emailPattern(destination) };
    const user = await User.findOne({ ...userFilter, isActive: true });
    if (!user || !await Organization.exists({ _id: user.organizationId, isActive: { $ne: false } }))
        throw notFound("Account is unavailable");
    return auth.createSessionForUser(user);
}

async function requestAdminOtp(email) {
    const destination = email.trim().toLowerCase();
    const configured = getConfig().OPS_ADMIN_EMAIL.toLowerCase();
    if (destination !== configured)
        return { message: "If the administrator address is configured, a verification code has been sent.", expiresInSeconds: 300, resendAfterSeconds: 60 };
    return requestOtp({ email: destination, channel: "email", purpose: "admin" });
}

module.exports = { requestOtp, verifyOtp, requestAdminOtp, hashCode };
