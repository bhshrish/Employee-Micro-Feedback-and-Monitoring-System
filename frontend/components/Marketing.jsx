"use client";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
export function MarketingNavbar() {
    const [open, setOpen] = useState(false);
    return <header className="marketing-nav"><Logo /><nav className={open ? "nav-open" : ""} aria-label="Main navigation"><Link href="/#features" onClick={() => setOpen(false)}>Features</Link><Link href="/#how-it-works" onClick={() => setOpen(false)}>How it works</Link><Link href="/pricing" onClick={() => setOpen(false)}>Pricing</Link><Link href="/about" onClick={() => setOpen(false)}>About</Link></nav><div className="nav-actions"><Link href="/login" className="text-link">Sign in</Link><Link href="/login?mode=signup" className="button button-small">Start free trial <Icon name="arrow" size={18}/></Link></div><button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"}><Icon name={open ? "close" : "menu"}/></button></header>;
}
export function MarketingFooter() {
    return <footer className="marketing-footer"><div className="footer-top"><div><Logo inverse/><p>Healthier work, heard earlier.</p></div><div className="footer-links"><div><strong>Product</strong><Link href="/pricing">Pricing</Link><Link href="/login?mode=signup">Start a trial</Link><Link href="/contact">Contact</Link></div><div><strong>Company</strong><Link href="/about">About</Link><Link href="/privacy">Privacy</Link><Link href="/login">Sign in</Link></div></div></div><div className="footer-bottom"><span>© 2026 Workwell. Employee feedback and wellbeing.</span><span>Planned screen recording is opt-in · Keyboard counts, not typed text</span></div></footer>;
}
const faqs = [
    ["Does Workwell record my screen or keystrokes?", "Not in the current demo. Screen recording is planned as an optional feature that requires an employee to opt in and can be paused or stopped. Keyboard activity will be counted only; typed characters and key values will not be collected. Screen recordings may show visible sensitive information, so employees should be able to avoid recording those screens."],
    ["Can my manager see my individual pulse answers?", "No. Pulse responses are shown only as aggregated team averages. Teams with fewer than five responses are hidden from manager reporting."],
    ["What happens after the 7-day trial?", "Tracking and reports pause until you choose a plan. Your activity history remains preserved in this browser and becomes available again after activation."],
    ["Is checkout connected to a payment provider?", "Checkout uses Stripe-hosted payment pages when Stripe is configured by the workspace operator. Workwell never accepts or stores card numbers or CVCs."],
];
export function FAQ() {
    const [open, setOpen] = useState(0);
    return <div className="faq-list">{faqs.map(([question, answer], i) => <div className={`faq-item ${open === i ? "open" : ""}`} key={question}><button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}><span>{question}</span><Icon name="chevron"/></button><div className="faq-answer" hidden={open !== i}><p>{answer}</p></div></div>)}</div>;
}
