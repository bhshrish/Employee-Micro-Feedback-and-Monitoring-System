import { randomUUID } from "node:crypto";
import { Schema, model, models } from "mongoose";

const pulseResponseSchema = new Schema({
  _id: { type: String, default: () => randomUUID() },
  organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
  weekStart: { type: Date, required: true, index: true },
  mood: { type: Number, required: true, min: 1, max: 5 },
  stress: { type: Number, required: true, min: 1, max: 5 },
  workload: { type: Number, required: true, min: 1, max: 5 },
}, { versionKey: false, timestamps: false });

pulseResponseSchema.index({ organizationId: 1, teamId: 1, weekStart: 1 });
export const PulseResponse = models.PulseResponse || model("PulseResponse", pulseResponseSchema);
