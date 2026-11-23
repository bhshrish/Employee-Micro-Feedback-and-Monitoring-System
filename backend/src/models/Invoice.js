"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invoice = void 0;
const mongoose_1 = require("mongoose");
const invoiceSchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    providerInvoiceId: { type: String, required: true },
    stripeInvoiceId: { type: String, default: null },
    number: { type: String, default: null },
    currency: { type: String, required: true },
    amountDue: { type: Number, required: true },
    amountPaid: { type: Number, required: true },
    status: { type: String, required: true },
    hostedInvoiceUrl: { type: String, default: null },
    invoicePdfUrl: { type: String, default: null },
    periodStart: { type: Date, default: null },
    periodEnd: { type: Date, default: null },
    issuedAt: { type: Date, required: true },
}, { timestamps: true });
invoiceSchema.index({ organizationId: 1, providerInvoiceId: 1 }, { unique: true });
invoiceSchema.index({ organizationId: 1, stripeInvoiceId: 1 }, { unique: true });
exports.Invoice = mongoose_1.models.Invoice || (0, mongoose_1.model)("Invoice", invoiceSchema);
