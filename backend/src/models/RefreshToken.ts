import { Schema, model, models } from "mongoose";

const refreshTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  tokenHash: { type: String, required: true, unique: true, select: false },
  familyId: { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  revokedAt: { type: Date, default: null },
  replacedByTokenId: { type: Schema.Types.ObjectId, ref: "RefreshToken", default: null },
}, { timestamps: true });

refreshTokenSchema.index({ familyId: 1, revokedAt: 1 });
export const RefreshToken = models.RefreshToken || model("RefreshToken", refreshTokenSchema);
