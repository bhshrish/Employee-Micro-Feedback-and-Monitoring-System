"use client";
import { useEffect, useState } from "react";

export function useLocalStorage<T>(
    key: string,
    initialValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
    const [value, setValue] = useState<T>(initialValue);
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => {
        const timeout = window.setTimeout(() => {
            try {
                const stored = localStorage.getItem(key);
                if (stored !== null)
                    setValue(JSON.parse(stored) as T);
            }
            catch (error) {
                console.error(`Could not read local storage key "${key}"`, error);
            }
            setHydrated(true);
        }, 0);
        return () => window.clearTimeout(timeout);
    }, [key]);
    useEffect(() => {
        if (hydrated)
            localStorage.setItem(key, JSON.stringify(value));
    }, [key, value, hydrated]);
    return [value, setValue, hydrated];
}
