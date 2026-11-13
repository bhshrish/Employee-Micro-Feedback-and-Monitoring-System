"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const node_crypto_1 = require("node:crypto");
const node_path_1 = __importDefault(require("node:path"));
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const pino_http_1 = __importDefault(require("pino-http"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const db_1 = require("./db");
const logger_1 = require("./utils/logger");
const errors_1 = require("./middleware/errors");
const validate_1 = require("./middleware/validate");
const routes_1 = __importDefault(require("./routes"));
const billing_controller_1 = require("./controllers/billing.controller");
function createApp({ ensureDatabaseConnected } = {}) {
    const config = (0, env_1.getConfig)();
    const app = (0, express_1.default)();
    app.disable("x-powered-by");
    if (config.NODE_ENV === "production")
        app.set("trust proxy", 1);
    app.use((0, helmet_1.default)());
    const allowedOrigins = config.CORS_ORIGINS.split(",").map((item) => item.trim().replace(/\/+$/, ""));
    app.use((0, cors_1.default)({
        credentials: true,
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }
            callback(new Error("Origin is not allowed by CORS"));
        },
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID", "X-Razorpay-Signature"],
    }));
    app.use((0, pino_http_1.default)({
        logger: logger_1.logger,
        serializers: {
            req: (req) => ({
                id: req.id,
                method: req.method,
                url: (req.url ?? "").split("?")[0],
            }),
        },
        genReqId(_req, res) {
            const requestId = (0, node_crypto_1.randomUUID)();
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
    if (ensureDatabaseConnected) {
        const healthPaths = new Set([
            "/health",
            "/health/live",
            "/health/ready",
            "/api/v1/health",
            "/api/v1/health/live",
            "/api/v1/health/ready",
        ]);
        app.use((req, _res, next) => {
            if (req.method === "GET" && healthPaths.has(req.path)) {
                next();
                return;
            }
            Promise.resolve()
                .then(ensureDatabaseConnected)
                .then(() => next(), next);
        });
    }
    app.use("/api/v1/webhooks/razorpay", express_1.default.raw({ type: "application/json", limit: "1mb" }), billing_controller_1.webhook);
    app.use(express_1.default.json({ limit: "64kb", strict: true }));
    app.use((0, cookie_parser_1.default)());
    app.use(validate_1.sanitizeBody);
    app.use("/api/v1", (0, express_rate_limit_1.default)({
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
            apply(target, thisArg, args) {
                const body = args[0];
                if (req.path.startsWith("/health/"))
                    return Reflect.apply(target, thisArg, args);
                if (body && typeof body === "object" && !Array.isArray(body)) {
                    if (body.error) {
                        args[0] = { ...body, success: false, data: body.data ?? null };
                    }
                    else {
                        args[0] = { success: true, data: body.data ?? body, error: body.error ?? null, ...body };
                    }
                }
                else if (Array.isArray(body)) {
                    args[0] = { success: true, data: body, error: null };
                }
                return Reflect.apply(target, thisArg, args);
            },
        });
        next();
    });
    app.use("/api/v1/auth", (0, express_rate_limit_1.default)({
        windowMs: 15 * 60_000,
        limit: 30,
        skip: () => (0, env_1.getConfig)().NODE_ENV === "test",
        standardHeaders: "draft-7",
        legacyHeaders: false,
        handler: (req, res) => res.status(429).json({
            error: { code: "RATE_LIMITED", message: "Too many authentication attempts", requestId: req.requestId },
        }),
    }));
    app.use("/api/v1/operations/auth/login", (0, express_rate_limit_1.default)({
        windowMs: 15 * 60_000,
        limit: 10,
        skip: () => (0, env_1.getConfig)().NODE_ENV === "test",
        standardHeaders: "draft-7",
        legacyHeaders: false,
        handler: (req, res) => res.status(429).json({
            error: { code: "RATE_LIMITED", message: "Too many administrator sign-in attempts", requestId: req.requestId },
        }),
    }));
    app.use("/api/v1", routes_1.default);
    app.get("/health", (_req, res) => res.json({ status: "ok" }));
    app.get("/health/live", (_req, res) => res.json({ status: "ok" }));
    app.get("/health/ready", (_req, res) => {
        if (mongoose_1.default.connection.readyState !== 1) {
            res.status(503).json({ status: "not_ready", dependencies: { mongodb: "unavailable" } });
            return;
        }
        res.json({ status: "ready", dependencies: { mongodb: "ok" } });
    });
    app.get("/api/openapi.yaml", (_req, res) => {
        res.type("text/yaml").sendFile(node_path_1.default.resolve(__dirname, "../openapi.yaml"));
    });
    app.get("/api/docs", (_req, res) => {
        res.type("html").send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CalmWork API</title><style>body{font:16px system-ui;max-width:760px;margin:4rem auto;padding:0 1.5rem;color:#172222}code{background:#edf3f1;padding:.2rem .4rem;border-radius:4px}a{color:#087d6e}</style></head><body><h1>CalmWork API</h1><p>Versioned API base path: <code>/api/v1</code></p><p>OpenAPI 3 specification: <a href="/api/openapi.yaml">openapi.yaml</a></p><p>Health checks: <code>/api/v1/health/live</code> and <code>/api/v1/health/ready</code>.</p><p>Authentication uses short-lived bearer access tokens and a rotating, HTTP-only refresh cookie.</p></body></html>`);
    });
    app.use(errors_1.notFoundHandler);
    app.use(errors_1.errorHandler);
    return app;
}
let databaseConnection;
function ensureDatabaseConnected() {
    if (!databaseConnection) {
        databaseConnection = (0, db_1.connectDatabase)().catch((error) => {
            databaseConnection = undefined;
            throw error;
        });
    }
    return databaseConnection;
}
exports.ensureDatabaseConnected = ensureDatabaseConnected;
exports.default = createApp({ ensureDatabaseConnected });
