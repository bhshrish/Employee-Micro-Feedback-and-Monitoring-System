"use client";
import Link from "next/link";
import { useState } from "react";
import { createCheckout, plans } from "@/lib/api";
import { useSubscription } from "@/lib/subscription";
import { RouteGuard } from "./RouteGuard";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { useToast } from "./Toast";
function CheckoutForm() {
    const { selection, selectPlan } = useSubscription();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");
    const toast = useToast();
    const plan = plans.find((item) => item.name === selection.plan) || plans[1];
    const monthly = selection.cycle === "yearly" ? Math.round(plan.monthly * .8) : plan.monthly;
    const total = selection.cycle === "yearly" ? monthly * 12 : monthly;
    const submit = async () => {
        setProcessing(true);
        setError("");
        try {
            const { checkoutUrl } = await createCheckout(selection.plan, selection.cycle);
            if (!checkoutUrl)
                throw new Error("The billing provider did not return a checkout URL.");
            window.location.assign(checkoutUrl);
        }
        catch (cause) {
            const message = cause instanceof Error ? cause.message : "Could not start checkout.";
            setError(message);
            toast(message);
        }
        finally {
            setProcessing(false);
        }
    };
    return <main className="checkout-page"><div className="checkout-top"><Logo /><Link href="/billing">Back to billing</Link></div><div className="checkout-layout"><section className="checkout-form"><p className="section-label">Secure checkout</p><h1>Choose your plan</h1><p>Payment details are entered securely with our billing provider. WellTrack never receives your card number or CVC.</p>{error && <p role="alert" className="field-error">{error}</p>}<button className="button button-full button-large" onClick={() => void submit()} disabled={processing}>{processing ? <><span className="spinner"/>Opening secure checkout…</> : <>Continue to payment<Icon name="arrow"/></>}</button></section><aside className="order-summary"><p className="section-label">Your plan</p><label>Plan<select value={selection.plan} onChange={(e) => selectPlan(e.target.value, selection.cycle)}>{plans.map((item) => <option key={item.name}>{item.name}</option>)}</select></label><div className="billing-toggle"><button className={selection.cycle === "monthly" ? "active" : ""} onClick={() => selectPlan(selection.plan, "monthly")}>Monthly</button><button className={selection.cycle === "yearly" ? "active" : ""} onClick={() => selectPlan(selection.plan, "yearly")}>Yearly · −20%</button></div><div className="summary-plan"><h2>{selection.plan}</h2><p>{plan.description}</p><ul>{plan.features.slice(0, 4).map((feature) => <li key={feature}><Icon name="check" size={18}/>{feature}</li>)}</ul></div><div className="summary-total"><span>{selection.cycle === "yearly" ? `$${monthly} × 12 months` : "Monthly subscription"}</span><strong>${total}.00</strong></div><p className="subtle-label">Final amount and currency are confirmed by the billing provider.</p></aside></div></main>;
}
export function Checkout() { return <RouteGuard requireApp={false}><CheckoutForm /></RouteGuard>; }
