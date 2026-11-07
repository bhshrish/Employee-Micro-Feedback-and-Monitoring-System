"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLog = void 0;
const mongoose_1 = require("mongoose");
const auditLogSchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    actorId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true, maxlength: 120 },
    targetType: { type: String, required: true, maxlength: 80 },
    targetId: { type: String, default: null, maxlength: 120 },
    details: { type: mongoose_1.Schema.Types.Mixed, default: {} },
}, { timestamps: true });
auditLogSchema.index({ organizationId: 1, createdAt: -1 });
exports.AuditLog = mongoose_1.models.AuditLog || (0, mongoose_1.model)("AuditLog", auditLogSchema);
