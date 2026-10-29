"use client";
import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { Icon } from "./Icon";
const ToastContext = createContext<(message: string) => void>(() => undefined);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);
  const push = useCallback((message: string) => {
    const id = Date.now(); setToasts((items) => [...items, { id, message }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 3600);
  }, []);
  return <ToastContext.Provider value={push}>{children}<div className="toast-region" aria-live="polite">{toasts.map((toast) => <div className="toast" key={toast.id}><Icon name="check" size={20}/><span>{toast.message}</span><button onClick={() => setToasts((items) => items.filter((item) => item.id !== toast.id))} aria-label="Dismiss notification"><Icon name="close" size={18}/></button></div>)}</div></ToastContext.Provider>;
}
export const useToast = () => useContext(ToastContext);
