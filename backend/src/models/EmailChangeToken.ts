import { Schema, model, models } from "mongoose";
const emailChangeTokenSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    tokenHash: { type: String, required: true, unique: true, select: false },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    usedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
}, { timestamps: true });
emailChangeTokenSchema.index({ userId: 1, usedAt: 1, revokedAt: 1 });
export const EmailChangeToken = models.EmailChangeToken || model("EmailChangeToken", emailChangeTokenSchema);