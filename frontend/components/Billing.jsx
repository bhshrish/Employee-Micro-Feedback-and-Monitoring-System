"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cancelSubscription, getInvoices, getSubscription, plans } from "@/lib/api";
import { useSubscription } from "@/lib/subscription";
import { AppShell } from "./AppShell";
import { DataTable, Modal, Skeleton } from "./UI";
import { Icon } from "./Icon";
import { useRouter } from "next/navigation";
import { useToast } from "./Toast";
function BillingContent() {
    const { status, trialDaysLeft, selection, refreshUser } = useSubscription();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelOpen, setCancelOpen] = useState(false);
    const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
    const [currentPeriodEnd, setCurrentPeriodEnd] = useState(null);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const toast = useToast();
    const plan = plans.find((item) => item.name === selection.plan) || plans[1];
    useEffect(() => {
        let active = true;
        Promise.all([getInvoices(), getSubscription()]).then(([items, result]) => {
            if (!active)
                return;
            setInvoices(items);
            setCancelAtPeriodEnd(result.subscription.cancelAtPeriodEnd);
            setCurrentPeriodEnd(result.subscription.currentPeriodEnd);
        }).catch((cause) => {
            if (active)
                setError(cause instanceof Error ? cause.message : "Could not load billing details.");
        }).finally(() => { if (active)
            setLoading(false); });
        return () => { active = false; };
    }, []);
    const cancel = async () => {
        setSaving(true);
        try {
            const result = await cancelSubscription();
            setCancelAtPeriodEnd(result.cancelAtPeriodEnd);
            setCurrentPeriodEnd(result.currentPeriodEnd);
            setCancelOpen(false);
            await refreshUser();
            toast("Subscription cancellation scheduled.");
        }
        catch (cause) {
            const message = cause instanceof Error ? cause.message : "Could not cancel this subscription.";
            setError(message);
            toast(message);
        }
        finally {
            setSaving(false);
        }
    };
    return <div className="billing-page"><div className="app-page-heading"><div><p className="section-label">Subscription</p><h1>Billing & plan</h1><p>Manage your subscription and view invoices from your workspace.</p></div></div>{error && <p role="alert" className="field-error">{error}</p>}<div className="billing-grid"><section className="subscription-card"><div className="card-heading"><div><p className="section-label">Current plan</p><h2>{status === "active" || status === "canceled" ? selection.plan : "Free trial"}</h2></div><span className={`status-badge ${status}`}>{status.replace("_", " ")}</span></div>{status === "trialing" ? <><div className="trial-count"><strong>{trialDaysLeft}</strong><span>days left<br />in your trial</span></div><p>Your trial includes access until it expires. Choose a plan to continue.</p></> : <><div className="plan-price"><strong>${plan.monthly}</strong><span>/ person / month</span></div><p>{cancelAtPeriodEnd ? "Cancellation is scheduled" : currentPeriodEnd ? `Current period ends ${new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(currentPeriodEnd))}.` : "Manage your subscription with the billing provider."}</p></>}<div className="subscription-actions"><Link href="/checkout" className="button">{status === "active" ? "Change plan" : "Choose a plan"}<Icon name="arrow"/></Link>{status === "active" && !cancelAtPeriodEnd && <button className="button button-quiet" onClick={() => setCancelOpen(true)}>Cancel plan</button>}</div></section><section className="payment-card"><p className="section-label">Payment method</p><div className="payment-provider-card"><Icon name="credit" size={34}/><div><strong>Managed securely by Razorpay</strong><span>Card details are never stored by CalmWork.</span></div></div><p className="form-note">Payment status and invoices sync securely from Razorpay webhooks.</p></section></div><section className="invoice-section"><div className="card-heading"><div><p className="section-label">History</p><h2>Invoices</h2></div></div>{loading ? <Skeleton lines={3}/> : invoices.length ? <DataTable headers={["Invoice", "Date", "Amount", "Status"]} rows={invoices.map((invoice) => [invoice.id, invoice.date, invoice.amount, <span className="invoice-status" key="status">{invoice.status}</span>])}/> : <p>No invoices are available for this workspace yet.</p>}</section><Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel your subscription?"><div className="modal-body"><p>Your subscription will remain active through the current billing period.</p><div className="modal-actions"><button className="button button-outline" onClick={() => setCancelOpen(false)}>Keep plan</button><button className="button button-danger" disabled={saving} onClick={() => void cancel()}>{saving ? "Scheduling…" : "Cancel at period end"}</button></div></div></Modal></div>;
}
export function Billing() { return <AppShell><BillingContent /></AppShell>; }
