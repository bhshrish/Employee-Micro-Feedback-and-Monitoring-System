"use strict";

const { Schema, model, models } = require("mongoose");

const AUDIT_TARGET_TYPES = ["user", "team", "alert", "invitation", "settings", "report"];

const auditLogSchema = new Schema({
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    actorName: { type: String, required: true, trim: true, maxlength: 100 },
    action: { type: String, required: true, trim: true, maxlength: 60 },
    targetType: { type: String, enum: AUDIT_TARGET_TYPES, required: true },
    targetId: { type: Schema.Types.ObjectId, default: null },
    targetLabel: { type: String, default: "", trim: true, maxlength: 180 },
    summary: { type: String, required: true, trim: true, maxlength: 300 },
    metadata: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

auditLogSchema.index({ organizationId: 1, createdAt: -1 });
auditLogSchema.index({ organizationId: 1, action: 1, createdAt: -1 });

exports.AUDIT_TARGET_TYPES = AUDIT_TARGET_TYPES;
exports.AuditLog = models.AuditLog || model("AuditLog", auditLogSchema);
