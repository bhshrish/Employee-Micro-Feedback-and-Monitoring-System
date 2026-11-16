"use client";

import { useCallback, useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/Icon";
import { FieldError, KpiCard, Skeleton } from "@/components/UI";
import { useToast } from "@/components/Toast";
import {
    signOutOperationsAdmin,
    getOperationsAdmin,
    getOperationsAttendance,
    exportOperationsAttendance,
} from "@/lib/api";
import { errorMessage, formatTime, formatDuration } from "@/components/admin/adminHelpers";

export function AdminAttendance() {
    const toast = useToast();
    const [authorized, setAuthorized] = useState(false);
    const [checking, setChecking] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [page, setPage] = useState(1);
    const [exporting, setExporting] = useState(false);
    const [data, setData] = useState(null);

    const load = useCallback(async () => {
        setError("");
        try {
            setData(await getOperationsAttendance(date, page));
        }
        catch (cause) {
            if (cause?.status === 401)
                setAuthorized(false);
            setError(errorMessage(cause, "Could not load attendance data."));
        }
    }, [date, page]);

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

    const downloadCsv = async () => {
        setExporting(true);
        try {
            const blob = await exportOperationsAttendance(date);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `calmwork-attendance-${date}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not export attendance.");
        }
        finally {
            setExporting(false);
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
                    <a href="/admin/activity" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: "9px", background: "transparent", textAlign: "left", fontWeight: 600, color: "var(--text)", textDecoration: "none" }}><Icon name="clock" size={16} /> Activity</a>
                    <a href="/admin/attendance" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: "9px", background: "var(--p-soft-red)", color: "var(--p-red-dark)", fontWeight: 700, textDecoration: "none" }}><Icon name="calendar" size={16} /> Attendance</a>
                </nav>
                <div style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid var(--line)", color: "var(--muted)", fontSize: 14 }}>
                    <p>Signed in as operations admin</p>
                    <button onClick={signOut} disabled={loading} style={{ marginTop: 10, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Icon name="logout" size={16} /> Sign out</button>
                </div>
            </aside>

            <div style={{ minWidth: 0 }}>
                <header className="admin-header">
                    <div>
                        <h1 style={{ fontSize: 26, letterSpacing: "-.04em" }}>Attendance</h1>
                        <p style={{ color: "var(--muted)", fontSize: 15, margin: 4 }}>Review daily attendance across businesses.</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ color: "var(--muted)", fontSize: 14 }}>{new Date().toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                    </div>
                </header>

                <main className="admin-content">
                    <FieldError>{error}</FieldError>

                    <div className="admin-heading">
                        <div><p className="section-label">Attendance</p><h2>Attendance overview</h2></div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span>Date</span>
                                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={loading} />
                            </label>
                            <button className="button button-outline" disabled={exporting || loading} onClick={() => void downloadCsv()}>
                                {exporting ? "Exporting…" : <><Icon name="download" size={16} style={{ marginRight: 6 }} /> Export CSV</>}
                            </button>
                        </div>
                    </div>
                    {loading ? <Skeleton lines={5} /> : (
                        <>
                            <section className="kpi-grid admin-kpis">
                                <KpiCard label="Employees" value={data?.summary?.employees ?? "—"} note="Employees with attendance records" icon="users" />
                                <KpiCard label="Check-ins" value={data?.summary?.totalCheckIns ?? "—"} note="Total check-ins today" icon="clock" />
                                <KpiCard label="Checked in now" value={data?.summary?.currentlyCheckedIn ?? "—"} note="Currently checked in" icon="calendar" />
                                <KpiCard label="Elapsed time" value={formatDuration(data?.summary?.totalSeconds)} note="Aggregate tracked time today" icon="clock" />
                            </section>
                            <section className="data-card admin-card">
                                <div className="table-scroll">
                                    <table className="data-table">
                                        <thead>
                                            <tr><th>Employee</th><th>Business</th><th>Check-in</th><th>Check-out</th><th>Duration</th><th>Status</th></tr>
                                        </thead>
                                        <tbody>
                                            {(data?.records ?? []).map((record) => (
                                                <tr key={record.id}>
                                                    <td><strong>{record.employee}</strong><br /><small style={{ color: "var(--muted)" }}>{record.email}</small></td>
                                                    <td>{record.business}</td>
                                                    <td>{formatTime(record.checkedInAt)}</td>
                                                    <td>{formatTime(record.checkedOutAt)}</td>
                                                    <td>{formatDuration(record.durationSeconds)}</td>
                                                    <td>{record.checkedOutAt ? "Complete" : "Checked in"}</td>
                                                </tr>
                                            ))}
                                            {(data?.records ?? []).length === 0 && (
                                                <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--muted)", padding: 30 }}>No attendance records for this date.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {data?.totalPages > 1 && (
                                    <div className="admin-pagination">
                                        <button className="button button-outline button-small" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>Previous</button>
                                        <span>Page {page} of {data.totalPages}</span>
                                        <button className="button button-outline button-small" disabled={page >= data.totalPages || loading} onClick={() => setPage((p) => p + 1)}>Next</button>
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

export default AdminAttendance;
