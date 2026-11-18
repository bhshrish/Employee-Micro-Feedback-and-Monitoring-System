"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { restoreSession, signOut as apiSignOut } from "./api";
const SubscriptionContext = createContext(null);
export function SubscriptionProvider({ children }) {
    const [user, setUser] = useState(null);
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => {
        Object.keys(localStorage)
            .filter((key) => key.startsWith("calmwork:keypress-counting:") || key.startsWith("calmwork:keypress-count:"))
            .forEach((key) => localStorage.removeItem(key));
        const expireSession = () => setUser(null);
        window.addEventListener("calmwork:session-expired", expireSession);
        restoreSession().then((restored) => {
            setUser(restored);
        }).catch((error) => {
            console.error("Could not restore the CalmWork session", error);
        }).finally(() => setHydrated(true));
        return () => window.removeEventListener("calmwork:session-expired", expireSession);
    }, []);
    const authenticated = user !== null;
    const value = {
        authenticated,
        hydrated,
        user,
        signIn: setUser,
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
        },
        resetLocalPreferences: async () => {
            Object.keys(localStorage).filter((key) => key.startsWith("calmwork:")).forEach((key) => localStorage.removeItem(key));
            try {
                await apiSignOut(true);
            }
            finally {
                setUser(null);
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
