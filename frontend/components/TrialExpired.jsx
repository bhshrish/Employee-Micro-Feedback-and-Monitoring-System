"use client";
import Link from "next/link";
import { useSubscription } from "@/lib/subscription";
import { Logo } from "./Logo";
import { PricingPlans } from "./Plans";
import { Icon } from "./Icon";
export function TrialExpired() {
    const { status, authenticated } = useSubscription();
    return <main className="expired-page"><header><Logo /><Link href="/">Back to home</Link></header><section className="expired-hero"><span className="expired-icon"><Icon name="clock" size={34}/></span><p className="section-label">Your 7-day trial has ended</p><h1>Keep the rhythm.<br />Choose a plan.</h1><p>Your workspace records remain associated with your account. Tracking and dashboards stay locked until your workspace has an active subscription.</p>{status === "active" ? <Link href="/dashboard" className="button">Return to dashboard <Icon name="arrow"/></Link> : !authenticated ? <Link href="/login" className="button">Sign in to continue <Icon name="arrow"/></Link> : null}</section>{authenticated && status !== "active" && <section className="expired-plans"><PricingPlans action="upgrade"/></section>}<p className="expired-note">Checkout requires the workspace billing provider to be configured.</p></main>;
}
