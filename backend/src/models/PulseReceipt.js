"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PulseReceipt = void 0;
const mongoose_1 = require("mongoose");
const pulseReceiptSchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Organization", required: true },
    teamId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Team", required: true },
    submissionTokenHash: { type: String, required: true, select: false },
    weekStart: { type: Date, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
}, { timestamps: true });
pulseReceiptSchema.index({ submissionTokenHash: 1, weekStart: 1 }, { unique: true });
exports.PulseReceipt = mongoose_1.models.PulseReceipt || (0, mongoose_1.model)("PulseReceipt", pulseReceiptSchema);
