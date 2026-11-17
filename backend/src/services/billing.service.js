"use strict";
const { createHmac, createHash, timingSafeEqual } = require("node:crypto");
const { getConfig } = require("../config/env");
const { ProcessedWebhook } = require("../models/ProcessedWebhook");
const { User } = require("../models/User");
const { Organization } = require("../models/Organization");
const { Invoice } = require("../models/Invoice");
const { AppError, badRequest, conflict, forbidden, notFound } = require("../utils/errors");

const PLAN_NAMES = ["Starter", "Team", "Business"];
const CYCLES = ["monthly", "yearly"];

async function billingOwner(userId) {
    const member = await User.findById(userId).select("organizationId");
    if (!member)
        throw notFound();
    const organization = await Organization.findById(member.organizationId).select("ownerId");
    const owner = organization
        ? await User.findOne({ _id: organization.ownerId, organizationId: member.organizationId }).select("email organizationId subscription")
        : null;
    if (!owner)
        throw notFound("Workspace billing account not found");
    return owner;
}

async function updateWorkspaceSubscription(organizationId, updates) {
    const result = await User.updateMany({ organizationId }, { $set: updates });
    if (!result.matchedCount)
        throw new Error("Workspace billing account was not found");
}

function planId(plan, cycle) {
    // MANUAL SETUP REQUIRED: create every recurring plan in Razorpay and set its ID in backend/.env.
    const id = getConfig()[`RAZORPAY_PLAN_${plan.toUpperCase()}_${cycle.toUpperCase()}`];
    if (!id)
        throw new AppError(503, "Selected plan is not configured for Razorpay.", "BILLING_NOT_CONFIGURED");
    return id;
}

function razorpayCredentials() {
    const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = getConfig();
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET)
        throw new AppError(503, "Razorpay billing is not configured.", "BILLING_NOT_CONFIGURED");
    return { keyId: RAZORPAY_KEY_ID, keySecret: RAZORPAY_KEY_SECRET };
}

async function razorpayRequest(path, { method = "GET", body } = {}) {
    const { keyId, keySecret } = razorpayCredentials();
    let response;
    try {
        response = await fetch(`https://api.razorpay.com/v1${path}`, {
            method,
            headers: {
                Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
                ...(body ? { "Content-Type": "application/json" } : {}),
            },
            ...(body ? { body: JSON.stringify(body) } : {}),
            signal: globalThis.AbortSignal.timeout(10_000),
        });
    }
    catch {
        throw new AppError(502, "Could not reach Razorpay. Please try again.", "BILLING_PROVIDER_UNAVAILABLE");
    }
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        const message = payload.error?.description || "Razorpay could not complete the billing request.";
        throw new AppError(response.status >= 500 ? 502 : 400, message, "BILLING_PROVIDER_ERROR");
    }
    return payload;
}

async function createCheckout(userId, plan, cycle) {
    if (!PLAN_NAMES.includes(plan) || !CYCLES.includes(cycle))
        throw badRequest("Selected plan or billing cycle is invalid");
    const user = await billingOwner(userId);
    if (user.subscription.status === "active" && !user.subscription.cancelAtPeriodEnd)
        throw conflict("This workspace already has an active subscription", "SUBSCRIPTION_ACTIVE");
    const razorpayPlanId = planId(plan, cycle);
    const totalCount = cycle === "monthly" ? 120 : 10;
    const subscription = await razorpayRequest("/subscriptions", {
        method: "POST",
        body: {
            plan_id: razorpayPlanId,
            total_count: totalCount,
            quantity: 1,
            customer_notify: 1,
            notes: {
                userId: user._id.toString(),
                organizationId: user.organizationId.toString(),
                plan,
                cycle,
            },
        },
    });
    if (!subscription.short_url || !subscription.id)
        throw new AppError(502, "Razorpay did not return a checkout link.", "BILLING_PROVIDER_ERROR");
    await updateWorkspaceSubscription(user.organizationId, {
        "subscription.plan": plan,
        "subscription.razorpaySubscriptionId": subscription.id,
        "subscription.razorpayPlanId": razorpayPlanId,
        "subscription.cancelAtPeriodEnd": false,
    });
    return { checkoutUrl: subscription.short_url, subscriptionId: subscription.id };
}

async function cancelSubscription(userId) {
    const user = await billingOwner(userId);
    const subscriptionId = user.subscription.razorpaySubscriptionId;
    if (!subscriptionId)
        throw badRequest("No active subscription to cancel");
    const subscription = await razorpayRequest(`/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`, {
        method: "POST",
        body: { cancel_at_cycle_end: 1 },
    });
    const currentPeriodEnd = subscription.current_end ? new Date(subscription.current_end * 1000) : user.subscription.currentPeriodEnd;
    await updateWorkspaceSubscription(user.organizationId, {
        "subscription.currentPeriodEnd": currentPeriodEnd,
        "subscription.cancelAtPeriodEnd": true,
    });
    return { status: subscription.status, cancelAtPeriodEnd: true, currentPeriodEnd };
}

async function invoices(userId) {
    const user = await billingOwner(userId);
    const records = await Invoice.find({ organizationId: user.organizationId })
        .select("-organizationId -__v")
        .sort({ issuedAt: -1 })
        .limit(50)
        .lean();
    return records.map((invoice) => ({
        id: invoice.number || invoice.providerInvoiceId || invoice.stripeInvoiceId,
        date: new Date(invoice.issuedAt).toLocaleDateString(),
        amount: new Intl.NumberFormat(undefined, { style: "currency", currency: invoice.currency.toUpperCase() })
            .format((invoice.amountPaid || invoice.amountDue) / 100),
        status: invoice.status,
        hostedInvoiceUrl: invoice.hostedInvoiceUrl,
        invoicePdfUrl: invoice.invoicePdfUrl,
    }));
}

function plans() {
    const config = getConfig();
    return PLAN_NAMES.map((name) => ({
        name,
        monthlyPrice: name === "Starter" ? 8 : name === "Team" ? 16 : 28,
        cycles: {
            monthly: { available: Boolean(config[`RAZORPAY_PLAN_${name.toUpperCase()}_MONTHLY`]) },
            yearly: { available: Boolean(config[`RAZORPAY_PLAN_${name.toUpperCase()}_YEARLY`]) },
        },
        features: name === "Starter"
            ? ["Personal activity tracking", "Weekly pulse"]
            : name === "Team"
                ? ["Personal activity tracking", "Anonymous team scorecards", "Burnout-risk alerts", "CSV & PDF reports"]
                : ["Everything in Team", "Advanced analytics", "Unlimited teams"],
    }));
}

async function subscription(userId) {
    const user = await billingOwner(userId);
    const value = user.subscription.toObject();
    if (value.status === "trialing" && value.trialEndsAt <= new Date()) {
        value.status = "trial_expired";
        await updateWorkspaceSubscription(user.organizationId, { "subscription.status": "trial_expired" });
    }
    return {
        plan: value.plan,
        status: value.status,
        trialEndsAt: value.trialEndsAt,
        currentPeriodEnd: value.currentPeriodEnd,
        cancelAtPeriodEnd: value.cancelAtPeriodEnd,
    };
}

function verifyRazorpaySignature(payload, signature) {
    const secret = getConfig().RAZORPAY_WEBHOOK_SECRET;
    if (!secret)
        throw forbidden("Razorpay webhook is not configured");
    if (!signature || !Buffer.isBuffer(payload))
        throw badRequest("Missing Razorpay signature or raw request body");
    const expected = createHmac("sha256", secret).update(payload).digest();
    let actual;
    try {
        actual = Buffer.from(signature, "hex");
    }
    catch {
        throw badRequest("Invalid Razorpay signature");
    }
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
        throw badRequest("Invalid Razorpay signature");
    try {
        return { event: JSON.parse(payload.toString("utf8")), eventId: createHash("sha256").update(payload).digest("hex") };
    }
    catch {
        throw badRequest("Invalid Razorpay webhook payload");
    }
}

async function persistPayment(organizationId, payment) {
    if (!payment?.id)
        return;
    await Invoice.findOneAndUpdate({ organizationId, providerInvoiceId: payment.id }, {
        $set: {
            stripeInvoiceId: payment.id,
            number: payment.invoice_id || payment.id,
            currency: payment.currency || "INR",
            amountDue: payment.amount || 0,
            amountPaid: payment.amount || 0,
            status: payment.status || "paid",
            hostedInvoiceUrl: payment.invoice_url || null,
            invoicePdfUrl: null,
            periodStart: null,
            periodEnd: null,
            issuedAt: payment.created_at ? new Date(payment.created_at * 1000) : new Date(),
        },
    }, { upsert: true, new: true, setDefaultsOnInsert: true });
}

async function processRazorpayEvent(event, eventId) {
    try {
        await ProcessedWebhook.create({ eventId, eventType: event.event });
    }
    catch (error) {
        if (error && typeof error === "object" && "code" in error && error.code === 11000) {
            const previous = await ProcessedWebhook.findOne({ eventId });
            if (previous?.status === "processed")
                return { duplicate: true };
            if (previous && previous.createdAt.getTime() < Date.now() - 60_000) {
                const removed = await ProcessedWebhook.deleteOne({ _id: previous._id, status: "processing" });
                if (removed.deletedCount)
                    return processRazorpayEvent(event, eventId);
            }
            throw new AppError(503, "Webhook event is being processed; retry later", "WEBHOOK_PROCESSING");
        }
        throw error;
    }
    try {
        const subscription = event.payload?.subscription?.entity;
        const payment = event.payload?.payment?.entity;
        if (subscription && ["subscription.activated", "subscription.charged", "subscription.halted", "subscription.paused", "subscription.cancelled", "subscription.completed"].includes(event.event)) {
            const organizationId = subscription.notes?.organizationId;
            if (!organizationId)
                throw new Error("Razorpay subscription event is missing workspace metadata");
            const status = event.event === "subscription.activated" || event.event === "subscription.charged"
                ? "active"
                : event.event === "subscription.cancelled" || event.event === "subscription.completed"
                    ? "canceled"
                    : "trial_expired";
            await updateWorkspaceSubscription(organizationId, {
                "subscription.status": status,
                "subscription.razorpaySubscriptionId": subscription.id,
                "subscription.plan": subscription.notes.plan,
                "subscription.currentPeriodEnd": subscription.current_end ? new Date(subscription.current_end * 1000) : null,
                "subscription.cancelAtPeriodEnd": event.event === "subscription.cancelled",
            });
            if (payment && event.event === "subscription.charged")
                await persistPayment(organizationId, payment);
        }
        else if (event.event === "payment.failed" && payment?.subscription_id) {
            const owner = await User.findOne({ "subscription.razorpaySubscriptionId": payment.subscription_id }).select("organizationId");
            if (owner)
                await updateWorkspaceSubscription(owner.organizationId, { "subscription.status": "trial_expired" });
        }
        await ProcessedWebhook.updateOne({ eventId, status: "processing" }, { $set: { status: "processed", processedAt: new Date() } });
        return { duplicate: false };
    }
    catch (error) {
        await ProcessedWebhook.deleteOne({ eventId, status: "processing" });
        throw error;
    }
}

module.exports = {
    createCheckout,
    cancelSubscription,
    invoices,
    plans,
    subscription,
    processRazorpayEvent,
    verifyRazorpaySignature,
};
