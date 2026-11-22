import { Schema, model, models } from "mongoose";
const pulseReceiptSchema = new Schema({
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    weekStart: { type: Date, required: true },
    burnoutMetrics: {
        score: { type: Number, min: 0, max: 100 },
        severity: { type: String, enum: ["low", "medium", "high"] },
        components: { type: Schema.Types.Mixed },
    },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
}, { timestamps: true });
pulseReceiptSchema.index({ userId: 1, weekStart: 1 }, { unique: true });
export const PulseReceipt = models.PulseReceipt || model("PulseReceipt", pulseReceiptSchema);