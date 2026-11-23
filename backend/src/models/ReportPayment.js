"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportPayment = void 0;
const mongoose_1 = require("mongoose");
const reportPaymentSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
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
exports.ReportPayment = mongoose_1.models.ReportPayment || (0, mongoose_1.model)("ReportPayment", reportPaymentSchema);
