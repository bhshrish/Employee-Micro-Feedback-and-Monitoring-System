"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attendance = void 0;
const mongoose_1 = require("mongoose");
const attendanceSchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    checkedInAt: { type: Date, required: true, index: true },
    checkedOutAt: { type: Date, default: null },
    durationSeconds: { type: Number, default: null, min: 0 },
}, { timestamps: true });
attendanceSchema.index({ userId: 1, checkedInAt: -1 });
attendanceSchema.index({ userId: 1 }, { unique: true, partialFilterExpression: { checkedOutAt: null } });
exports.Attendance = mongoose_1.models.Attendance || (0, mongoose_1.model)("Attendance", attendanceSchema);