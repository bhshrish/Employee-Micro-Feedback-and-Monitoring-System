import { Schema, model, models } from "mongoose";

const reportPaymentSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    orderId: { type: String, required: true, unique: true },
    paymentId: { type: String, default: null, index: true },
    amount: { type: Number, required: true, default: 9900 },
    currency: { type: String, required: true, default: "INR" },
    period: { type: String, required: true },
    metrics: { type: [String], required: true },
    format: { type: String, enum: ["csv", "pdf"], required: true },
    status: { type: String, enum: ["pending", "paid"], default: "pending", index: true },
    usedAt: { type: Date, default: null },
}, { timestamps: true });

reportPaymentSchema.index({ userId: 1, status: 1, usedAt: 1 });
export const ReportPayment = models.ReportPayment || model("ReportPayment", reportPaymentSchema);