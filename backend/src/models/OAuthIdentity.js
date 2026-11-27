"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthIdentity = void 0;
const mongoose_1 = require("mongoose");
const oauthIdentitySchema = new mongoose_1.Schema({
    provider: { type: String, enum: ["google", "apple"], required: true },
    subject: { type: String, required: true, maxlength: 255 },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    email: { type: String, required: true, trim: true, lowercase: true },
}, { timestamps: true });
oauthIdentitySchema.index({ provider: 1, subject: 1 }, { unique: true });
exports.OAuthIdentity = mongoose_1.models.OAuthIdentity || (0, mongoose_1.model)("OAuthIdentity", oauthIdentitySchema);
