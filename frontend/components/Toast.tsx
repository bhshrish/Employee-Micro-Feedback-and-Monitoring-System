"use client";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Icon } from "./Icon";
type ToastMessage = (message: string) => void;

interface Toast {
    id: number;
    message: string;
}

interface ToastProviderProps {
    children: ReactNode;
}

const ToastContext = createContext<ToastMessage | null>(null);

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const push = useCallback((message: string) => {
        const id = Date.now();
        setToasts((items) => [...items, { id, message }]);
        window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 3600);
    }, []);
    return <ToastContext.Provider value={push}>{children}<div className="toast-region" aria-live="polite">{toasts.map((toast) => <div className="toast" key={toast.id}><Icon name="check" size={20}/><span>{toast.message}</span><button onClick={() => setToasts((items) => items.filter((item) => item.id !== toast.id))} aria-label="Dismiss notification"><Icon name="close" size={18}/></button></div>)}</div></ToastContext.Provider>;
}

export function useToast(): ToastMessage {
    const toast = useContext(ToastContext);
    if (!toast)
        throw new Error("useToast must be used inside ToastProvider");
    return toast;
}
