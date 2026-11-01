import type Stripe from "stripe";
import { asyncHandler } from "../utils/async-handler";
import { createCheckout, cancelSubscription, invoices, processStripeEvent, verifyStripeSignature } from "../services/billing.service";
import { unavailable } from "../utils/http";
import { unauthorized } from "../utils/errors";
import { subscription, plans, createPortalSession } from "../services/billing.service";

export const checkout = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  try {
    const result = await createCheckout(req.auth.userId, req.body.plan, req.body.cycle);
    res.status(201).json({ ...result, data: result });
  } catch (error) {
    if (error instanceof Error && /not configured/.test(error.message)) throw unavailable(error.message);
    throw error;
  }
});

export const cancel = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  res.json(await cancelSubscription(req.auth.userId));
});

export const listInvoices = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  try {
    res.json({ invoices: await invoices(req.auth.userId) });
  } catch (error) {
    if (error instanceof Error && /not configured/.test(error.message)) throw unavailable(error.message);
    throw error;
  }
});

export const availablePlans = asyncHandler(async (_req, res) => {
  res.json({ plans: plans() });
});

export const currentSubscription = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  res.json({ subscription: await subscription(req.auth.userId) });
});

export const portalSession = asyncHandler(async (req, res) => {
  if (!req.auth) throw unauthorized();
  try {
    res.status(201).json(await createPortalSession(req.auth.userId));
  } catch (error) {
    if (error instanceof Error && /not configured/.test(error.message)) throw unavailable(error.message);
    throw error;
  }
});

export const webhook = asyncHandler(async (req, res) => {
  let event: Stripe.Event;
  try {
    event = verifyStripeSignature(req.body as Buffer, req.get("stripe-signature"));
  } catch (error) {
    if (error instanceof Error && /not configured/.test(error.message)) throw unavailable(error.message);
    throw error;
  }
  const result = await processStripeEvent(event);
  res.json({ received: true, duplicate: result.duplicate });
});
