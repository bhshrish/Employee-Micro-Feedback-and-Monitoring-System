import { Schema, model, models } from "mongoose";

const teamSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  archivedAt: { type: Date, default: null },
}, { timestamps: true });
teamSchema.index({ organizationId: 1, name: 1 }, { unique: true });

export const Team = models.Team || model("Team", teamSchema);
