"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = void 0;
const mongoose_2 = __importDefault(require("mongoose"));
const zod_1 = __importStar(require("zod"));
const logger_1 = __importStar(require("../utils/logger"));
const errors_1 = __importStar(require("../utils/errors"));
const notFoundHandler = (req, _res, next) => {
    next(new errors_1.AppError(404, `Route ${req.method} ${req.path} not found`, "NOT_FOUND"));
};
exports.notFoundHandler = notFoundHandler;
const errorHandler = (error, req, res, _next) => {
    let normalized = error;
    if (!(error instanceof errors_1.AppError) &&
        error instanceof Error &&
        "statusCode" in error &&
        typeof error.statusCode === "number" &&
        error.statusCode >= 400 &&
        error.statusCode < 500 &&
        "code" in error &&
        typeof error.code === "string") {
        const statusError = error;
        normalized = new errors_1.AppError(statusError.statusCode, statusError.message, statusError.code, statusError.details);
    }
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
    if (error instanceof mongoose_2.default.default.Error.ValidationError || error instanceof mongoose_2.default.default.Error.CastError) {
        normalized = new errors_1.AppError(400, "Invalid data", "VALIDATION_ERROR");
    }
    if (error instanceof mongoose_2.default.default.Error.MongooseServerSelectionError) {
        logger_1.logger.error({ err: error, requestId: req.requestId }, "MongoDB is unavailable");
        normalized = new errors_1.AppError(503, "Database is temporarily unavailable", "DATABASE_UNAVAILABLE");
    }
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
        normalized = new errors_1.AppError(409, "A record with these details already exists", "CONFLICT");
    }
    if (!(normalized instanceof errors_1.AppError)) {
        logger_1.logger.error({ err: normalized, requestId: req.requestId }, "Unhandled request error");
        normalized = new errors_1.AppError(500, "Internal server error", "INTERNAL_ERROR");
    }
    const appError = normalized;
    res.status(appError.statusCode).json({
        success: false,
        data: null,
        error: {
            code: appError.code,
            message: appError.message,
            requestId: req.requestId,
            ...(appError.details === undefined ? {} : { details: appError.details }),
        },
    });
};
exports.errorHandler = errorHandler;
