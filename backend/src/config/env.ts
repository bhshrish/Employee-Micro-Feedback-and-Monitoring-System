import { z } from "zod";
const schema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    MONGODB_URI: z.string().default("mongodb://127.0.0.1:27017/pulse"),
    FRONTEND_URL: z.string().url().default("https://employee-micro-feedback-and-monitor-omega.vercel.app"),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_ADMIN_SECRET: z.string().min(32),
    ACCESS_TOKEN_TTL: z.string().default("15m"),
    REFRESH_TOKEN_DAYS: z.coerce.number().int().min(1).max(30).default(7),
    COOKIE_SECURE: z.preprocess((v: unknown) => {
        if (v === "true" || v === true) return true;
        if (v === "false" || v === false) return false;
        return undefined;
    }, z.boolean().optional()),
    COOKIE_DOMAIN: z.string().optional(),
    CORS_ORIGINS: z.string().default("https://employee-micro-feedback-and-monitor-omega.vercel.app"),
    OPS_ADMIN_EMAIL: z.string().email().default("admin@gmail.com"),
    OPS_ADMIN_NAME: z.string().trim().min(2).max(100).default("Platform Administrator"),
    OPS_ADMIN_INITIAL_PASSWORD: z.preprocess((value: unknown) => value === "" ? undefined : value, z.string().min(12).optional()),
    MIN_PULSE_GROUP_SIZE: z.coerce.number().int().min(5).default(5),
    PASSWORD_RESET_TTL_MINUTES: z.coerce.number().int().min(5).max(10080).default(60),
    SMTP_HOST: z.preprocess((value: unknown) => typeof value === "string" && value.trim() ? value.trim() : undefined, z.string().optional()),
    SMTP_PORT: z.coerce.number().int().min(1).max(65535).optional(),
    SMTP_USER: z.preprocess((value: unknown) => typeof value === "string" && value.trim() ? value.trim() : undefined, z.string().optional()),
    SMTP_PASS: z.preprocess((v: unknown) => {
        if (typeof v === "string" && v.trim()) return v.trim();
        if (typeof process.env.SMTP_PASSWORD === "string" && process.env.SMTP_PASSWORD.trim()) return process.env.SMTP_PASSWORD.trim();
        return undefined;
    }, z.string().optional()),
    SMTP_FROM: z.preprocess((value: unknown) => typeof value === "string" && value.trim() ? value.trim() : undefined, z.string().email().optional()),
    SMTP_FROM_NAME: z.string().default("CalmWork"),
    SMS_API_URL: z.string().url().optional(),
    SMS_API_TOKEN: z.string().optional(),
    RAZORPAY_KEY_ID: z.string().optional(),
    RAZORPAY_KEY_SECRET: z.string().optional(),
    RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
    RAZORPAY_PLAN_STARTER_MONTHLY: z.string().optional(),
    RAZORPAY_PLAN_STARTER_YEARLY: z.string().optional(),
    RAZORPAY_PLAN_TEAM_MONTHLY: z.string().optional(),
    RAZORPAY_PLAN_TEAM_YEARLY: z.string().optional(),
    RAZORPAY_PLAN_BUSINESS_MONTHLY: z.string().optional(),
    RAZORPAY_PLAN_BUSINESS_YEARLY: z.string().optional(),
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
});
export function getConfig() {
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
    if (config.COOKIE_SECURE === undefined) {
        config.COOKIE_SECURE = config.NODE_ENV === "production";
    }
    return config;
}