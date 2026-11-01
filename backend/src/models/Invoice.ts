import { Schema, model, models } from "mongoose";

const invoiceSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  stripeInvoiceId: { type: String, required: true },
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

invoiceSchema.index({ organizationId: 1, stripeInvoiceId: 1 }, { unique: true });
export const Invoice = models.Invoice || model("Invoice", invoiceSchema);
