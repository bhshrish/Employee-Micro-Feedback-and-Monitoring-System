"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
var pino_1 = require("pino");
var env_1 = require("../config/env");
exports.logger = (0, pino_1.default)({
    level: (0, env_1.getConfig)().LOG_LEVEL,
    redact: {
        paths: ["req.headers.authorization", "req.headers.cookie", "req.body", "res.headers['set-cookie']"],
        censor: "[REDACTED]",
    },
});
