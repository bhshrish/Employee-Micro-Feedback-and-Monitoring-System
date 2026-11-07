"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshToken = void 0;
const mongoose_1 = require("mongoose");
const refreshTokenSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, select: false },
    familyId: { type: String, required: true, index: true },
    rememberMe: { type: Boolean, default: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    revokedAt: { type: Date, default: null },
    replacedByTokenId: { type: mongoose_1.Schema.Types.ObjectId, ref: "RefreshToken", default: null },
}, { timestamps: true });
refreshTokenSchema.index({ familyId: 1, revokedAt: 1 });
exports.RefreshToken = mongoose_1.models.RefreshToken || (0, mongoose_1.model)("RefreshToken", refreshTokenSchema);
