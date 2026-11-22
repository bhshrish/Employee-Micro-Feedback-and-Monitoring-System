"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { restoreSession, signOut as apiSignOut } from "./api";
import type { AuthUser } from "./api";

interface SubscriptionContextValue {
    authenticated: boolean;
    hydrated: boolean;
    user: AuthUser | null;
    signIn: (user: AuthUser) => void;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
    resetLocalPreferences: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

interface SubscriptionProviderProps {
    children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        Object.keys(localStorage)
            .filter((key) => key.startsWith("calmwork:keypress-counting:") || key.startsWith("calmwork:keypress-count:"))
            .forEach((key) => localStorage.removeItem(key));
        const expireSession = () => setUser(null);
        window.addEventListener("calmwork:session-expired", expireSession);
        restoreSession().then(setUser).catch((error: unknown) => {
            console.error("Could not restore the CalmWork session", error);
        }).finally(() => setHydrated(true));
        return () => window.removeEventListener("calmwork:session-expired", expireSession);
    }, []);

    const value: SubscriptionContextValue = {
        authenticated: user !== null,
        hydrated,
        user,
        signIn: (signedInUser) => setUser(signedInUser),
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
            Object.keys(localStorage)
                .filter((key) => key.startsWith("calmwork:"))
                .forEach((key) => localStorage.removeItem(key));
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

export function useSubscription(): SubscriptionContextValue {
    const value = useContext(SubscriptionContext);
    if (!value)
        throw new Error("useSubscription must be used inside SubscriptionProvider");
    return value;
}
