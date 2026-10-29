"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { plans, type BillingCycle, type PlanName } from "@/lib/api";
import { useSubscription } from "@/lib/subscription";
import { RouteGuard } from "./RouteGuard";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { FieldError } from "./UI";

function luhn(value: string) {
  const digits = value.replace(/\D/g, ""); if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0, double = false;
  for (let i = digits.length - 1; i >= 0; i--) { let n = Number(digits[i]); if (double) { n *= 2; if (n > 9) n -= 9; } sum += n; double = !double; }
  return sum % 10 === 0;
}
function CheckoutForm() {
  const { selection, selectPlan, activatePlan } = useSubscription(); const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [card, setCard] = useState(""); const [expiry, setExpiry] = useState(""); const [cvc, setCvc] = useState("");
  const [errors, setErrors] = useState<Record<string,string>>({}); const [processing, setProcessing] = useState(false); const [invoice, setInvoice] = useState(""); const router = useRouter();
  const plan = plans.find((item) => item.name === selection.plan) || plans[1]; const monthly = selection.cycle === "yearly" ? Math.round(plan.monthly * .8) : plan.monthly; const total = selection.cycle === "yearly" ? monthly * 12 : monthly;
  const submit = (e: FormEvent) => {
    e.preventDefault(); const next: Record<string,string> = {};
    if (name.trim().length < 2) next.name = "Enter the cardholder name.";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email.";
    if (!luhn(card)) next.card = "Enter a valid demo card, such as 4242 4242 4242 4242.";
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) next.expiry = "Use MM/YY.";
    if (!/^\d{3,4}$/.test(cvc)) next.cvc = "Use 3 or 4 digits.";
    setErrors(next); if (Object.keys(next).length) return;
    setProcessing(true); window.setTimeout(() => { activatePlan(selection.plan, selection.cycle); setInvoice(localStorage.getItem("pulse:lastInvoice") || "INV-2026-1100"); setProcessing(false); }, 1400);
  };
  if (invoice) return <main className="checkout-page"><div className="checkout-top"><Logo/><span>Demo checkout</span></div><section className="checkout-success"><div className="success-mark"><Icon name="check" size={42}/></div><p className="section-label">Payment simulated successfully</p><h1>Your workspace<br/>is unlocked.</h1><p>No real payment was processed. Your demo subscription is now active and report exports are available.</p><div className="success-invoice"><span>Fake invoice number</span><strong>{invoice}</strong></div><div className="success-actions"><button className="button" onClick={() => router.push("/dashboard")}>Go to dashboard <Icon name="arrow"/></button><Link href="/billing" className="button button-outline">View billing</Link></div></section></main>;
  return <main className="checkout-page"><div className="checkout-top"><Logo/><Link href="/billing">Back to billing</Link></div><div className="checkout-layout"><section className="checkout-form"><p className="section-label">Secure-looking, deliberately fake</p><h1>Demo checkout</h1><div className="demo-warning"><Icon name="alert"/><p><strong>Demo only — no real payment is processed.</strong> Use 4242 4242 4242 4242 with any future MM/YY and any 3-digit CVC.</p></div><form onSubmit={submit} noValidate><h2>Contact</h2><label>Full name<input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Alex Morgan"/><FieldError>{errors.name}</FieldError></label><label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@company.com"/><FieldError>{errors.email}</FieldError></label><h2>Dummy card</h2><label>Card number<input inputMode="numeric" value={card} onChange={(e) => { const digits = e.target.value.replace(/\D/g,"").slice(0,19); setCard(digits.replace(/(.{4})/g,"$1 ").trim()); }} autoComplete="off" placeholder="4242 4242 4242 4242"/><FieldError>{errors.card}</FieldError></label><div className="form-row"><label>Expiry<input value={expiry} onChange={(e) => setExpiry(e.target.value.slice(0,5))} placeholder="12/30" inputMode="numeric"/><FieldError>{errors.expiry}</FieldError></label><label>CVC<input value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="123" inputMode="numeric"/><FieldError>{errors.cvc}</FieldError></label></div><button className="button button-full button-large" disabled={processing}>{processing ? <><span className="spinner"/>Processing demo payment…</> : <>Activate {selection.plan} · ${total}<Icon name="arrow"/></>}</button><p className="form-note"><Icon name="lock" size={17}/>Details are validated locally and never transmitted or stored in full.</p></form></section><aside className="order-summary"><p className="section-label">Your plan</p><label>Plan<select value={selection.plan} onChange={(e) => selectPlan(e.target.value as PlanName, selection.cycle)}>{plans.map((item) => <option key={item.name}>{item.name}</option>)}</select></label><div className="billing-toggle"><button className={selection.cycle === "monthly" ? "active" : ""} onClick={() => selectPlan(selection.plan, "monthly")}>Monthly</button><button className={selection.cycle === "yearly" ? "active" : ""} onClick={() => selectPlan(selection.plan, "yearly")}>Yearly · −20%</button></div><div className="summary-plan"><h2>{selection.plan}</h2><p>{plan.description}</p><ul>{plan.features.slice(0,4).map((feature) => <li key={feature}><Icon name="check" size={18}/>{feature}</li>)}</ul></div><div className="summary-total"><span>{selection.cycle === "yearly" ? `$${monthly} × 12 months` : "Due today (simulated)"}</span><strong>${total}.00</strong></div><p className="subtle-label">Demo total · no actual charge</p></aside></div></main>;
}
export function Checkout() { return <RouteGuard requireApp={false}><CheckoutForm/></RouteGuard>; }
