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
exports.stop = exports.resume = exports.pause = exports.summary = exports.history = exports.tags = exports.idle = exports.heartbeat = exports.start = exports.dashboard = void 0;
const async_handler_1 = require("../utils/async-handler");
const activity = __importStar(require("../services/activity.service"));
const errors_1 = require("../utils/errors");
exports.dashboard = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const query = req.validatedQuery;
    res.json(await activity.dashboard(req.auth.userId, req.auth.organizationId, query.range));
});
exports.start = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const session = await activity.startActivity(req.auth, req.body);
    res.status(201).json({ session });
});
exports.heartbeat = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const sessionId = req.params.sessionId ?? req.body?.sessionId;
    const session = await activity.heartbeatActivity(req.auth.userId, req.auth.organizationId, sessionId);
    res.json({ session });
});
exports.idle = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const session = await activity.setActivityIdle(req.auth.userId, req.auth.organizationId, req.params.sessionId, req.body.idle);
    res.json({ session });
});
exports.tags = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const session = await activity.setActivityTags(req.auth.userId, req.auth.organizationId, req.params.sessionId, req.body);
    res.json({ session });
});
exports.history = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const query = req.validatedQuery;
    const result = await activity.activityHistory(req.auth.userId, req.auth.organizationId, query);
    res.json({ ...result, data: result });
});
exports.summary = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const query = req.validatedQuery;
    const dashboard = await activity.dashboard(req.auth.userId, req.auth.organizationId, query.range);
    res.json({ range: dashboard.range, summary: dashboard.summary });
});
exports.pause = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const session = await activity.pauseActivity(req.auth.userId, req.auth.organizationId, req.params.sessionId);
    res.json({ session });
});
exports.resume = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const session = await activity.resumeActivity(req.auth.userId, req.auth.organizationId, req.params.sessionId);
    res.json({ session });
});
exports.stop = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const session = await activity.finishActivity(req.auth.userId, req.auth.organizationId, req.params.sessionId);
    res.json({ session });
});
