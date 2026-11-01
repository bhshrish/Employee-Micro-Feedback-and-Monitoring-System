"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { restoreSession, signOut as apiSignOut, type AuthUser, type BillingCycle, type PlanName } from "./api";

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
  user: AuthUser | null;
  selection: PlanSelection;
  signIn: (user: AuthUser) => void;
  signUp: (user: AuthUser) => void;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  selectPlan: (plan: PlanName, cycle: BillingCycle) => void;
  resetLocalPreferences: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionValue | null>(null);
const defaultSelection: PlanSelection = { plan: "Team", cycle: "monthly" };

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [selection, setSelection] = useState<PlanSelection>(defaultSelection);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const expireSession = () => setUser(null);
    window.addEventListener("pulse:session-expired", expireSession);
    try {
      const saved = localStorage.getItem("pulse:plan");
      if (saved) setSelection(JSON.parse(saved));
    } catch { /* use default */ }
    restoreSession().then((restored) => {
      setUser(restored);
      if (restored) {
        setSelection({ plan: restored.subscription.plan, cycle: defaultSelection.cycle });
      }
    }).catch((error: unknown) => {
      console.error("Could not restore the PULSE session", error);
    }).finally(() => setHydrated(true));
    return () => window.removeEventListener("pulse:session-expired", expireSession);
  }, []);

  const authenticated = user !== null;
  const status: SubscriptionStatus = useMemo(() => user?.subscription.status ?? "none", [user]);

  const acceptUser = (nextUser: AuthUser) => {
    setUser(nextUser);
    setSelection({ plan: nextUser.subscription.plan, cycle: selection.cycle });
  };

  const value: SubscriptionValue = {
    status,
    trialDaysLeft: user?.subscription.trialDaysLeft ?? 0,
    isPaid: status === "active",
    canDownloadReports: status === "active",
    canUseApp: authenticated && (status === "trialing" || status === "active"),
    authenticated,
    hydrated,
    user,
    selection,
    signIn: acceptUser,
    signUp: acceptUser,
    signOut: async () => {
      try {
        await apiSignOut(true);
      } finally {
        setUser(null);
      }
    },
    refreshUser: async () => {
      const restored = await restoreSession();
      setUser(restored);
      if (restored) setSelection({ plan: restored.subscription.plan, cycle: selection.cycle });
    },
    selectPlan: (plan, cycle) => {
      const next = { plan, cycle };
      localStorage.setItem("pulse:plan", JSON.stringify(next));
      setSelection(next);
    },
    resetLocalPreferences: async () => {
      Object.keys(localStorage).filter((key) => key.startsWith("pulse:")).forEach((key) => localStorage.removeItem(key));
      try {
        await apiSignOut(true);
      } finally {
        setUser(null);
        setSelection(defaultSelection);
      }
    },
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const value = useContext(SubscriptionContext);
  if (!value) throw new Error("useSubscription must be used inside SubscriptionProvider");
  return value;
}
