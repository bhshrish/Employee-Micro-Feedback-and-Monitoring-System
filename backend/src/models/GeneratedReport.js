"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneratedReport = void 0;
const mongoose_1 = require("mongoose");
const generatedReportSchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    teamId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Team", default: null, index: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    period: { type: String, required: true },
    metrics: { type: [String], required: true },
    format: { type: String, enum: ["csv", "pdf"], required: true },
    contentType: { type: String, required: true },
    filename: { type: String, required: true },
    content: { type: Buffer, required: true, select: false },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
}, { timestamps: true });
generatedReportSchema.index({ organizationId: 1, createdBy: 1, createdAt: -1 });
exports.GeneratedReport = mongoose_1.models.GeneratedReport || (0, mongoose_1.model)("GeneratedReport", generatedReportSchema);
