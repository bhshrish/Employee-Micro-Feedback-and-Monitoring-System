import { randomUUID } from "node:crypto";
import path from "node:path";
import mongoose from "mongoose";
import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import { createRequire } from "node:module";
import type { RequestHandler, Router } from "express";
import { getConfig } from "./config/env";
import { connectDatabase } from "./db";
import { logger } from "./utils/logger";
const require = createRequire(import.meta.url);
const { notFoundHandler, errorHandler } = require("./middleware/errors") as {
    notFoundHandler: RequestHandler;
    errorHandler: (error: unknown, req: Request, res: Response, next: NextFunction) => void;
};
const { sanitizeBody } = require("./middleware/validate") as { sanitizeBody: RequestHandler };
const routes = require("./routes").default as Router;
const { webhook } = require("./controllers/billing.controller") as { webhook: RequestHandler };

declare module "express-serve-static-core" {
    interface Request {
        requestId: string;
    }
}

export interface CreateAppOptions {
    ensureDatabaseConnected?: () => Promise<void> | void;
}

export function createApp({ ensureDatabaseConnected }: CreateAppOptions = {}) {
    const config = getConfig();
    const app = express();
    app.disable("x-powered-by");
    if (config.NODE_ENV === "production") app.set("trust proxy", 1);
    app.use(helmet());

    const allowedOrigins = config.CORS_ORIGINS.split(",").map((item) => item.trim().replace(/\/+$/, "")).filter(Boolean);
    if (!allowedOrigins.includes("http://localhost:3000")) allowedOrigins.push("http://localhost:3000");
    if (!allowedOrigins.includes("http://127.0.0.1:3000")) allowedOrigins.push("http://127.0.0.1:3000");
    app.use(cors({
        credentials: true,
        origin(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }
            callback(new Error("Origin is not allowed by CORS"));
        },
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID", "X-Razorpay-Signature"],
    }));
    app.use(pinoHttp({
        logger,
        serializers: {
            req: (req: Request) => ({
                id: req.id,
                method: req.method,
                url: (req.url ?? "").split("?")[0],
            }),
        },
        genReqId(_req: Request, res: Response) {
            const requestId = randomUUID();
            res.setHeader("X-Request-ID", requestId);
            return requestId;
        },
        customProps: (req: Request) => ({ requestId: String(req.id) }),
        autoLogging: { ignore: (req: Request) => req.url.startsWith("/api/v1/health/") },
    }));
    app.use((req: Request, _res: Response, next: NextFunction) => {
        req.requestId = String(req.id);
        next();
    });
    if (ensureDatabaseConnected) {
        const healthPaths = new Set([
            "/health", "/health/live", "/health/ready",
            "/api/v1/health", "/api/v1/health/live", "/api/v1/health/ready",
        ]);
        app.use((req: Request, _res: Response, next: NextFunction) => {
            if (req.method === "GET" && healthPaths.has(req.path)) {
                next();
                return;
            }
            Promise.resolve().then(ensureDatabaseConnected).then(() => next(), next);
        });
    }
    app.use("/api/v1/webhooks/razorpay", express.raw({ type: "application/json", limit: "1mb" }), webhook);
    app.use(express.json({ limit: "64kb", strict: true }));
    app.use(cookieParser());
    app.use(sanitizeBody);
    app.use("/api/v1", rateLimit({
        windowMs: 60_000,
        limit: 300,
        standardHeaders: "draft-7",
        legacyHeaders: false,
        skip: (req) => req.path.startsWith("/health/"),
        handler: (req: Request, res: Response) => {
            res.status(429).json({
                error: { code: "RATE_LIMITED", message: "Too many requests", requestId: req.requestId },
            });
        },
    }));
    app.use("/api/v1", (_req: Request, res: Response, next: NextFunction) => {
        res.setHeader("Cache-Control", "no-store");
        next();
    });
    app.use("/api/v1", (req: Request, res: Response, next: NextFunction) => {
        const originalJson = res.json;
        res.json = new Proxy(originalJson, {
            apply(target, thisArg, args: unknown[]) {
                const body = args[0];
                if (req.path.startsWith("/health/")) return Reflect.apply(target, thisArg, args);
                if (body && typeof body === "object" && !Array.isArray(body)) {
                    const record = body as Record<string, unknown>;
                    if (record.error) {
                        args[0] = { ...record, success: false, data: record.data ?? null };
                    } else {
                        args[0] = { success: true, data: record.data ?? record, error: record.error ?? null, ...record };
                    }
                } else if (Array.isArray(body)) {
                    args[0] = { success: true, data: body, error: null };
                }
                return Reflect.apply(target, thisArg, args);
            },
        });
        next();
    });
    app.use("/api/v1/auth", rateLimit({
        windowMs: 15 * 60_000,
        limit: 30,
        skip: () => getConfig().NODE_ENV === "test",
        standardHeaders: "draft-7",
        legacyHeaders: false,
        handler: (req: Request, res: Response) => {
            res.status(429).json({
                error: { code: "RATE_LIMITED", message: "Too many authentication attempts", requestId: req.requestId },
            });
        },
    }));
    app.use("/api/v1/operations/auth/login", rateLimit({
        windowMs: 15 * 60_000,
        limit: 10,
        skip: () => getConfig().NODE_ENV === "test",
        standardHeaders: "draft-7",
        legacyHeaders: false,
        handler: (req: Request, res: Response) => {
            res.status(429).json({
                error: { code: "RATE_LIMITED", message: "Too many administrator sign-in attempts", requestId: req.requestId },
            });
        },
    }));
    app.use("/api/v1", routes);
    app.get("/health", (_req: Request, res: Response) => res.json({ status: "ok" }));
    app.get("/health/live", (_req: Request, res: Response) => res.json({ status: "ok" }));
    app.get("/health/ready", (_req: Request, res: Response) => {
        if (mongoose.connection.readyState !== 1) {
            res.status(503).json({ status: "not_ready", dependencies: { mongodb: "unavailable" } });
            return;
        }
        res.json({ status: "ready", dependencies: { mongodb: "ok" } });
    });
    app.get("/api/openapi.yaml", (_req: Request, res: Response) => {
        res.type("text/yaml").sendFile(path.resolve(__dirname, "../openapi.yaml"));
    });
    app.get("/api/docs", (_req: Request, res: Response) => {
        res.type("html").send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CalmWork API</title><style>body{font:16px system-ui;max-width:760px;margin:4rem auto;padding:0 1.5rem;color:#172222}code{background:#edf3f1;padding:.2rem .4rem;border-radius:4px}a{color:#087d6e}</style></head><body><h1>CalmWork API</h1><p>Versioned API base path: <code>/api/v1</code></p><p>OpenAPI 3 specification: <a href="/api/openapi.yaml">openapi.yaml</a></p><p>Health checks: <code>/api/v1/health/live</code> and <code>/api/v1/health/ready</code>.</p><p>Authentication uses short-lived bearer access tokens and a rotating, HTTP-only refresh cookie.</p></body></html>`);
    });
    app.use(notFoundHandler);
    app.use(errorHandler);
    return app;
}

let databaseConnection: Promise<void> | undefined;

export function ensureDatabaseConnected(): Promise<void> {
    if (!databaseConnection) {
        databaseConnection = connectDatabase().catch((error: unknown) => {
            databaseConnection = undefined;
            throw error;
        });
    }
    return databaseConnection;
}

export default createApp({ ensureDatabaseConnected });
