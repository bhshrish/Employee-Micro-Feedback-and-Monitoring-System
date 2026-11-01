"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessedWebhook = void 0;
var mongoose_1 = require("mongoose");
var processedWebhookSchema = new mongoose_1.Schema({
    eventId: { type: String, required: true, unique: true },
    eventType: { type: String, required: true },
    status: { type: String, enum: ["processing", "processed"], default: "processing" },
    processedAt: { type: Date, default: null },
}, { versionKey: false, timestamps: true });
exports.ProcessedWebhook = mongoose_1.models.ProcessedWebhook || (0, mongoose_1.model)("ProcessedWebhook", processedWebhookSchema);
