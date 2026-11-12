"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhook = exports.currentSubscription = exports.availablePlans = exports.listInvoices = exports.cancel = exports.checkout = void 0;
const async_handler_1 = require("../utils/async-handler");
const billing_service_1 = require("../services/billing.service");
const errors_1 = require("../utils/errors");
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
