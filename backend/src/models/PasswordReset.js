"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordReset = void 0;
const mongoose_1 = require("mongoose");
const passwordResetSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, select: false },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    usedAt: { type: Date, default: null },
}, { timestamps: true });
exports.PasswordReset = mongoose_1.models.PasswordReset || (0, mongoose_1.model)("PasswordReset", passwordResetSchema);
