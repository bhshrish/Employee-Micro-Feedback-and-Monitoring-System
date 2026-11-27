"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Organization = void 0;
const mongoose_1 = require("mongoose");
const env_1 = require("../config/env");
const organizationSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true, maxlength: 120 },
    organizationSize: { type: String, enum: ["1-10", "11-50", "51-200", "201-500", "501+"] },
    industry: { type: String, trim: true, maxlength: 80 },
    ownerId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: true, index: true },
    minGroupSize: { type: Number, min: 5, max: 100, default: () => (0, env_1.getConfig)().MIN_PULSE_GROUP_SIZE },
}, { timestamps: true });
exports.Organization = mongoose_1.models.Organization || (0, mongoose_1.model)("Organization", organizationSchema);
