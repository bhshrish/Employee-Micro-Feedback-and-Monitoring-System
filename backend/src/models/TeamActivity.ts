import { Schema, model, models } from "mongoose";

const teamActivitySchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  teamId: { type: Schema.Types.ObjectId, ref: "Team", default: null, index: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  openSessionUserId: { type: Schema.Types.ObjectId, ref: "User", default: undefined },
  task: { type: String, required: true, maxlength: 120 },
  category: { type: String, enum: ["Productive", "Neutral", "Distracting"], required: true },
  startedAt: { type: Date, required: true },
  endedAt: { type: Date, default: null },
  activeSeconds: { type: Number, default: 0, min: 0 },
  idleSeconds: { type: Number, default: 0, min: 0 },
  idleStartedAt: { type: Date, default: null },
  heartbeatAt: { type: Date, default: null },
  pausedSeconds: { type: Number, default: 0, min: 0 },
  pausedAt: { type: Date, default: null },
  tags: { type: [String], default: [] },
  status: { type: String, enum: ["running", "paused", "stopped"], default: "running" },
}, { timestamps: true });

teamActivitySchema.index({ userId: 1, startedAt: -1 });
teamActivitySchema.index({ organizationId: 1, startedAt: -1 });
teamActivitySchema.index(
  { openSessionUserId: 1 },
  { unique: true, partialFilterExpression: { openSessionUserId: { $type: "objectId" } } },
);
export const TeamActivity = models.TeamActivity || model("TeamActivity", teamActivitySchema);
