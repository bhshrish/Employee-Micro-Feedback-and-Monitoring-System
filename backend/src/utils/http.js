"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unavailable = void 0;
const errors_1 = require("./errors");
const unavailable = (message) => new errors_1.AppError(503, message, "SERVICE_UNAVAILABLE");
exports.unavailable = unavailable;
