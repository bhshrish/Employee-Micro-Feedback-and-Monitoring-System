"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Organization = void 0;
const mongoose_1 = require("mongoose");
const env_1 = require("../config/env");
const organizationSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true, maxlength: 120 },
    ownerId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    minGroupSize: { type: Number, min: 5, max: 100, default: () => (0, env_1.getConfig)().MIN_PULSE_GROUP_SIZE },
}, { timestamps: true });
exports.Organization = mongoose_1.models.Organization || (0, mongoose_1.model)("Organization", organizationSchema);
