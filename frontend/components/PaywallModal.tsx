"use client";
import Link from "next/link";
import { Modal } from "./UI";
import { Icon } from "./Icon";
import { useSubscription } from "@/lib/subscription";
export function PaywallModal({ open, onClose }) {
    const { selectPlan } = useSubscription();
    return <Modal open={open} onClose={onClose} title="Unlock report exports"><div className="paywall-content"><div className="idle-symbol"><Icon name="lock" size={34}/></div><p>Your report preview is free. Upgrade to download polished PDF and CSV reports and keep full access after your trial.</p><ul><li><Icon name="check"/>PDF and CSV exports</li><li><Icon name="check"/>Team trends and alerts</li><li><Icon name="check"/>Secure billing through our payment provider</li></ul><Link href="/checkout" onClick={() => selectPlan("Team", "monthly")} className="button button-full">Unlock with a plan <Icon name="arrow"/></Link><button className="button button-quiet button-full" onClick={onClose}>Keep previewing</button></div></Modal>;
}
