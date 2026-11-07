"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertRule = void 0;
const mongoose_1 = require("mongoose");
const alertRuleSchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Organization", required: true, unique: true },
    moraleBelow: { type: Number, min: 1, max: 5, default: 2.5 },
    consecutiveWeeks: { type: Number, min: 1, max: 12, default: 2 },
    suddenDropPercent: { type: Number, min: 1, max: 100, default: 20 },
    emailEnabled: { type: Boolean, default: true },
    inAppEnabled: { type: Boolean, default: true },
}, { timestamps: true });
exports.AlertRule = mongoose_1.models.AlertRule || (0, mongoose_1.model)("AlertRule", alertRuleSchema);
