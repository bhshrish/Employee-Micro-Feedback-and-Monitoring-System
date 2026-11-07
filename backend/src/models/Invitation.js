"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invitation = void 0;
const mongoose_1 = require("mongoose");
const invitationSchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    teamId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Team", required: true },
    inviterId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true, trim: true },
    tokenHash: { type: String, required: true, unique: true, select: false },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    acceptedAt: { type: Date, default: null },
}, { timestamps: true });
invitationSchema.index({ organizationId: 1, email: 1, acceptedAt: 1 });
exports.Invitation = mongoose_1.models.Invitation || (0, mongoose_1.model)("Invitation", invitationSchema);
