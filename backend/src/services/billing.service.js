"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckout = createCheckout;
exports.cancelSubscription = cancelSubscription;
exports.invoices = invoices;
exports.plans = plans;
exports.subscription = subscription;
exports.createPortalSession = createPortalSession;
exports.processStripeEvent = processStripeEvent;
exports.verifyStripeSignature = verifyStripeSignature;
const stripe_1 = __importDefault(require("stripe"));
const env_1 = require("../config/env");
const ProcessedWebhook_1 = require("../models/ProcessedWebhook");
const User_1 = require("../models/User");
const Organization_1 = require("../models/Organization");
const Invoice_1 = require("../models/Invoice");
const AuditLog_1 = require("../models/AuditLog");
const errors_1 = require("../utils/errors");
async function billingOwner(userId) {
    const member = await User_1.User.findById(userId).select("organizationId");
    if (!member)
        throw (0, errors_1.notFound)();
    const organization = await Organization_1.Organization.findById(member.organizationId).select("ownerId");
    const owner = organization
        ? await User_1.User.findOne({ _id: organization.ownerId, organizationId: member.organizationId }).select("email organizationId subscription")
        : null;
    if (!owner)
        throw (0, errors_1.notFound)("Workspace billing account not found");
    return owner;
}
async function updateWorkspaceSubscription(organizationId, updates) {
    const result = await User_1.User.updateMany({ organizationId }, { $set: updates });
    if (!result.matchedCount)
        throw new Error("Workspace billing account was not found");
}
function stripeClient() {
    const key = (0, env_1.getConfig)().STRIPE_SECRET_KEY;
    if (!key)
        throw new Error("Billing provider is not configured");
    return new stripe_1.default(key);
}
function stripePrice(plan, cycle) {
    const key = `STRIPE_PRICE_${plan.toUpperCase()}_${cycle.toUpperCase()}`;
    const price = (0, env_1.getConfig)()[key];
    if (typeof price !== "string" || !price)
        throw new Error("Selected plan is not configured for checkout");
    return price;
}
async function createCheckout(userId, plan, cycle) {
    const user = await billingOwner(userId);
    const params = {
        mode: "subscription",
        line_items: [{ price: stripePrice(plan, cycle), quantity: 1 }],
        success_url: `${(0, env_1.getConfig)().FRONTEND_URL}/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${(0, env_1.getConfig)().FRONTEND_URL}/checkout?checkout=cancelled`,
        client_reference_id: user._id.toString(),
        metadata: { userId: user._id.toString(), organizationId: user.organizationId.toString(), plan, cycle },
        subscription_data: { metadata: { userId: user._id.toString(), organizationId: user.organizationId.toString(), plan, cycle } },
        ...(user.subscription.stripeCustomerId ? { customer: user.subscription.stripeCustomerId } : { customer_email: user.email }),
    };
    const session = await stripeClient().checkout.sessions.create(params, { idempotencyKey: `checkout:${user._id}:${plan}:${cycle}:${Math.floor(Date.now() / 60_000)}` });
    await AuditLog_1.AuditLog.create({
        organizationId: user.organizationId,
        actorId: userId,
        action: "billing.checkout_started",
        targetType: "subscription",
        targetId: session.id,
        details: { plan, cycle },
    });
    return { checkoutUrl: session.url, sessionId: session.id };
}
async function cancelSubscription(userId) {
    const user = await billingOwner(userId);
    const subscriptionId = user.subscription.stripeSubscriptionId;
    if (!subscriptionId)
        throw (0, errors_1.badRequest)("No active subscription to cancel");
    const subscription = await stripeClient().subscriptions.update(subscriptionId, { cancel_at_period_end: true });
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    await updateWorkspaceSubscription(user.organizationId, {
        "subscription.currentPeriodEnd": currentPeriodEnd,
        "subscription.cancelAtPeriodEnd": subscription.cancel_at_period_end,
    });
    await AuditLog_1.AuditLog.create({
        organizationId: user.organizationId,
        actorId: userId,
        action: "billing.cancellation_scheduled",
        targetType: "subscription",
        targetId: subscriptionId,
    });
    return { status: subscription.status, cancelAtPeriodEnd: subscription.cancel_at_period_end, currentPeriodEnd };
}
async function invoices(userId) {
    const user = await billingOwner(userId);
    return Invoice_1.Invoice.find({ organizationId: user.organizationId })
        .select("-organizationId -__v")
        .sort({ issuedAt: -1 })
        .limit(50)
        .lean();
}
function plans() {
    const config = (0, env_1.getConfig)();
    return ["Starter", "Team", "Business"].map((plan) => ({
        name: plan,
        monthlyPrice: plan === "Starter" ? 8 : plan === "Team" ? 16 : 28,
        cycles: {
            monthly: { available: Boolean(config[`STRIPE_PRICE_${plan.toUpperCase()}_MONTHLY`]) },
            yearly: { available: Boolean(config[`STRIPE_PRICE_${plan.toUpperCase()}_YEARLY`]) },
        },
        features: plan === "Starter"
            ? ["Personal activity tracking", "Weekly pulse"]
            : plan === "Team"
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
async function createPortalSession(userId) {
    const user = await billingOwner(userId);
    if (!user.subscription.stripeCustomerId)
        throw (0, errors_1.badRequest)("No billing customer is configured");
    const session = await stripeClient().billingPortal.sessions.create({
        customer: user.subscription.stripeCustomerId,
        return_url: `${(0, env_1.getConfig)().FRONTEND_URL}/billing`,
    });
    return { portalUrl: session.url };
}
async function processStripeEvent(event) {
    try {
        await ProcessedWebhook_1.ProcessedWebhook.create({ eventId: event.id, eventType: event.type });
    }
    catch (error) {
        if (error && typeof error === "object" && "code" in error && error.code === 11000) {
            const previous = await ProcessedWebhook_1.ProcessedWebhook.findOne({ eventId: event.id });
            if (previous?.status === "processed")
                return { duplicate: true };
            if (previous && previous.createdAt.getTime() < Date.now() - 60_000) {
                const removed = await ProcessedWebhook_1.ProcessedWebhook.deleteOne({ _id: previous._id, status: "processing" });
                if (removed.deletedCount)
                    return processStripeEvent(event);
            }
            throw new errors_1.AppError(503, "Webhook event is being processed; retry later", "WEBHOOK_PROCESSING");
        }
        throw error;
    }
    try {
        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const userId = session.metadata?.userId ?? session.client_reference_id;
            const plan = session.metadata?.plan;
            if (!userId || !["Starter", "Team", "Business"].includes(plan ?? ""))
                throw new Error("Checkout event is missing valid metadata");
            const owner = session.metadata?.organizationId
                ? await User_1.User.findOne({ _id: userId, organizationId: session.metadata.organizationId }).select("organizationId")
                : await User_1.User.findById(userId).select("organizationId");
            if (!owner)
                throw new Error("Checkout event has no matching workspace");
            await updateWorkspaceSubscription(owner.organizationId, {
                "subscription.plan": plan,
                "subscription.status": "active",
                "subscription.stripeCustomerId": typeof session.customer === "string" ? session.customer : null,
                "subscription.stripeSubscriptionId": typeof session.subscription === "string" ? session.subscription : null,
            });
        }
        else if (event.type.startsWith("customer.subscription.")) {
            const subscription = event.data.object;
            const userId = subscription.metadata?.userId;
            const organizationId = subscription.metadata?.organizationId;
            const owner = organizationId
                ? await User_1.User.findOne({ organizationId }).select("organizationId")
                : userId
                    ? await User_1.User.findById(userId).select("organizationId")
                    : typeof subscription.customer === "string"
                        ? await User_1.User.findOne({ "subscription.stripeCustomerId": subscription.customer }).select("organizationId")
                        : null;
            if (!owner)
                throw new Error("Subscription event has no matching workspace");
            const status = subscription.status === "active" || subscription.status === "trialing"
                ? "active"
                : subscription.status === "canceled" || subscription.status === "incomplete_expired" ? "canceled" : "trial_expired";
            await updateWorkspaceSubscription(owner.organizationId, {
                "subscription.status": status,
                "subscription.stripeSubscriptionId": subscription.id,
                "subscription.currentPeriodEnd": new Date(subscription.current_period_end * 1000),
                "subscription.cancelAtPeriodEnd": subscription.cancel_at_period_end,
            });
        }
        else if (event.type === "invoice.payment_failed") {
            const invoice = event.data.object;
            if (typeof invoice.customer === "string") {
                const owner = await User_1.User.findOne({ "subscription.stripeCustomerId": invoice.customer }).select("organizationId");
                if (owner) {
                    await updateWorkspaceSubscription(owner.organizationId, { "subscription.status": "trial_expired" });
                    await persistInvoice(owner.organizationId, invoice);
                }
            }
        }
        else if (event.type === "invoice.paid" || event.type === "invoice.payment_succeeded") {
            const invoice = event.data.object;
            if (typeof invoice.customer === "string") {
                const owner = await User_1.User.findOne({ "subscription.stripeCustomerId": invoice.customer }).select("organizationId");
                if (owner) {
                    await persistInvoice(owner.organizationId, invoice);
                    await updateWorkspaceSubscription(owner.organizationId, { "subscription.status": "active" });
                }
            }
        }
        else if (event.type === "customer.deleted") {
            const customer = event.data.object;
            await User_1.User.updateMany({ "subscription.stripeCustomerId": customer.id }, { $set: {
                    "subscription.stripeCustomerId": null,
                    "subscription.stripeSubscriptionId": null,
                    "subscription.status": "canceled",
                    "subscription.cancelAtPeriodEnd": false,
                } });
        }
        await ProcessedWebhook_1.ProcessedWebhook.updateOne({ eventId: event.id, status: "processing" }, { $set: { status: "processed", processedAt: new Date() } });
        return { duplicate: false };
    }
    catch (error) {
        await ProcessedWebhook_1.ProcessedWebhook.deleteOne({ eventId: event.id, status: "processing" });
        throw error;
    }
}
async function persistInvoice(organizationId, invoice) {
    await Invoice_1.Invoice.findOneAndUpdate({ organizationId, stripeInvoiceId: invoice.id }, {
        $set: {
            number: invoice.number,
            currency: invoice.currency,
            amountDue: invoice.amount_due,
            amountPaid: invoice.amount_paid,
            status: invoice.status ?? "unknown",
            hostedInvoiceUrl: invoice.hosted_invoice_url,
            invoicePdfUrl: invoice.invoice_pdf,
            periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
            periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
            issuedAt: new Date(invoice.created * 1000),
        },
    }, { upsert: true, new: true, setDefaultsOnInsert: true });
}
function verifyStripeSignature(payload, signature) {
    const secret = (0, env_1.getConfig)().STRIPE_WEBHOOK_SECRET;
    if (!secret)
        throw (0, errors_1.forbidden)("Billing webhook is not configured");
    if (!signature)
        throw (0, errors_1.badRequest)("Missing Stripe signature");
    try {
        return stripeClient().webhooks.constructEvent(payload, signature, secret);
    }
    catch {
        throw (0, errors_1.badRequest)("Invalid Stripe signature");
    }
}
