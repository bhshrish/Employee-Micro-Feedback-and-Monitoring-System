import type { Request, Response } from "express";

interface AuthContext {
    userId: import("mongoose").Types.ObjectId;
    organizationId: import("mongoose").Types.ObjectId;
    teamId: import("mongoose").Types.ObjectId | null;
    role: "employee" | "manager" | "admin";
}

interface ControllerRequest extends Request {
    auth?: AuthContext;
    validatedQuery?: Record<string, string | number | undefined>;
}


import * as async_handler_1 from "../utils/async-handler";
import * as billing_service_1 from "../services/billing.service";
import * as errors_1 from "../utils/errors";
export const checkout = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    const result = await (0, billing_service_1.createCheckout)(req.auth.userId, req.body.plan, req.body.cycle);
    res.status(201).json({ ...result, data: result });
});
export const cancel = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    res.json(await (0, billing_service_1.cancelSubscription)(req.auth.userId));
});
export const listInvoices = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    res.json({ invoices: await (0, billing_service_1.invoices)(req.auth.userId) });
});
export const availablePlans = (0, async_handler_1.asyncHandler)(async (_req: ControllerRequest, res: Response) => {
    res.json({ plans: (0, billing_service_1.plans)() });
});
export const currentSubscription = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    if (!req.auth)
        throw (0, errors_1.unauthorized)();
    res.json({ subscription: await (0, billing_service_1.subscription)(req.auth.userId) });
});
export const webhook = (0, async_handler_1.asyncHandler)(async (req: ControllerRequest, res: Response) => {
    // MANUAL SETUP REQUIRED: configure Razorpay webhooks to target /api/v1/webhooks/razorpay.
    const verified = (0, billing_service_1.verifyRazorpaySignature)(req.body, req.get("x-razorpay-signature"));
    const result = await (0, billing_service_1.processRazorpayEvent)(verified.event, verified.eventId);
    res.json({ received: true, duplicate: result.duplicate });
});
