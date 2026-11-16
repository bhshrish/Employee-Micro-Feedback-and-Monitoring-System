"use client";
import { useEffect, useRef } from "react";
import { Icon } from "./Icon";
export function Modal({ open, onClose, title, children, wide = false }) {
    const closeRef = useRef(null);
    useEffect(() => {
        if (!open)
            return;
        const previous = document.activeElement;
        const key = (event) => { if (event.key === "Escape")
            onClose(); };
        document.addEventListener("keydown", key);
        document.body.style.overflow = "hidden";
        window.setTimeout(() => closeRef.current?.focus(), 0);
        return () => { document.removeEventListener("keydown", key); document.body.style.overflow = ""; previous?.focus(); };
    }, [open, onClose]);
    if (!open)
        return null;
    return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget)
        onClose(); }}><section className={`modal ${wide ? "modal-wide" : ""}`} role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-head"><h2 id="modal-title">{title}</h2><button ref={closeRef} className="icon-button" onClick={onClose} aria-label="Close dialog"><Icon name="close"/></button></div>{children}</section></div>;
}
export function KpiCard({ label, value, note, icon = "chart" }) {
    return <article className="kpi-card"><div className="kpi-label"><Icon name={icon} size={20}/><span>{label}</span></div><strong>{value}</strong>{note && <p>{note}</p>}</article>;
}
export function Skeleton({ lines = 3 }) {
    return <div className="skeleton" aria-label="Loading content" aria-busy="true">{Array.from({ length: lines }).map((_, i) => <span key={i} style={{ width: `${92 - i * 11}%` }}/>)}</div>;
}
export function EmptyState({ title, text }) {
    return <div className="empty-state"><Icon name="check" size={30}/><h3>{title}</h3><p>{text}</p></div>;
}
export function DataTable({ headers, rows }) {
    return <div className="table-scroll"><table className="data-table"><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>;
}
export function FieldError({ children }) {
    return children ? <p className="field-error" role="alert">{children}</p> : null;
}
