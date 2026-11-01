import { Schema, model, models } from "mongoose";

const generatedReportSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  teamId: { type: Schema.Types.ObjectId, ref: "Team", default: null, index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  period: { type: String, required: true },
  metrics: { type: [String], required: true },
  format: { type: String, enum: ["csv", "pdf"], required: true },
  contentType: { type: String, required: true },
  filename: { type: String, required: true },
  content: { type: Buffer, required: true, select: false },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
}, { timestamps: true });

generatedReportSchema.index({ organizationId:  1, createdBy: 1, createdAt: -1 });
export const GeneratedReport = models.GeneratedReport || model("GeneratedReport", generatedReportSchema);
