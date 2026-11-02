"use client";
import { useEffect, useRef, useState } from "react";
export function Reveal({ children, className = "" }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const node = ref.current;
        if (!node || !("IntersectionObserver" in window)) {
            setVisible(true);
            return;
        }
        const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
        } }, { threshold: .12 });
        observer.observe(node);
        return () => observer.disconnect();
    }, []);
    return <div ref={ref} className={`reveal ${visible ? "is-visible" : ""} ${className}`}>{children}</div>;
}
