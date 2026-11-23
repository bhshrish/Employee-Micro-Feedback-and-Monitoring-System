"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationsAdmin = void 0;
const mongoose_1 = require("mongoose");
const operationsAdminSchema = new mongoose_1.Schema({
    _id: { type: String, default: "platform-admin" },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    passwordChangedAt: { type: Date, required: true, default: Date.now },
}, { timestamps: true });
exports.OperationsAdmin = mongoose_1.models.OperationsAdmin || (0, mongoose_1.model)("OperationsAdmin", operationsAdminSchema);
