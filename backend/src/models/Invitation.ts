import { Schema, model, models } from "mongoose";

const invitationSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
  inviterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  tokenHash: { type: String, required: true, unique: true, select: false },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  acceptedAt: { type: Date, default: null },
}, { timestamps: true });

invitationSchema.index({ organizationId: 1, email: 1, acceptedAt: 1 });
export const Invitation = models.Invitation || model("Invitation", invitationSchema);
