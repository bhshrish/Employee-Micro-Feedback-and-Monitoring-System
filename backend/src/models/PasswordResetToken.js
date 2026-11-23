"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetToken = void 0;
const mongoose_1 = require("mongoose");
const passwordResetTokenSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", default: undefined, index: true },
    adminEmail: { type: String, lowercase: true, trim: true, default: undefined, index: true },
    tokenHash: { type: String, required: true, unique: true, select: false },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    usedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
}, { timestamps: true });
passwordResetTokenSchema.index({ userId: 1, usedAt: 1, revokedAt: 1 });
passwordResetTokenSchema.index({ adminEmail: 1, usedAt: 1, revokedAt: 1 });
passwordResetTokenSchema.pre("validate", function validateTarget(next) {
    if (Boolean(this.userId) === Boolean(this.adminEmail)) {
        next(new Error("Password reset token must target exactly one user or administrator"));
        return;
    }
    next();
});
exports.PasswordResetToken = mongoose_1.models.PasswordResetToken || (0, mongoose_1.model)("PasswordResetToken", passwordResetTokenSchema);
