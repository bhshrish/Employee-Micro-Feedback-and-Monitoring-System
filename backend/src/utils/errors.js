"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRequired = exports.conflict = exports.notFound = exports.forbidden = exports.unauthorized = exports.badRequest = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    code;
    details;
    constructor(statusCode, message, code = "REQUEST_ERROR", details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.name = "AppError";
    }
}
exports.AppError = AppError;
const badRequest = (message, code) => new AppError(400, message, code);
exports.badRequest = badRequest;
const unauthorized = (message = "Authentication required") => new AppError(401, message, "UNAUTHORIZED");
exports.unauthorized = unauthorized;
const forbidden = (message = "You do not have permission to perform this action") => new AppError(403, message, "FORBIDDEN");
exports.forbidden = forbidden;
const notFound = (message = "Resource not found") => new AppError(404, message, "NOT_FOUND");
exports.notFound = notFound;
const conflict = (message, code = "CONFLICT") => new AppError(409, message, code);
exports.conflict = conflict;
const paymentRequired = (message = "An active subscription is required") => new AppError(402, message, "SUBSCRIPTION_REQUIRED");
exports.paymentRequired = paymentRequired;
