import { Schema, model, models } from "mongoose";
const passwordResetTokenSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", default: undefined, index: true },
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
export const PasswordResetToken = models.PasswordResetToken || model("PasswordResetToken", passwordResetTokenSchema);