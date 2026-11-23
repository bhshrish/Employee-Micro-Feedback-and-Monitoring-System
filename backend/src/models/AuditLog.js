"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLog = exports.AUDIT_TARGET_TYPES = void 0;
const mongoose_1 = require("mongoose");
exports.AUDIT_TARGET_TYPES = ["user", "team", "alert", "invitation", "settings", "report"];
const auditLogSchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    actorId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    actorName: { type: String, required: true, trim: true, maxlength: 100 },
    action: { type: String, required: true, trim: true, maxlength: 60 },
    targetType: { type: String, enum: exports.AUDIT_TARGET_TYPES, required: true },
    targetId: { type: mongoose_1.Schema.Types.ObjectId, default: null },
    targetLabel: { type: String, default: "", trim: true, maxlength: 180 },
    summary: { type: String, required: true, trim: true, maxlength: 300 },
    metadata: { type: mongoose_1.Schema.Types.Mixed, default: {} },
}, { timestamps: true });
auditLogSchema.index({ organizationId: 1, createdAt: -1 });
auditLogSchema.index({ organizationId: 1, action: 1, createdAt: -1 });
exports.AuditLog = mongoose_1.models.AuditLog || (0, mongoose_1.model)("AuditLog", auditLogSchema);
