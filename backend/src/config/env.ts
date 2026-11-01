import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().default("mongodb://127.0.0.1:27017/pulse"),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_DAYS: z.coerce.number().int().min(1).max(7).default(7),
  COOKIE_SECURE: z.string().default("false").transform((v) => v === "true"),
  COOKIE_DOMAIN: z.string().optional(),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  MIN_PULSE_GROUP_SIZE: z.coerce.number().int().min(5).default(5),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_STARTER_MONTHLY: z.string().optional(),
  STRIPE_PRICE_STARTER_YEARLY: z.string().optional(),
  STRIPE_PRICE_TEAM_MONTHLY: z.string().optional(),
  STRIPE_PRICE_TEAM_YEARLY: z.string().optional(),
  STRIPE_PRICE_BUSINESS_MONTHLY: z.string().optional(),
  STRIPE_PRICE_BUSINESS_YEARLY: z.string().optional(),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
});

export type AppConfig = z.infer<typeof schema>;

export function getConfig(): AppConfig {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) throw new Error(`Invalid environment: ${parsed.error.issues.map((i) => i.path.join(".")).join(", ")}`);
  const config = parsed.data;
  for (const [key, value] of [["JWT_ACCESS_SECRET", config.JWT_ACCESS_SECRET], ["JWT_REFRESH_SECRET", config.JWT_REFRESH_SECRET]] as const) {
    if (/^(replace-with|change-me|your-secret)/i.test(value)) {
      throw new Error(`${key} must be replaced with an environment-provided secret`);
    }
  }
  if (config.NODE_ENV === "production" && config.JWT_ACCESS_SECRET === config.JWT_REFRESH_SECRET) {
    throw new Error("JWT secrets must be different");
  }
  if (config.NODE_ENV === "production") {
    for (const key of ["MONGODB_URI", "FRONTEND_URL", "CORS_ORIGINS"] as const) {
      if (!process.env[key]) throw new Error(`${key} must be explicitly configured in production`);
    }
    if (/^mongodb(?:\+srv)?:\/\/(?:localhost|127\.0\.0\.1)(?::|\/)/i.test(config.MONGODB_URI)) {
      throw new Error("MONGODB_URI must not point to localhost in production");
    }
  }
  return config;
}
