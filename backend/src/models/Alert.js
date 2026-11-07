"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Alert = void 0;
const mongoose_1 = require("mongoose");
const alertSchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    teamId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    type: { type: String, enum: ["burnout_risk", "stress_trend", "low_mood", "participation_collapse", "low_morale_trend", "sudden_morale_drop"], required: true },
    key: { type: String, required: true },
    title: { type: String, required: true, maxlength: 180 },
    detail: { type: String, required: true, maxlength: 500 },
    severity: { type: String, enum: ["high", "medium", "low"], required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    metrics: { type: mongoose_1.Schema.Types.Mixed, required: true },
    status: { type: String, enum: ["open", "acknowledged", "resolved", "dismissed"], default: "open" },
    acknowledgedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });
alertSchema.index({ organizationId: 1, teamId: 1, type: 1 }, { unique: true, partialFilterExpression: { status: "open" } });
alertSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
exports.Alert = mongoose_1.models.Alert || (0, mongoose_1.model)("Alert", alertSchema);
