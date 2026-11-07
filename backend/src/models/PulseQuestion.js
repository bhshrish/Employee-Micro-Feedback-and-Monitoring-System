"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PulseQuestion = void 0;
const mongoose_1 = require("mongoose");
const pulseQuestionSchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    prompt: { type: String, required: true, trim: true, minlength: 3, maxlength: 240 },
    type: { type: String, enum: ["scale", "yes_no", "short_text"], required: true },
    required: { type: Boolean, default: true },
    active: { type: Boolean, default: true, index: true },
    frequency: { type: String, enum: ["weekly", "monthly"], default: "weekly" },
    scheduleDay: { type: Number, min: 0, max: 6, default: 1 },
    order: { type: Number, default: 0 },
}, { timestamps: true });
pulseQuestionSchema.index({ organizationId: 1, order: 1 });
exports.PulseQuestion = mongoose_1.models.PulseQuestion || (0, mongoose_1.model)("PulseQuestion", pulseQuestionSchema);
