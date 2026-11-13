"use strict";
const { model, models, Schema } = require("mongoose");

const operationsAdminSchema = new Schema({
    _id: { type: String, default: "platform-admin" },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    passwordChangedAt: { type: Date, required: true, default: Date.now },
}, { timestamps: true });

exports.OperationsAdmin = models.OperationsAdmin || model("OperationsAdmin", operationsAdminSchema);
