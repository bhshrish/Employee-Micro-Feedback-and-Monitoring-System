"use strict";
const { Schema, model, models } = require("mongoose");

const employeeToolSchema = new Schema({
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    kind: { type: String, enum: ["planner_task", "leave_request", "meeting", "reminder", "signature"], required: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, default: "", trim: true, maxlength: 4000 },
    status: { type: String, enum: ["open", "completed", "pending", "approved", "rejected", "signed"], default: "open" },
    estimatedMinutes: { type: Number, min: 0, max: 1440, default: 0 },
    leaveType: { type: String, enum: ["annual", "sick", "personal", "other"] },
    startsAt: { type: Date },
    endsAt: { type: Date },
    reminderAt: { type: Date },
    reminderSentAt: { type: Date, default: null },
    reminderClaimedAt: { type: Date, default: null },
    signedName: { type: String, trim: true, maxlength: 100 },
    signatureHash: { type: String, select: false },
    signedAt: { type: Date },
}, { timestamps: true, minimize: false });

employeeToolSchema.index({ organizationId: 1, userId: 1, kind: 1, startsAt: 1 });
employeeToolSchema.index({ organizationId: 1, kind: 1, status: 1 });

exports.EmployeeTool = models.EmployeeTool || model("EmployeeTool", employeeToolSchema);
