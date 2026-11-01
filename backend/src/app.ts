import { randomUUID } from "node:crypto";
import path from "node:path";
import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import { getConfig } from "./config/env";
import { logger } from "./utils/logger";
import { errorHandler, notFoundHandler } from "./middleware/errors";
import { sanitizeBody } from "./middleware/validate";
import api from "./routes";
import { webhook } from "./controllers/billing.controller";

export function createApp() {
  const config = getConfig();
  const app = express();
  app.disable("x-powered-by");
  if (config.NODE_ENV === "production") app.set("trust proxy", 1);
  app.use(helmet());
  app.use(cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || config.CORS_ORIGINS.split(",").map((item) => item.trim()).includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin is not allowed by CORS"));
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID", "Stripe-Signature"],
  }));
  app.use(pinoHttp({
    logger,
    serializers: {
      req: (req) => ({
        id: req.id,
        method: req.method,
        url: (req.url ?? "").split("?")[0],
      }),
    },
    genReqId(_req, res) {
      const requestId = randomUUID();
      res.setHeader("X-Request-ID", requestId);
      return requestId;
    },
    customProps: (req) => ({ requestId: String(req.id) }),
    autoLogging: { ignore: (req) => req.url.startsWith("/api/v1/health/") },
  }));
  app.use((req, _res, next) => {
    req.requestId = String(req.id);
    next();
  });
  app.use("/api/v1/billing/webhook", express.raw({ type: "application/json", limit: "1mb" }), webhook);
  app.use("/api/v1/webhooks/stripe", express.raw({ type: "application/json", limit: "1mb" }), webhook);
  app.use(express.json({ limit: "64kb", strict: true }));
  app.use(cookieParser());
  app.use(sanitizeBody);
  app.use("/api/v1", rateLimit({
    windowMs: 60_000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skip: (req) => req.path.startsWith("/health/"),
    handler: (req, res) => res.status(429).json({
      error: { code: "RATE_LIMITED", message: "Too many requests", requestId: req.requestId },
    }),
  }));
  app.use("/api/v1", (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  app.use("/api/v1", (req, res, next) => {
    const originalJson = res.json;
    res.json = new Proxy(originalJson, {
      apply(target, thisArg, args: [unknown]) {
        const body = args[0];
        if (req.path.startsWith("/health/")) return Reflect.apply(target, thisArg, args);
        if (body && typeof body === "object" && !Array.isArray(body) && !("error" in body) && !("data" in body)) {
          args[0] = { ...(body as Record<string, unknown>), data: body };
        } else if (Array.isArray(body)) {
          args[0] = { data: body };
        }
        return Reflect.apply(target, thisArg, args);
      },
    });
    next();
  });
  app.use("/api/v1/auth", rateLimit({
    windowMs: 15 * 60_000,
    limit: 30,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (req, res) => res.status(429).json({
      error: { code: "RATE_LIMITED", message: "Too many authentication attempts", requestId: req.requestId },
    }),
  }));
  app.use("/api/v1", api);
  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/health/live", (_req, res) => res.json({ status: "ok" }));
  app.get("/health/ready", (_req, res) => {
    if (mongoose.connection.readyState !== 1) {
      res.status(503).json({ status: "not_ready", dependencies: { mongodb: "unavailable" } });
      return;
    }
    res.json({ status: "ready", dependencies: { mongodb: "ok" } });
  });
  app.get("/api/openapi.yaml", (_req, res) => {
    res.type("text/yaml").sendFile(path.resolve(__dirname, "../openapi.yaml"));
  });
  app.get("/api/docs", (_req, res) => {
    res.type("html").send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PULSE API</title><style>body{font:16px system-ui;max-width:760px;margin:4rem auto;padding:0 1.5rem;color:#172222}code{background:#edf3f1;padding:.2rem .4rem;border-radius:4px}a{color:#087d6e}</style></head><body><h1>PULSE API</h1><p>Versioned API base path: <code>/api/v1</code></p><p>OpenAPI 3 specification: <a href="/api/openapi.yaml">openapi.yaml</a></p><p>Health checks: <code>/api/v1/health/live</code> and <code>/api/v1/health/ready</code>.</p><p>Authentication uses short-lived bearer access tokens and a rotating, HTTP-only refresh cookie.</p></body></html>`);
  });
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
