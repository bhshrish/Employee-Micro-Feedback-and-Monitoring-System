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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var stripe_1 = require("stripe");
var env_1 = require("../config/env");
var ProcessedWebhook_1 = require("../models/ProcessedWebhook");
var User_1 = require("../models/User");
var Organization_1 = require("../models/Organization");
var Invoice_1 = require("../models/Invoice");
var errors_1 = require("../utils/errors");
function billingOwner(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var member, organization, owner, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, User_1.User.findById(userId).select("organizationId")];
                case 1:
                    member = _b.sent();
                    if (!member)
                        throw (0, errors_1.notFound)();
                    return [4 /*yield*/, Organization_1.Organization.findById(member.organizationId).select("ownerId")];
                case 2:
                    organization = _b.sent();
                    if (!organization) return [3 /*break*/, 4];
                    return [4 /*yield*/, User_1.User.findOne({ _id: organization.ownerId, organizationId: member.organizationId }).select("email organizationId subscription")];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = null;
                    _b.label = 5;
                case 5:
                    owner = _a;
                    if (!owner)
                        throw (0, errors_1.notFound)("Workspace billing account not found");
                    return [2 /*return*/, owner];
            }
        });
    });
}
function updateWorkspaceSubscription(organizationId, updates) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, User_1.User.updateMany({ organizationId: organizationId }, { $set: updates })];
                case 1:
                    result = _a.sent();
                    if (!result.matchedCount)
                        throw new Error("Workspace billing account was not found");
                    return [2 /*return*/];
            }
        });
    });
}
function stripeClient() {
    var key = (0, env_1.getConfig)().STRIPE_SECRET_KEY;
    if (!key)
        throw new Error("Billing provider is not configured");
    return new stripe_1.default(key);
}
function stripePrice(plan, cycle) {
    var key = "STRIPE_PRICE_".concat(plan.toUpperCase(), "_").concat(cycle.toUpperCase());
    var price = (0, env_1.getConfig)()[key];
    if (typeof price !== "string" || !price)
        throw new Error("Selected plan is not configured for checkout");
    return price;
}
function createCheckout(userId, plan, cycle) {
    return __awaiter(this, void 0, void 0, function () {
        var user, params, session;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, billingOwner(userId)];
                case 1:
                    user = _a.sent();
                    params = __assign({ mode: "subscription", line_items: [{ price: stripePrice(plan, cycle), quantity: 1 }], success_url: "".concat((0, env_1.getConfig)().FRONTEND_URL, "/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}"), cancel_url: "".concat((0, env_1.getConfig)().FRONTEND_URL, "/checkout?checkout=cancelled"), client_reference_id: user._id.toString(), metadata: { userId: user._id.toString(), organizationId: user.organizationId.toString(), plan: plan, cycle: cycle }, subscription_data: { metadata: { userId: user._id.toString(), organizationId: user.organizationId.toString(), plan: plan, cycle: cycle } } }, (user.subscription.stripeCustomerId ? { customer: user.subscription.stripeCustomerId } : { customer_email: user.email }));
                    return [4 /*yield*/, stripeClient().checkout.sessions.create(params, { idempotencyKey: "checkout:".concat(user._id, ":").concat(plan, ":").concat(cycle, ":").concat(Math.floor(Date.now() / 60000)) })];
                case 2:
                    session = _a.sent();
                    return [2 /*return*/, { checkoutUrl: session.url, sessionId: session.id }];
            }
        });
    });
}
function cancelSubscription(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var user, subscriptionId, subscription, currentPeriodEnd;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, billingOwner(userId)];
                case 1:
                    user = _a.sent();
                    subscriptionId = user.subscription.stripeSubscriptionId;
                    if (!subscriptionId)
                        throw (0, errors_1.badRequest)("No active subscription to cancel");
                    return [4 /*yield*/, stripeClient().subscriptions.update(subscriptionId, { cancel_at_period_end: true })];
                case 2:
                    subscription = _a.sent();
                    currentPeriodEnd = new Date(subscription.current_period_end * 1000);
                    return [4 /*yield*/, updateWorkspaceSubscription(user.organizationId, {
                            "subscription.currentPeriodEnd": currentPeriodEnd,
                            "subscription.cancelAtPeriodEnd": subscription.cancel_at_period_end,
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/, { status: subscription.status, cancelAtPeriodEnd: subscription.cancel_at_period_end, currentPeriodEnd: currentPeriodEnd }];
            }
        });
    });
}
function invoices(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, billingOwner(userId)];
                case 1:
                    user = _a.sent();
                    return [2 /*return*/, Invoice_1.Invoice.find({ organizationId: user.organizationId })
                            .select("-organizationId -__v")
                            .sort({ issuedAt: -1 })
                            .limit(50)
                            .lean()];
            }
        });
    });
}
function plans() {
    var config = (0, env_1.getConfig)();
    return ["Starter", "Team", "Business"].map(function (plan) { return ({
        name: plan,
        monthlyPrice: plan === "Starter" ? 8 : plan === "Team" ? 16 : 28,
        cycles: {
            monthly: { available: Boolean(config["STRIPE_PRICE_".concat(plan.toUpperCase(), "_MONTHLY")]) },
            yearly: { available: Boolean(config["STRIPE_PRICE_".concat(plan.toUpperCase(), "_YEARLY")]) },
        },
        features: plan === "Starter"
            ? ["Personal activity tracking", "Weekly pulse"]
            : plan === "Team"
                ? ["Personal activity tracking", "Anonymous team scorecards", "Burnout-risk alerts", "CSV & PDF reports"]
                : ["Everything in Team", "Advanced analytics", "Unlimited teams"],
    }); });
}
function subscription(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var user, value;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, billingOwner(userId)];
                case 1:
                    user = _a.sent();
                    value = user.subscription.toObject();
                    if (!(value.status === "trialing" && value.trialEndsAt <= new Date())) return [3 /*break*/, 3];
                    value.status = "trial_expired";
                    return [4 /*yield*/, updateWorkspaceSubscription(user.organizationId, { "subscription.status": "trial_expired" })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/, {
                        plan: value.plan,
                        status: value.status,
                        trialEndsAt: value.trialEndsAt,
                        currentPeriodEnd: value.currentPeriodEnd,
                        cancelAtPeriodEnd: value.cancelAtPeriodEnd,
                    }];
            }
        });
    });
}
function createPortalSession(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var user, session;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, billingOwner(userId)];
                case 1:
                    user = _a.sent();
                    if (!user.subscription.stripeCustomerId)
                        throw (0, errors_1.badRequest)("No billing customer is configured");
                    return [4 /*yield*/, stripeClient().billingPortal.sessions.create({
                            customer: user.subscription.stripeCustomerId,
                            return_url: "".concat((0, env_1.getConfig)().FRONTEND_URL, "/billing"),
                        })];
                case 2:
                    session = _a.sent();
                    return [2 /*return*/, { portalUrl: session.url }];
            }
        });
    });
}
function processStripeEvent(event) {
    return __awaiter(this, void 0, void 0, function () {
        var error_1, previous, removed, session, userId, plan, owner, _a, subscription_1, userId, organizationId, owner, _b, _c, _d, status_1, invoice, owner, invoice, owner, customer, error_2;
        var _e, _f, _g, _h, _j, _k;
        return __generator(this, function (_l) {
            switch (_l.label) {
                case 0:
                    _l.trys.push([0, 2, , 7]);
                    return [4 /*yield*/, ProcessedWebhook_1.ProcessedWebhook.create({ eventId: event.id, eventType: event.type })];
                case 1:
                    _l.sent();
                    return [3 /*break*/, 7];
                case 2:
                    error_1 = _l.sent();
                    if (!(error_1 && typeof error_1 === "object" && "code" in error_1 && error_1.code === 11000)) return [3 /*break*/, 6];
                    return [4 /*yield*/, ProcessedWebhook_1.ProcessedWebhook.findOne({ eventId: event.id })];
                case 3:
                    previous = _l.sent();
                    if ((previous === null || previous === void 0 ? void 0 : previous.status) === "processed")
                        return [2 /*return*/, { duplicate: true }];
                    if (!(previous && previous.createdAt.getTime() < Date.now() - 60000)) return [3 /*break*/, 5];
                    return [4 /*yield*/, ProcessedWebhook_1.ProcessedWebhook.deleteOne({ _id: previous._id, status: "processing" })];
                case 4:
                    removed = _l.sent();
                    if (removed.deletedCount)
                        return [2 /*return*/, processStripeEvent(event)];
                    _l.label = 5;
                case 5: throw new errors_1.AppError(503, "Webhook event is being processed; retry later", "WEBHOOK_PROCESSING");
                case 6: throw error_1;
                case 7:
                    _l.trys.push([7, 38, , 40]);
                    if (!(event.type === "checkout.session.completed")) return [3 /*break*/, 13];
                    session = event.data.object;
                    userId = (_f = (_e = session.metadata) === null || _e === void 0 ? void 0 : _e.userId) !== null && _f !== void 0 ? _f : session.client_reference_id;
                    plan = (_g = session.metadata) === null || _g === void 0 ? void 0 : _g.plan;
                    if (!userId || !["Starter", "Team", "Business"].includes(plan !== null && plan !== void 0 ? plan : ""))
                        throw new Error("Checkout event is missing valid metadata");
                    if (!((_h = session.metadata) === null || _h === void 0 ? void 0 : _h.organizationId)) return [3 /*break*/, 9];
                    return [4 /*yield*/, User_1.User.findOne({ _id: userId, organizationId: session.metadata.organizationId }).select("organizationId")];
                case 8:
                    _a = _l.sent();
                    return [3 /*break*/, 11];
                case 9: return [4 /*yield*/, User_1.User.findById(userId).select("organizationId")];
                case 10:
                    _a = _l.sent();
                    _l.label = 11;
                case 11:
                    owner = _a;
                    if (!owner)
                        throw new Error("Checkout event has no matching workspace");
                    return [4 /*yield*/, updateWorkspaceSubscription(owner.organizationId, {
                            "subscription.plan": plan,
                            "subscription.status": "active",
                            "subscription.stripeCustomerId": typeof session.customer === "string" ? session.customer : null,
                            "subscription.stripeSubscriptionId": typeof session.subscription === "string" ? session.subscription : null,
                        })];
                case 12:
                    _l.sent();
                    return [3 /*break*/, 36];
                case 13:
                    if (!event.type.startsWith("customer.subscription.")) return [3 /*break*/, 24];
                    subscription_1 = event.data.object;
                    userId = (_j = subscription_1.metadata) === null || _j === void 0 ? void 0 : _j.userId;
                    organizationId = (_k = subscription_1.metadata) === null || _k === void 0 ? void 0 : _k.organizationId;
                    if (!organizationId) return [3 /*break*/, 15];
                    return [4 /*yield*/, User_1.User.findOne({ organizationId: organizationId }).select("organizationId")];
                case 14:
                    _b = _l.sent();
                    return [3 /*break*/, 22];
                case 15:
                    if (!userId) return [3 /*break*/, 17];
                    return [4 /*yield*/, User_1.User.findById(userId).select("organizationId")];
                case 16:
                    _c = _l.sent();
                    return [3 /*break*/, 21];
                case 17:
                    if (!(typeof subscription_1.customer === "string")) return [3 /*break*/, 19];
                    return [4 /*yield*/, User_1.User.findOne({ "subscription.stripeCustomerId": subscription_1.customer }).select("organizationId")];
                case 18:
                    _d = _l.sent();
                    return [3 /*break*/, 20];
                case 19:
                    _d = null;
                    _l.label = 20;
                case 20:
                    _c = _d;
                    _l.label = 21;
                case 21:
                    _b = _c;
                    _l.label = 22;
                case 22:
                    owner = _b;
                    if (!owner)
                        throw new Error("Subscription event has no matching workspace");
                    status_1 = subscription_1.status === "active" || subscription_1.status === "trialing"
                        ? "active"
                        : subscription_1.status === "canceled" || subscription_1.status === "incomplete_expired" ? "canceled" : "trial_expired";
                    return [4 /*yield*/, updateWorkspaceSubscription(owner.organizationId, {
                            "subscription.status": status_1,
                            "subscription.stripeSubscriptionId": subscription_1.id,
                            "subscription.currentPeriodEnd": new Date(subscription_1.current_period_end * 1000),
                            "subscription.cancelAtPeriodEnd": subscription_1.cancel_at_period_end,
                        })];
                case 23:
                    _l.sent();
                    return [3 /*break*/, 36];
                case 24:
                    if (!(event.type === "invoice.payment_failed")) return [3 /*break*/, 29];
                    invoice = event.data.object;
                    if (!(typeof invoice.customer === "string")) return [3 /*break*/, 28];
                    return [4 /*yield*/, User_1.User.findOne({ "subscription.stripeCustomerId": invoice.customer }).select("organizationId")];
                case 25:
                    owner = _l.sent();
                    if (!owner) return [3 /*break*/, 28];
                    return [4 /*yield*/, updateWorkspaceSubscription(owner.organizationId, { "subscription.status": "trial_expired" })];
                case 26:
                    _l.sent();
                    return [4 /*yield*/, persistInvoice(owner.organizationId, invoice)];
                case 27:
                    _l.sent();
                    _l.label = 28;
                case 28: return [3 /*break*/, 36];
                case 29:
                    if (!(event.type === "invoice.paid" || event.type === "invoice.payment_succeeded")) return [3 /*break*/, 34];
                    invoice = event.data.object;
                    if (!(typeof invoice.customer === "string")) return [3 /*break*/, 33];
                    return [4 /*yield*/, User_1.User.findOne({ "subscription.stripeCustomerId": invoice.customer }).select("organizationId")];
                case 30:
                    owner = _l.sent();
                    if (!owner) return [3 /*break*/, 33];
                    return [4 /*yield*/, persistInvoice(owner.organizationId, invoice)];
                case 31:
                    _l.sent();
                    return [4 /*yield*/, updateWorkspaceSubscription(owner.organizationId, { "subscription.status": "active" })];
                case 32:
                    _l.sent();
                    _l.label = 33;
                case 33: return [3 /*break*/, 36];
                case 34:
                    if (!(event.type === "customer.deleted")) return [3 /*break*/, 36];
                    customer = event.data.object;
                    return [4 /*yield*/, User_1.User.updateMany({ "subscription.stripeCustomerId": customer.id }, { $set: {
                                "subscription.stripeCustomerId": null,
                                "subscription.stripeSubscriptionId": null,
                                "subscription.status": "canceled",
                                "subscription.cancelAtPeriodEnd": false,
                            } })];
                case 35:
                    _l.sent();
                    _l.label = 36;
                case 36: return [4 /*yield*/, ProcessedWebhook_1.ProcessedWebhook.updateOne({ eventId: event.id, status: "processing" }, { $set: { status: "processed", processedAt: new Date() } })];
                case 37:
                    _l.sent();
                    return [2 /*return*/, { duplicate: false }];
                case 38:
                    error_2 = _l.sent();
                    return [4 /*yield*/, ProcessedWebhook_1.ProcessedWebhook.deleteOne({ eventId: event.id, status: "processing" })];
                case 39:
                    _l.sent();
                    throw error_2;
                case 40: return [2 /*return*/];
            }
        });
    });
}
function persistInvoice(organizationId, invoice) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Invoice_1.Invoice.findOneAndUpdate({ organizationId: organizationId, stripeInvoiceId: invoice.id }, {
                        $set: {
                            number: invoice.number,
                            currency: invoice.currency,
                            amountDue: invoice.amount_due,
                            amountPaid: invoice.amount_paid,
                            status: (_a = invoice.status) !== null && _a !== void 0 ? _a : "unknown",
                            hostedInvoiceUrl: invoice.hosted_invoice_url,
                            invoicePdfUrl: invoice.invoice_pdf,
                            periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
                            periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
                            issuedAt: new Date(invoice.created * 1000),
                        },
                    }, { upsert: true, new: true, setDefaultsOnInsert: true })];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function verifyStripeSignature(payload, signature) {
    var secret = (0, env_1.getConfig)().STRIPE_WEBHOOK_SECRET;
    if (!secret)
        throw (0, errors_1.forbidden)("Billing webhook is not configured");
    if (!signature)
        throw (0, errors_1.badRequest)("Missing Stripe signature");
    try {
        return stripeClient().webhooks.constructEvent(payload, signature, secret);
    }
    catch (_a) {
        throw (0, errors_1.badRequest)("Invalid Stripe signature");
    }
}
