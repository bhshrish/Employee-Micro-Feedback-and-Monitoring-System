import { Schema, model, models } from "mongoose";

const processedWebhookSchema = new Schema({
  eventId: { type: String, required: true, unique: true },
  eventType: { type: String, required: true },
  status: { type: String, enum: ["processing", "processed"], default: "processing" },
  processedAt: { type: Date, default: null },
}, { versionKey: false, timestamps: true });

export const ProcessedWebhook = models.ProcessedWebhook || model("ProcessedWebhook", processedWebhookSchema);
