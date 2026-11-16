"use client";
import { useEffect, useState } from "react";
export function useLocalStorage(key, initialValue) {
    const [value, setValue] = useState(initialValue);
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => {
        try {
            const stored = localStorage.getItem(key);
            if (stored !== null)
                setValue(JSON.parse(stored));
        }
        catch { /* keep initial value */ }
        setHydrated(true);
    }, [key]);
    useEffect(() => {
        if (hydrated)
            localStorage.setItem(key, JSON.stringify(value));
    }, [key, value, hydrated]);
    return [value, setValue, hydrated];
}
