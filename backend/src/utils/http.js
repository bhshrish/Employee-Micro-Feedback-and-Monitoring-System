"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unavailable = void 0;
var errors_1 = require("./errors");
var unavailable = function (message) { return new errors_1.AppError(503, message, "SERVICE_UNAVAILABLE"); };
exports.unavailable = unavailable;
