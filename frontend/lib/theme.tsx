"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";

interface ThemeContextValue {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const themeStorageKey = "calmwork:theme";

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>("light");

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            const savedTheme: Theme = localStorage.getItem(themeStorageKey) === "dark" ? "dark" : "light";
            setThemeState(savedTheme);
            document.documentElement.dataset.theme = savedTheme;
        }, 0);
        const resetTheme = () => {
            localStorage.removeItem(themeStorageKey);
            setThemeState("light");
            document.documentElement.dataset.theme = "light";
        };
        window.addEventListener("calmwork:preferences-reset", resetTheme);
        return () => {
            window.clearTimeout(timeout);
            window.removeEventListener("calmwork:preferences-reset", resetTheme);
        };
    }, []);

    const setTheme = (nextTheme: Theme) => {
        localStorage.setItem(themeStorageKey, nextTheme);
        document.documentElement.dataset.theme = nextTheme;
        setThemeState(nextTheme);
    };

    return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
    const value = useContext(ThemeContext);
    if (!value)
        throw new Error("useTheme must be used inside ThemeProvider");
    return value;
}
