"use strict";
const { Schema, model, models } = require("mongoose");

const otpChallengeSchema = new Schema({
    destination: { type: String, required: true, lowercase: true, trim: true },
    channel: { type: String, enum: ["email", "sms"], default: "email", required: true },
    purpose: { type: String, required: true, enum: ["signin", "business_signup", "invitation", "admin"] },
    codeHash: { type: String, required: true, select: false },
    payload: { type: Schema.Types.Mixed, default: {} },
    attempts: { type: Number, min: 0, default: 0 },
    resendAfter: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    consumedAt: { type: Date, default: null },
}, { timestamps: true });

otpChallengeSchema.index({ channel: 1, destination: 1, purpose: 1 }, { unique: true });
otpChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

exports.OtpChallenge = models.OtpChallenge || model("OtpChallenge", otpChallengeSchema);
