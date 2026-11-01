"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
var node_crypto_1 = require("node:crypto");
var node_path_1 = require("node:path");
var mongoose_1 = require("mongoose");
var express_1 = require("express");
var cookie_parser_1 = require("cookie-parser");
var cors_1 = require("cors");
var helmet_1 = require("helmet");
var pino_http_1 = require("pino-http");
var express_rate_limit_1 = require("express-rate-limit");
var env_1 = require("./config/env");
var logger_1 = require("./utils/logger");
var errors_1 = require("./middleware/errors");
var validate_1 = require("./middleware/validate");
var routes_1 = require("./routes");
var billing_controller_1 = require("./controllers/billing.controller");
function createApp() {
    var config = (0, env_1.getConfig)();
    var app = (0, express_1.default)();
    app.disable("x-powered-by");
    if (config.NODE_ENV === "production")
        app.set("trust proxy", 1);
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        credentials: true,
        origin: function (origin, callback) {
            if (!origin || config.CORS_ORIGINS.split(",").map(function (item) { return item.trim(); }).includes(origin)) {
                callback(null, true);
                return;
            }
            callback(new Error("Origin is not allowed by CORS"));
        },
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID", "Stripe-Signature"],
    }));
    app.use((0, pino_http_1.default)({
        logger: logger_1.logger,
        serializers: {
            req: function (req) {
                var _a;
                return ({
                    id: req.id,
                    method: req.method,
                    url: ((_a = req.url) !== null && _a !== void 0 ? _a : "").split("?")[0],
                });
            },
        },
        genReqId: function (_req, res) {
            var requestId = (0, node_crypto_1.randomUUID)();
            res.setHeader("X-Request-ID", requestId);
            return requestId;
        },
        customProps: function (req) { return ({ requestId: String(req.id) }); },
        autoLogging: { ignore: function (req) { return req.url.startsWith("/api/v1/health/"); } },
    }));
    app.use(function (req, _res, next) {
        req.requestId = String(req.id);
        next();
    });
    app.use("/api/v1/billing/webhook", express_1.default.raw({ type: "application/json", limit: "1mb" }), billing_controller_1.webhook);
    app.use("/api/v1/webhooks/stripe", express_1.default.raw({ type: "application/json", limit: "1mb" }), billing_controller_1.webhook);
    app.use(express_1.default.json({ limit: "64kb", strict: true }));
    app.use((0, cookie_parser_1.default)());
    app.use(validate_1.sanitizeBody);
    app.use("/api/v1", (0, express_rate_limit_1.default)({
        windowMs: 60000,
        limit: 300,
        standardHeaders: "draft-7",
        legacyHeaders: false,
        skip: function (req) { return req.path.startsWith("/health/"); },
        handler: function (req, res) { return res.status(429).json({
            error: { code: "RATE_LIMITED", message: "Too many requests", requestId: req.requestId },
        }); },
    }));
    app.use("/api/v1", function (_req, res, next) {
        res.setHeader("Cache-Control", "no-store");
        next();
    });
    app.use("/api/v1", function (req, res, next) {
        var originalJson = res.json;
        res.json = new Proxy(originalJson, {
            apply: function (target, thisArg, args) {
                var body = args[0];
                if (req.path.startsWith("/health/"))
                    return Reflect.apply(target, thisArg, args);
                if (body && typeof body === "object" && !Array.isArray(body) && !("error" in body) && !("data" in body)) {
                    args[0] = __assign(__assign({}, body), { data: body });
                }
                else if (Array.isArray(body)) {
                    args[0] = { data: body };
                }
                return Reflect.apply(target, thisArg, args);
            },
        });
        next();
    });
    app.use("/api/v1/auth", (0, express_rate_limit_1.default)({
        windowMs: 15 * 60000,
        limit: 30,
        standardHeaders: "draft-7",
        legacyHeaders: false,
        handler: function (req, res) { return res.status(429).json({
            error: { code: "RATE_LIMITED", message: "Too many authentication attempts", requestId: req.requestId },
        }); },
    }));
    app.use("/api/v1", routes_1.default);
    app.get("/health", function (_req, res) { return res.json({ status: "ok" }); });
    app.get("/health/live", function (_req, res) { return res.json({ status: "ok" }); });
    app.get("/health/ready", function (_req, res) {
        if (mongoose_1.default.connection.readyState !== 1) {
            res.status(503).json({ status: "not_ready", dependencies: { mongodb: "unavailable" } });
            return;
        }
        res.json({ status: "ready", dependencies: { mongodb: "ok" } });
    });
    app.get("/api/openapi.yaml", function (_req, res) {
        res.type("text/yaml").sendFile(node_path_1.default.resolve(__dirname, "../openapi.yaml"));
    });
    app.get("/api/docs", function (_req, res) {
        res.type("html").send("<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>PULSE API</title><style>body{font:16px system-ui;max-width:760px;margin:4rem auto;padding:0 1.5rem;color:#172222}code{background:#edf3f1;padding:.2rem .4rem;border-radius:4px}a{color:#087d6e}</style></head><body><h1>PULSE API</h1><p>Versioned API base path: <code>/api/v1</code></p><p>OpenAPI 3 specification: <a href=\"/api/openapi.yaml\">openapi.yaml</a></p><p>Health checks: <code>/api/v1/health/live</code> and <code>/api/v1/health/ready</code>.</p><p>Authentication uses short-lived bearer access tokens and a rotating, HTTP-only refresh cookie.</p></body></html>");
    });
    app.use(errors_1.notFoundHandler);
    app.use(errors_1.errorHandler);
    return app;
}
