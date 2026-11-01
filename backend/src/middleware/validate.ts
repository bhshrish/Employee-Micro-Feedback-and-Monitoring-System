import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { AppError } from "../utils/errors";

const unsafeKeys = new Set(["__proto__", "prototype", "constructor"]);

function assertSafe(value: unknown): void {
  if (!value || typeof value !== "object" || Buffer.isBuffer(value) || value instanceof Date) return;
  for (const [key, nested] of Object.entries(value)) {
    if (unsafeKeys.has(key)) throw new AppError(400, "Unsafe object key", "INVALID_INPUT");
    assertSafe(nested);
  }
}

export function sanitizeBody(req: Request, _res: Response, next: NextFunction): void {
  try {
    assertSafe(req.body);
    next();
  } catch (error) {
    next(error);
  }
}

export function validateBody<T extends ZodTypeAny>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new AppError(400, "Request validation failed", "VALIDATION_ERROR", result.error.flatten()));
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery<T extends ZodTypeAny>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(new AppError(400, "Query validation failed", "VALIDATION_ERROR", result.error.flatten()));
      return;
    }
    resAssignQuery(req, result.data);
    next();
  };
}

export function validateParams<T extends ZodTypeAny>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      next(new AppError(400, "Path validation failed", "VALIDATION_ERROR", result.error.flatten()));
      return;
    }
    next();
  };
}

function resAssignQuery(req: Request, query: unknown): void {
  Object.defineProperty(req, "validatedQuery", { configurable: true, value: query });
}
