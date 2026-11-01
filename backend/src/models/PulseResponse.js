"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PulseResponse = void 0;
var node_crypto_1 = require("node:crypto");
var mongoose_1 = require("mongoose");
var pulseResponseSchema = new mongoose_1.Schema({
    _id: { type: String, default: function () { return (0, node_crypto_1.randomUUID)(); } },
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    teamId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    weekStart: { type: Date, required: true, index: true },
    mood: { type: Number, required: true, min: 1, max: 5 },
    stress: { type: Number, required: true, min: 1, max: 5 },
    workload: { type: Number, required: true, min: 1, max: 5 },
}, { versionKey: false, timestamps: false });
pulseResponseSchema.index({ organizationId: 1, teamId: 1, weekStart: 1 });
exports.PulseResponse = mongoose_1.models.PulseResponse || (0, mongoose_1.model)("PulseResponse", pulseResponseSchema);
