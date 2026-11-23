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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeBody = sanitizeBody;
exports.validateBody = validateBody;
exports.validateQuery = validateQuery;
exports.validateParams = validateParams;
const errors_1 = __importStar(require("../utils/errors"));
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
