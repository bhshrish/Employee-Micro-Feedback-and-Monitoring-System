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
exports.webhook = exports.currentSubscription = exports.availablePlans = exports.listInvoices = exports.cancel = exports.checkout = void 0;
const async_handler_1 = __importStar(require("../utils/async-handler"));
const billing_service_1 = __importStar(require("../services/billing.service"));
const errors_1 = __importStar(require("../utils/errors"));
exports.checkout = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const result = await (0, billing_service_1.createCheckout)(req.auth.userId, req.body.plan, req.body.cycle);
    res.status(201).json({ ...result, data: result });
});
exports.cancel = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    res.json(await (0, billing_service_1.cancelSubscription)(req.auth.userId));
});
exports.listInvoices = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    res.json({ invoices: await (0, billing_service_1.invoices)(req.auth.userId) });
});
exports.availablePlans = (0, async_handler_1.asyncHandler)(async (_req, res) => {
    res.json({ plans: (0, billing_service_1.plans)() });
});
exports.currentSubscription = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    res.json({ subscription: await (0, billing_service_1.subscription)(req.auth.userId) });
});
exports.webhook = (0, async_handler_1.asyncHandler)(async (req, res) => {
    // MANUAL SETUP REQUIRED: configure Razorpay webhooks to target /api/v1/webhooks/razorpay.
    const verified = (0, billing_service_1.verifyRazorpaySignature)(req.body, req.get("x-razorpay-signature"));
    const result = await (0, billing_service_1.processRazorpayEvent)(verified.event, verified.eventId);
    res.json({ received: true, duplicate: result.duplicate });
});
