"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { BillingCycle, PlanName } from "./api";

export type SubscriptionStatus = "none" | "trialing" | "trial_expired" | "active" | "canceled";
interface PlanSelection { plan: PlanName; cycle: BillingCycle }
interface SubscriptionValue {
  status: SubscriptionStatus;
  trialDaysLeft: number;
  isPaid: boolean;
  canDownloadReports: boolean;
  canUseApp: boolean;
  authenticated: boolean;
  hydrated: boolean;
  selection: PlanSelection;
  signIn: () => void;
  signUp: () => void;
  signOut: () => void;
  activatePlan: (plan?: PlanName, cycle?: BillingCycle) => void;
  cancelPlan: () => void;
  selectPlan: (plan: PlanName, cycle: BillingCycle) => void;
  setTrialDay: (day: number) => void;
  expireTrial: () => void;
  resetDemo: () => void;
}

const SubscriptionContext = createContext<SubscriptionValue | null>(null);
const DAY = 86_400_000;
const defaultSelection: PlanSelection = { plan: "Team", cycle: "monthly" };

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [storedStatus, setStoredStatus] = useState<SubscriptionStatus>("none");
  const [trialStartedAt, setTrialStartedAt] = useState<number | null>(null);
  const [selection, setSelection] = useState<PlanSelection>(defaultSelection);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setAuthenticated(localStorage.getItem("pulse:auth") === "true");
    setStoredStatus((localStorage.getItem("pulse:subscription") as SubscriptionStatus) || "none");
    const started = Number(localStorage.getItem("pulse:trialStartedAt"));
    setTrialStartedAt(started || null);
    try {
      const saved = localStorage.getItem("pulse:plan");
      if (saved) setSelection(JSON.parse(saved));
    } catch { /* use default */ }
    setHydrated(true);
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const status: SubscriptionStatus = useMemo(() => {
    if (!authenticated) return "none";
    if (storedStatus === "active" || storedStatus === "canceled") return storedStatus;
    if (!trialStartedAt) return "trialing";
    return now - trialStartedAt >= 7 * DAY ? "trial_expired" : "trialing";
  }, [authenticated, storedStatus, trialStartedAt, now]);

  const persistAuth = () => {
    localStorage.setItem("pulse:auth", "true");
    setAuthenticated(true);
  };
  const beginTrial = () => {
    const started = Date.now();
    localStorage.setItem("pulse:trialStartedAt", String(started));
    localStorage.setItem("pulse:subscription", "trialing");
    setTrialStartedAt(started);
    setStoredStatus("trialing");
    setNow(started);
  };

  const value: SubscriptionValue = {
    status,
    trialDaysLeft: status === "trialing" && trialStartedAt ? Math.max(0, Math.ceil((trialStartedAt + 7 * DAY - now) / DAY)) : 0,
    isPaid: status === "active",
    canDownloadReports: status === "active",
    canUseApp: authenticated && (status === "trialing" || status === "active"),
    authenticated,
    hydrated,
    selection,
    signIn: () => { persistAuth(); if (!trialStartedAt && storedStatus !== "active") beginTrial(); },
    signUp: () => { persistAuth(); beginTrial(); },
    signOut: () => { localStorage.removeItem("pulse:auth"); setAuthenticated(false); },
    activatePlan: (plan = selection.plan, cycle = selection.cycle) => {
      const next = { plan, cycle };
      localStorage.setItem("pulse:plan", JSON.stringify(next));
      localStorage.setItem("pulse:subscription", "active");
      localStorage.setItem("pulse:payment", "Demo card •••• 4242");
      const invoice = `INV-2026-${Math.floor(1100 + Math.random() * 899)}`;
      localStorage.setItem("pulse:lastInvoice", invoice);
      setSelection(next); setStoredStatus("active"); persistAuth();
    },
    cancelPlan: () => { localStorage.setItem("pulse:subscription", "canceled"); setStoredStatus("canceled"); },
    selectPlan: (plan, cycle) => {
      const next = { plan, cycle };
      localStorage.setItem("pulse:plan", JSON.stringify(next));
      setSelection(next);
    },
    setTrialDay: (day) => {
      persistAuth();
      const started = Date.now() - day * DAY;
      localStorage.setItem("pulse:trialStartedAt", String(started));
      localStorage.setItem("pulse:subscription", "trialing");
      setTrialStartedAt(started); setStoredStatus("trialing"); setNow(Date.now());
    },
    expireTrial: () => {
      persistAuth();
      const started = Date.now() - 8 * DAY;
      localStorage.setItem("pulse:trialStartedAt", String(started));
      localStorage.setItem("pulse:subscription", "trialing");
      setTrialStartedAt(started); setStoredStatus("trialing"); setNow(Date.now());
    },
    resetDemo: () => {
      Object.keys(localStorage).filter((key) => key.startsWith("pulse:")).forEach((key) => localStorage.removeItem(key));
      setAuthenticated(false); setStoredStatus("none"); setTrialStartedAt(null); setSelection(defaultSelection);
    },
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const value = useContext(SubscriptionContext);
  if (!value) throw new Error("useSubscription must be used inside SubscriptionProvider");
  return value;
}
