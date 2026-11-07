"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeOtp = void 0;
const mongoose_1 = require("mongoose");
const employeeOtpSchema = new mongoose_1.Schema({
    email: { type: String, required: true, unique: true },
    codeHash: { type: String, required: true, select: false },
    attempts: { type: Number, default: 0, min: 0 },
    expiresAt: { type: Date, required: true },
    resendAfter: { type: Date, required: true },
}, { timestamps: true });
employeeOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
exports.EmployeeOtp = mongoose_1.models.EmployeeOtp || (0, mongoose_1.model)("EmployeeOtp", employeeOtpSchema);
