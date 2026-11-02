"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { restoreSession, signOut as apiSignOut } from "./api";
const SubscriptionContext = createContext(null);
const defaultSelection = { plan: "Team", cycle: "monthly" };
export function SubscriptionProvider({ children }) {
    const [user, setUser] = useState(null);
    const [selection, setSelection] = useState(defaultSelection);
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => {
        const expireSession = () => setUser(null);
        window.addEventListener("pulse:session-expired", expireSession);
        try {
            const saved = localStorage.getItem("pulse:plan");
            if (saved)
                setSelection(JSON.parse(saved));
        }
        catch { /* use default */ }
        restoreSession().then((restored) => {
            setUser(restored);
            if (restored) {
                setSelection({ plan: restored.subscription.plan, cycle: defaultSelection.cycle });
            }
        }).catch((error) => {
            console.error("Could not restore the PULSE session", error);
        }).finally(() => setHydrated(true));
        return () => window.removeEventListener("pulse:session-expired", expireSession);
    }, []);
    const authenticated = user !== null;
    const status = useMemo(() => user?.subscription.status ?? "none", [user]);
    const acceptUser = (nextUser) => {
        setUser(nextUser);
        setSelection({ plan: nextUser.subscription.plan, cycle: selection.cycle });
    };
    const value = {
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
            }
            finally {
                setUser(null);
            }
        },
        refreshUser: async () => {
            const restored = await restoreSession();
            setUser(restored);
            if (restored)
                setSelection({ plan: restored.subscription.plan, cycle: selection.cycle });
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
            }
            finally {
                setUser(null);
                setSelection(defaultSelection);
            }
        },
    };
    return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}
export function useSubscription() {
    const value = useContext(SubscriptionContext);
    if (!value)
        throw new Error("useSubscription must be used inside SubscriptionProvider");
    return value;
}
