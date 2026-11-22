import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ZodType } from "zod";
import * as errors_1 from "../utils/errors";
const unsafeKeys = new Set(["__proto__", "prototype", "constructor"]);
function assertSafe(value: unknown): void {
    if (!value || typeof value !== "object" || Buffer.isBuffer(value) || value instanceof Date)
        return;
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
        if (unsafeKeys.has(key))
            throw new errors_1.AppError(400, "Unsafe object key", "INVALID_INPUT");
        assertSafe(nested);
    }
}
export function sanitizeBody(req: Request, _res: Response, next: NextFunction): void {
    try {
        assertSafe(req.body);
        next();
    }
    catch (error) {
        next(error);
    }
}
export function validateBody(schema: ZodType): RequestHandler {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            next(new errors_1.AppError(400, "Request validation failed", "VALIDATION_ERROR", result.error.flatten()));
            return;
        }
        req.body = result.data;
        next();
    };
}
export function validateQuery(schema: ZodType): RequestHandler {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.query);
        if (!result.success) {
            next(new errors_1.AppError(400, "Query validation failed", "VALIDATION_ERROR", result.error.flatten()));
            return;
        }
        resAssignQuery(req, result.data);
        next();
    };
}
export function validateParams(schema: ZodType): RequestHandler {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.params);
        if (!result.success) {
            next(new errors_1.AppError(400, "Path validation failed", "VALIDATION_ERROR", result.error.flatten()));
            return;
        }
        next();
    };
}
function resAssignQuery(req: Request, query: unknown): void {
    Object.defineProperty(req, "validatedQuery", { configurable: true, value: query });
}
