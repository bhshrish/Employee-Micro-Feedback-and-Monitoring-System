"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeBody = sanitizeBody;
exports.validateBody = validateBody;
exports.validateQuery = validateQuery;
exports.validateParams = validateParams;
const errors_1 = require("../utils/errors");
const unsafeKeys = new Set(["__proto__", "prototype", "constructor"]);
function assertSafe(value) {
    if (!value || typeof value !== "object" || Buffer.isBuffer(value) || value instanceof Date)
        return;
    for (const [key, nested] of Object.entries(value)) {
        if (unsafeKeys.has(key))
            throw new errors_1.AppError(400, "Unsafe object key", "INVALID_INPUT");
        assertSafe(nested);
    }
}
function sanitizeBody(req, _res, next) {
    try {
        assertSafe(req.body);
        next();
    }
    catch (error) {
        next(error);
    }
}
function validateBody(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            next(new errors_1.AppError(400, "Request validation failed", "VALIDATION_ERROR", result.error.flatten()));
            return;
        }
        req.body = result.data;
        next();
    };
}
function validateQuery(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.query);
        if (!result.success) {
            next(new errors_1.AppError(400, "Query validation failed", "VALIDATION_ERROR", result.error.flatten()));
            return;
        }
        resAssignQuery(req, result.data);
        next();
    };
}
function validateParams(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.params);
        if (!result.success) {
            next(new errors_1.AppError(400, "Path validation failed", "VALIDATION_ERROR", result.error.flatten()));
            return;
        }
        next();
    };
}
function resAssignQuery(req, query) {
    Object.defineProperty(req, "validatedQuery", { configurable: true, value: query });
}
