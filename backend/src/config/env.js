"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = getConfig;
var zod_1 = require("zod");
var schema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "test", "production"]).default("development"),
    PORT: zod_1.z.coerce.number().int().positive().default(4000),
    MONGODB_URI: zod_1.z.string().default("mongodb://127.0.0.1:27017/pulse"),
    FRONTEND_URL: zod_1.z.string().url().default("http://localhost:3000"),
    JWT_ACCESS_SECRET: zod_1.z.string().min(32),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32),
    ACCESS_TOKEN_TTL: zod_1.z.string().default("15m"),
    REFRESH_TOKEN_DAYS: zod_1.z.coerce.number().int().min(1).max(7).default(7),
    COOKIE_SECURE: zod_1.z.string().default("false").transform(function (v) { return v === "true"; }),
    COOKIE_DOMAIN: zod_1.z.string().optional(),
    CORS_ORIGINS: zod_1.z.string().default("http://localhost:3000"),
    MIN_PULSE_GROUP_SIZE: zod_1.z.coerce.number().int().min(5).default(5),
    STRIPE_SECRET_KEY: zod_1.z.string().optional(),
    STRIPE_WEBHOOK_SECRET: zod_1.z.string().optional(),
    STRIPE_PRICE_STARTER_MONTHLY: zod_1.z.string().optional(),
    STRIPE_PRICE_STARTER_YEARLY: zod_1.z.string().optional(),
    STRIPE_PRICE_TEAM_MONTHLY: zod_1.z.string().optional(),
    STRIPE_PRICE_TEAM_YEARLY: zod_1.z.string().optional(),
    STRIPE_PRICE_BUSINESS_MONTHLY: zod_1.z.string().optional(),
    STRIPE_PRICE_BUSINESS_YEARLY: zod_1.z.string().optional(),
    LOG_LEVEL: zod_1.z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
});
function getConfig() {
    var parsed = schema.safeParse(process.env);
    if (!parsed.success)
        throw new Error("Invalid environment: ".concat(parsed.error.issues.map(function (i) { return i.path.join("."); }).join(", ")));
    var config = parsed.data;
    for (var _i = 0, _a = [["JWT_ACCESS_SECRET", config.JWT_ACCESS_SECRET], ["JWT_REFRESH_SECRET", config.JWT_REFRESH_SECRET]]; _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (/^(replace-with|change-me|your-secret)/i.test(value)) {
            throw new Error("".concat(key, " must be replaced with an environment-provided secret"));
        }
    }
    if (config.NODE_ENV === "production" && config.JWT_ACCESS_SECRET === config.JWT_REFRESH_SECRET) {
        throw new Error("JWT secrets must be different");
    }
    if (config.NODE_ENV === "production") {
        for (var _c = 0, _d = ["MONGODB_URI", "FRONTEND_URL", "CORS_ORIGINS"]; _c < _d.length; _c++) {
            var key = _d[_c];
            if (!process.env[key])
                throw new Error("".concat(key, " must be explicitly configured in production"));
        }
        if (/^mongodb(?:\+srv)?:\/\/(?:localhost|127\.0\.0\.1)(?::|\/)/i.test(config.MONGODB_URI)) {
            throw new Error("MONGODB_URI must not point to localhost in production");
        }
    }
    return config;
}
