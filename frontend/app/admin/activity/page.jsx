"use client";

import { useCallback, useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/Icon";
import { FieldError, Skeleton } from "@/components/UI";
import { useToast } from "@/components/Toast";
import {
    signOutOperationsAdmin,
    getOperationsAdmin,
    getOperationsActivity,
} from "@/lib/api";
import { errorMessage } from "@/components/admin/adminHelpers";

export function AdminActivity() {
    const toast = useToast();
    const [authorized, setAuthorized] = useState(false);
    const [checking, setChecking] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [data, setData] = useState(null);

    function formatDuration(seconds = 0) {
        const total = Math.max(0, Math.floor(seconds));
        return `${Math.floor(total / 3600)}h ${Math.floor((total % 3600) / 60)}m`;
    }

    const load = useCallback(async () => {
        setError("");
        try {
            setData(await getOperationsActivity(date));
        }
        catch (cause) {
            if (cause?.status === 401)
                setAuthorized(false);
            setError(errorMessage(cause, "Could not load activity data."));
        }
    }, [date]);

    useEffect(() => {
        let active = true;
        getOperationsAdmin().then(() => { if (active) setAuthorized(true); }).catch(() => { if (active) setAuthorized(false); }).finally(() => { if (active) setChecking(false); });
        return () => { active = false; };
    }, []);

    useEffect(() => { if (authorized) void load(); }, [authorized, load]);

    const signOut = async () => {
        setLoading(true);
        try {
            await signOutOperationsAdmin();
            setAuthorized(false);
            setData(null);
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not sign out.");
        }
        finally {
            setLoading(false);
        }
    };

    if (checking) {
        return (
            <main className="admin-auth-page">
                <div className="admin-auth-card">
                    <Logo inverse />
                    <h1>Platform operations</h1>
                    <p>Checking operations access…</p>
                </div>
            </main>
        );
    }

    if (!authorized) {
        return (
            <main className="admin-auth-page">
                <div className="admin-auth-card">
                    <Logo inverse />
                    <h1>Platform operations sign-in</h1>
                    <p>Use a one-time code to access platform operations.</p>
                    {error && <FieldError>{error}</FieldError>}
                    <button className="button" type="button" onClick={() => window.location.assign("/admin/login")}>Continue to administrator sign in</button>
                </div>
            </main>
        );
    }
    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <Logo inverse style={{ marginBottom: 8 }} />
                <p className="section-label">Platform</p>
                <nav style={{ display: "grid", gap: 6, marginBottom: 20 }}>
                    <a href="/admin" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: "9px", background: "transparent", textAlign: "left", fontWeight: 600, color: "var(--text)", textDecoration: "none" }}><Icon name="chart" size={16} /> Overview</a>
                    <a href="/admin/businesses" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: "9px", background: "transparent", textAlign: "left", fontWeight: 600, color: "var(--text)", textDecoration: "none" }}><Icon name="shield" size={16} /> Businesses</a>
                    <a href="/admin/users" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: "9px", background: "transparent", textAlign: "left", fontWeight: 600, color: "var(--text)", textDecoration: "none" }}><Icon name="users" size={16} /> Users</a>
                    <a href="/admin/teams" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: "9px", background: "transparent", textAlign: "left", fontWeight: 600, color: "var(--text)", textDecoration: "none" }}><Icon name="users" size={16} /> Teams</a>
                    <a href="/admin/activity" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: "9px", background: "var(--p-soft-red)", color: "var(--p-red-dark)", fontWeight: 700, textDecoration: "none" }}><Icon name="clock" size={16} /> Activity</a>
                    <a href="/admin/attendance" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: "9px", background: "transparent", textAlign: "left", fontWeight: 600, color: "var(--text)", textDecoration: "none" }}><Icon name="calendar" size={16} /> Attendance</a>
                </nav>
                <div style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid var(--line)", color: "var(--muted)", fontSize: 14 }}>
                    <p>Signed in as operations admin</p>
                    <button onClick={signOut} disabled={loading} style={{ marginTop: 10, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Icon name="logout" size={16} /> Sign out</button>
                </div>
            </aside>

            <div style={{ minWidth: 0 }}>
                <header className="admin-header">
                    <div>
                        <h1 style={{ fontSize: 26, letterSpacing: "-.04em" }}>Activity</h1>
                        <p style={{ color: "var(--muted)", fontSize: 15, margin: 4 }}>Aggregated workspace activity by business.</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ color: "var(--muted)", fontSize: 14 }}>{new Date().toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                    </div>
                </header>

                <main className="admin-content">
                    <FieldError>{error}</FieldError>

                    <div className="admin-heading">
                        <div><p className="section-label">Activity</p><h2>Workspace activity</h2></div>
                        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span>Date</span>
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={loading} />
                        </label>
                    </div>

                    <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 16 }}>Aggregated by business. Individual task labels and employee activity records are not exposed.</p>

                    {loading ? <Skeleton lines={5} /> : (
                        <section className="data-card admin-card">
                            <div className="table-scroll">
                                <table className="data-table">
                                    <thead>
                                        <tr><th>Business</th><th>Employees active</th><th>Sessions</th><th>Active time</th><th>Idle time</th></tr>
                                    </thead>
                                    <tbody>
                                        {(data?.businesses ?? []).map((row) => (
                                            <tr key={row._id}>
                                                <td><strong>{row.business}</strong></td>
                                                <td>{row.employees}</td>
                                                <td>{row.sessions}</td>
                                                <td>{formatDuration(row.activeSeconds)}</td>
                                                <td>{formatDuration(row.idleSeconds)}</td>
                                            </tr>
                                        ))}
                                        {(data?.businesses ?? []).length === 0 && (
                                            <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--muted)", padding: 30 }}>No activity recorded for this date.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
}

export default AdminActivity;
