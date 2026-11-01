import type { ErrorRequestHandler, RequestHandler } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { logger } from "../utils/logger";
import { AppError } from "../utils/errors";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(404, `Route ${req.method} ${req.path} not found`, "NOT_FOUND"));
};

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  let normalized = error;
  if (error instanceof SyntaxError && "status" in error && error.status === 400) {
    normalized = new AppError(400, "Malformed JSON request", "INVALID_JSON");
  }
  if (!(error instanceof AppError) && error && typeof error === "object" && "status" in error && typeof error.status === "number" && error.status >= 400 && error.status < 500) {
    normalized = new AppError(
      error.status,
      error.status === 413 ? "Request payload is too large" : "Invalid request",
      error.status === 413 ? "PAYLOAD_TOO_LARGE" : "INVALID_REQUEST",
    );
  }
  if (error instanceof Error && error.message === "Origin is not allowed by CORS") {
    normalized = new AppError(403, "Origin is not allowed", "CORS_ORIGIN_DENIED");
  }
  if (error instanceof ZodError) normalized = new AppError(400, "Request validation failed", "VALIDATION_ERROR", error.flatten());
  if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
    normalized = new AppError(400, "Invalid data", "VALIDATION_ERROR");
  }
  if (error && typeof error === "object" && "code" in error && error.code === 11000) {
    normalized = new AppError(409, "A record with these details already exists", "CONFLICT");
  }
  if (!(normalized instanceof AppError)) {
    logger.error({ err: normalized, requestId: req.requestId }, "Unhandled request error");
    normalized = new AppError(500, "Internal server error", "INTERNAL_ERROR");
  }
  const appError = normalized as AppError;
  res.status(appError.statusCode).json({
    error: {
      code: appError.code,
      message: appError.message,
      requestId: req.requestId,
      ...(appError.details === undefined ? {} : { details: appError.details }),
    },
  });
};
