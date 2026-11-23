"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailChangeToken = void 0;
const mongoose_1 = require("mongoose");
const emailChangeTokenSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    tokenHash: { type: String, required: true, unique: true, select: false },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    usedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
}, { timestamps: true });
emailChangeTokenSchema.index({ userId: 1, usedAt: 1, revokedAt: 1 });
exports.EmailChangeToken = mongoose_1.models.EmailChangeToken || (0, mongoose_1.model)("EmailChangeToken", emailChangeTokenSchema);
