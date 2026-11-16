"use client";

import { useCallback, useEffect, useState } from "react";
import { getAdminAlerts, updateAdminAlert } from "@/lib/api";
import { FieldError, Skeleton } from "../UI";
import { Icon } from "../Icon";
import { useToast } from "../Toast";
import { ALERT_FILTERS, errorMessage, formatDate } from "./adminHelpers";

const SEVERITY_ICONS = { high: "alert", medium: "bell", low: "check" };

export function AdminAlerts() {
    const toast = useToast();
    const [status, setStatus] = useState("open");
    const [alerts, setAlerts] = useState([]);
    const [openCount, setOpenCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState("");
    const [error, setError] = useState("");

    const refresh = useCallback(async () => {
        setError("");
        try {
            const result = await getAdminAlerts({ status });
            setAlerts(result.alerts);
            setOpenCount(result.openCount);
        }
        catch (cause) {
            setError(errorMessage(cause, "Could not load wellbeing alerts."));
        }
        finally {
            setLoading(false);
        }
    }, [status]);

    useEffect(() => { void refresh(); }, [refresh]);

    const resolve = async (alert, nextStatus) => {
        setBusyId(alert.id);
        setError("");
        try {
            await updateAdminAlert(alert.id, nextStatus);
            toast(`Alert ${nextStatus}.`);
            await refresh();
        }
        catch (cause) {
            setError(errorMessage(cause, "Could not update this alert."));
        }
        finally {
            setBusyId("");
        }
    };

    return <div className="admin-panel">
        <FieldError>{error}</FieldError>
        <section className="data-card admin-card">
            <div className="card-heading">
                <div><p className="section-label">Wellbeing</p><h2>Team alerts</h2><p className="subtle-text">Aggregated signals only. Individual responses stay private and no one is named here.</p></div>
                <div className="admin-filters"><span className="admin-chip"><Icon name="bell" size={15}/>{openCount} open</span><select aria-label="Filter alerts" value={status} onChange={(event) => setStatus(event.target.value)}>{ALERT_FILTERS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
            </div>
            {loading ? <Skeleton lines={4}/> : alerts.length === 0
                ? <div className="empty-state"><Icon name="check" size={28}/><h3>Nothing needs attention</h3><p>There are no {status || ""} alerts for this business right now.</p></div>
                : <ul className="admin-alert-list">{alerts.map((alert) => <li key={alert.id} className={`admin-alert ${alert.severity}`}>
                    <span className="admin-alert-icon"><Icon name={SEVERITY_ICONS[alert.severity] ?? "bell"} size={18}/></span>
                    <div className="admin-alert-body">
                        <div className="admin-alert-head"><h3>{alert.title}</h3><span className={`admin-status ${alert.severity === "high" ? "danger" : alert.severity === "medium" ? "warning" : "neutral"}`}>{alert.severity} · {alert.score}</span></div>
                        <p>{alert.detail}</p>
                        <small>{alert.teamName ?? "Team"} · {formatDate(alert.createdAt)} · risk score {alert.score}/100</small>
                    </div>
                    <div className="admin-alert-actions">
                        {alert.status !== "acknowledged" && <button type="button" className="button button-outline button-small" disabled={busyId === alert.id} onClick={() => void resolve(alert, "acknowledged")}>Acknowledge</button>}
                        {alert.status !== "dismissed" && <button type="button" className="button button-quiet button-small" disabled={busyId === alert.id} onClick={() => void resolve(alert, "dismissed")}>Dismiss</button>}
                    </div>
                </li>)}</ul>}
        </section>
    </div>;
}
