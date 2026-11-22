import type { NextFunction, Request, Response } from "express";
import mongoose_1 from "mongoose";
import * as zod_1 from "zod";
import * as logger_1 from "../utils/logger";
import * as errors_1 from "../utils/errors";
interface ErrorRequest extends Request {
    requestId: string;
}
interface StatusError extends Error {
    statusCode: number;
    code: string;
    details?: unknown;
}
const notFoundHandler = (req: ErrorRequest, _res: Response, next: NextFunction): void => {
    next(new errors_1.AppError(404, `Route ${req.method} ${req.path} not found`, "NOT_FOUND"));
};
const errorHandler = (error: unknown, req: ErrorRequest, res: Response, _next: NextFunction): void => {
    let normalized = error;
    if (!(error instanceof errors_1.AppError) &&
        error instanceof Error &&
        "statusCode" in error &&
        typeof error.statusCode === "number" &&
        error.statusCode >= 400 &&
        error.statusCode < 500 &&
        "code" in error &&
        typeof error.code === "string") {
        const statusError = error as StatusError;
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
    if (error instanceof mongoose_1.default.Error.ValidationError || error instanceof mongoose_1.default.Error.CastError) {
        normalized = new errors_1.AppError(400, "Invalid data", "VALIDATION_ERROR");
    }
    if (error instanceof mongoose_1.default.Error.MongooseServerSelectionError) {
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
