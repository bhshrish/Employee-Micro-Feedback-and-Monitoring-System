"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhook = exports.portalSession = exports.currentSubscription = exports.availablePlans = exports.listInvoices = exports.cancel = exports.checkout = void 0;
const async_handler_1 = require("../utils/async-handler");
const billing_service_1 = require("../services/billing.service");
const http_1 = require("../utils/http");
const errors_1 = require("../utils/errors");
const billing_service_2 = require("../services/billing.service");
exports.checkout = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    try {
        const result = await (0, billing_service_1.createCheckout)(req.auth.userId, req.body.plan, req.body.cycle);
        res.status(201).json({ ...result, data: result });
    }
    catch (error) {
        if (error instanceof Error && /not configured/.test(error.message))
            throw (0, http_1.unavailable)(error.message);
        throw error;
    }
});
exports.cancel = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    res.json(await (0, billing_service_1.cancelSubscription)(req.auth.userId));
});
exports.listInvoices = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    try {
        res.json({ invoices: await (0, billing_service_1.invoices)(req.auth.userId) });
    }
    catch (error) {
        if (error instanceof Error && /not configured/.test(error.message))
            throw (0, http_1.unavailable)(error.message);
        throw error;
    }
});
exports.availablePlans = (0, async_handler_1.asyncHandler)(async (_req, res) => {
    res.json({ plans: (0, billing_service_2.plans)() });
});
exports.currentSubscription = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    res.json({ subscription: await (0, billing_service_2.subscription)(req.auth.userId) });
});
exports.portalSession = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    try {
        res.status(201).json(await (0, billing_service_2.createPortalSession)(req.auth.userId));
    }
    catch (error) {
        if (error instanceof Error && /not configured/.test(error.message))
            throw (0, http_1.unavailable)(error.message);
        throw error;
    }
});
exports.webhook = (0, async_handler_1.asyncHandler)(async (req, res) => {
    let event;
    try {
        event = (0, billing_service_1.verifyStripeSignature)(req.body, req.get("stripe-signature"));
    }
    catch (error) {
        if (error instanceof Error && /not configured/.test(error.message))
            throw (0, http_1.unavailable)(error.message);
        throw error;
    }
    const result = await (0, billing_service_1.processStripeEvent)(event);
    res.json({ received: true, duplicate: result.duplicate });
});
