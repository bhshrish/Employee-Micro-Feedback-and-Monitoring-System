"use client";
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);
const themeStorageKey = "welltrack:theme";

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState("light");

    useEffect(() => {
        const savedTheme = localStorage.getItem(themeStorageKey) === "dark" ? "dark" : "light";
        setThemeState(savedTheme);
        document.documentElement.dataset.theme = savedTheme;
        const resetTheme = () => {
            localStorage.removeItem(themeStorageKey);
            setThemeState("light");
            document.documentElement.dataset.theme = "light";
        };
        window.addEventListener("welltrack:preferences-reset", resetTheme);
        return () => window.removeEventListener("welltrack:preferences-reset", resetTheme);
    }, []);

    const setTheme = (nextTheme) => {
        localStorage.setItem(themeStorageKey, nextTheme);
        document.documentElement.dataset.theme = nextTheme;
        setThemeState(nextTheme);
    };

    return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const value = useContext(ThemeContext);
    if (!value)
        throw new Error("useTheme must be used inside ThemeProvider");
    return value;
}
