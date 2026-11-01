"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = void 0;
var mongoose_1 = require("mongoose");
var zod_1 = require("zod");
var logger_1 = require("../utils/logger");
var errors_1 = require("../utils/errors");
var notFoundHandler = function (req, _res, next) {
    next(new errors_1.AppError(404, "Route ".concat(req.method, " ").concat(req.path, " not found"), "NOT_FOUND"));
};
exports.notFoundHandler = notFoundHandler;
var errorHandler = function (error, req, res, _next) {
    var normalized = error;
    if (error instanceof SyntaxError && "status" in error && error.status === 400) {
        normalized = new errors_1.AppError(400, "Malformed JSON request", "INVALID_JSON");
    }
    if (!(error instanceof errors_1.AppError) && error && typeof error === "object" && "status" in error && typeof error.status === "number" && error.status >= 400 && error.status < 500) {
        normalized = new errors_1.AppError(error.status, error.status === 413 ? "Request payload is too large" : "Invalid request", error.status === 413 ? "PAYLOAD_TOO_LARGE" : "INVALID_REQUEST");
    }
    if (error instanceof Error && error.message === "Origin is not allowed by CORS") {
        normalized = new errors_1.AppError(403, "Origin is not allowed", "CORS_ORIGIN_DENIED");
    }
    if (error instanceof zod_1.ZodError)
        normalized = new errors_1.AppError(400, "Request validation failed", "VALIDATION_ERROR", error.flatten());
    if (error instanceof mongoose_1.default.Error.ValidationError || error instanceof mongoose_1.default.Error.CastError) {
        normalized = new errors_1.AppError(400, "Invalid data", "VALIDATION_ERROR");
    }
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
        normalized = new errors_1.AppError(409, "A record with these details already exists", "CONFLICT");
    }
    if (!(normalized instanceof errors_1.AppError)) {
        logger_1.logger.error({ err: normalized, requestId: req.requestId }, "Unhandled request error");
        normalized = new errors_1.AppError(500, "Internal server error", "INTERNAL_ERROR");
    }
    var appError = normalized;
    res.status(appError.statusCode).json({
        error: __assign({ code: appError.code, message: appError.message, requestId: req.requestId }, (appError.details === undefined ? {} : { details: appError.details })),
    });
};
exports.errorHandler = errorHandler;
