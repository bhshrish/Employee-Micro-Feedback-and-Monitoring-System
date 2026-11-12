"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = getConfig;
const zod_1 = require("zod");
const schema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "test", "production"]).default("development"),
    PORT: zod_1.z.coerce.number().int().positive().default(4000),
    MONGODB_URI: zod_1.z.string().default("mongodb://127.0.0.1:27017/pulse"),
    FRONTEND_URL: zod_1.z.string().url().default("http://localhost:3000"),
    JWT_ACCESS_SECRET: zod_1.z.string().min(32),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32),
    JWT_ADMIN_SECRET: zod_1.z.string().min(32),
    ACCESS_TOKEN_TTL: zod_1.z.string().default("15m"),
    REFRESH_TOKEN_DAYS: zod_1.z.coerce.number().int().min(1).max(7).default(7),
    COOKIE_SECURE: zod_1.z.string().default("false").transform((v) => v === "true"),
    COOKIE_DOMAIN: zod_1.z.string().optional(),
    CORS_ORIGINS: zod_1.z.string().default("http://localhost:3000"),
    OPS_ADMIN_EMAIL: zod_1.z.string().email().default("admin@gmail.com"),
    MIN_PULSE_GROUP_SIZE: zod_1.z.coerce.number().int().min(5).default(5),
    PASSWORD_RESET_TTL_MINUTES: zod_1.z.coerce.number().int().min(5).max(10080).default(60),
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.coerce.number().int().min(1).max(65535).optional(),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    SMTP_FROM: zod_1.z.string().email().optional(),
    SMTP_FROM_NAME: zod_1.z.string().default("CalmWork"),
    SMS_API_URL: zod_1.z.string().url().optional(),
    SMS_API_TOKEN: zod_1.z.string().optional(),
    RAZORPAY_KEY_ID: zod_1.z.string().optional(),
    RAZORPAY_KEY_SECRET: zod_1.z.string().optional(),
    RAZORPAY_WEBHOOK_SECRET: zod_1.z.string().optional(),
    RAZORPAY_PLAN_STARTER_MONTHLY: zod_1.z.string().optional(),
    RAZORPAY_PLAN_STARTER_YEARLY: zod_1.z.string().optional(),
    RAZORPAY_PLAN_TEAM_MONTHLY: zod_1.z.string().optional(),
    RAZORPAY_PLAN_TEAM_YEARLY: zod_1.z.string().optional(),
    RAZORPAY_PLAN_BUSINESS_MONTHLY: zod_1.z.string().optional(),
    RAZORPAY_PLAN_BUSINESS_YEARLY: zod_1.z.string().optional(),
    LOG_LEVEL: zod_1.z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
});
function getConfig() {
    const parsed = schema.safeParse(process.env);
    if (!parsed.success)
        throw new Error(`Invalid environment: ${parsed.error.issues.map((i) => i.path.join(".")).join(", ")}`);
    const config = parsed.data;
    for (const [key, value] of [
        ["JWT_ACCESS_SECRET", config.JWT_ACCESS_SECRET],
        ["JWT_REFRESH_SECRET", config.JWT_REFRESH_SECRET],
        ["JWT_ADMIN_SECRET", config.JWT_ADMIN_SECRET],
    ]) {
        if (/^(replace-with|change-me|your-secret)/i.test(value)) {
            throw new Error(`${key} must be replaced with an environment-provided secret`);
        }
    }
    if (config.NODE_ENV === "production" &&
        new Set([config.JWT_ACCESS_SECRET, config.JWT_REFRESH_SECRET, config.JWT_ADMIN_SECRET]).size !== 3) {
        throw new Error("JWT secrets must be different");
    }
    if (config.NODE_ENV === "production") {
        for (const key of ["MONGODB_URI", "FRONTEND_URL", "CORS_ORIGINS"]) {
            if (!process.env[key])
                throw new Error(`${key} must be explicitly configured in production`);
        }
        if (/^mongodb(?:\+srv)?:\/\/(?:localhost|127\.0\.0\.1)(?::|\/)/i.test(config.MONGODB_URI)) {
            throw new Error("MONGODB_URI must not point to localhost in production");
        }
    }
    return config;
}
