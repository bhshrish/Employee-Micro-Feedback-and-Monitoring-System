"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetToken = void 0;
const mongoose_1 = require("mongoose");
const passwordResetTokenSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, select: false },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    usedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
}, { timestamps: true });
passwordResetTokenSchema.index({ userId: 1, usedAt: 1, revokedAt: 1 });
exports.PasswordResetToken = mongoose_1.models.PasswordResetToken || (0, mongoose_1.model)("PasswordResetToken", passwordResetTokenSchema);
