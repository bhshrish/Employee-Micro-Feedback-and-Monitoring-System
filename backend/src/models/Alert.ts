import { Schema, model, models } from "mongoose";

const alertSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
  type: { type: String, enum: ["burnout_risk", "stress_trend", "low_mood", "participation_collapse"], required: true },
  key: { type: String, required: true },
  title: { type: String, required: true, maxlength: 180 },
  detail: { type: String, required: true, maxlength: 500 },
  severity: { type: String, enum: ["high", "medium", "low"], required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  metrics: { type: Schema.Types.Mixed, required: true },
  status: { type: String, enum: ["open", "acknowledged", "dismissed"], default: "open" },
  acknowledgedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });
alertSchema.index(
  { organizationId: 1, teamId: 1, type: 1 },
  { unique: true, partialFilterExpression: { status: "open" } },
);
alertSchema.index({ organizationId: 1, status: 1, createdAt: -1 });

export const Alert = models.Alert || model("Alert", alertSchema);
