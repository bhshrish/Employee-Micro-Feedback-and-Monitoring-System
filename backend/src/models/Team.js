"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Team = void 0;
const mongoose_1 = require("mongoose");
const teamSchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    archivedAt: { type: Date, default: null },
}, { timestamps: true });
teamSchema.index({ organizationId: 1, name: 1 }, { unique: true });
exports.Team = mongoose_1.models.Team || (0, mongoose_1.model)("Team", teamSchema);
