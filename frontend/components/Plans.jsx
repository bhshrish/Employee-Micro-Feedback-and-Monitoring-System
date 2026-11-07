"use client";
import Link from "next/link";
import { useState } from "react";
import { plans } from "@/lib/api";
import { useSubscription } from "@/lib/subscription";
import { Icon } from "./Icon";
export function PlanCard({ plan, cycle, featured = false, action = "trial" }) {
    const { selectPlan } = useSubscription();
    const price = cycle === "yearly" ? Math.round(plan.monthly * .8) : plan.monthly;
    const href = action === "trial" ? `/signup?plan=${plan.name}&cycle=${cycle}` : "/checkout";
    return <article className={`plan-card ${featured ? "featured" : ""}`}>{featured && <span className="plan-badge">Most popular</span>}<h3>{plan.name}</h3><p>{plan.description}</p><div className="plan-price"><strong>${price}</strong><span>/ person<br />/ month</span></div>{cycle === "yearly" && <span className="savings">Billed yearly · save 20%</span>}<ul>{plan.features.map((feature) => <li key={feature}><Icon name="check" size={20}/>{feature}</li>)}</ul><Link href={href} onClick={() => selectPlan(plan.name, cycle)} className={`button ${featured ? "" : "button-outline"}`}>{action === "trial" ? "Start 7-day free trial" : `Choose ${plan.name}`}<Icon name="arrow" size={19}/></Link></article>;
}
export function PricingPlans({ action = "trial" }) {
    const [cycle, setCycle] = useState("monthly");
    return <><div className="billing-toggle" role="group" aria-label="Billing cycle"><button className={cycle === "monthly" ? "active" : ""} onClick={() => setCycle("monthly")} aria-pressed={cycle === "monthly"}>Monthly</button><button className={cycle === "yearly" ? "active" : ""} onClick={() => setCycle("yearly")} aria-pressed={cycle === "yearly"}>Yearly <span>Save 20%</span></button></div><div className="plans-grid">{plans.map((plan) => <PlanCard key={plan.name} plan={plan} cycle={cycle} featured={plan.name === "Team"} action={action}/>)}</div></>;
}
