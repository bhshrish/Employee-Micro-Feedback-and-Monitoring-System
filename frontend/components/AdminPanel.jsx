"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { FieldError } from "./UI";
import { getOperationsAdmin, getOperationsAttendance, signInOperationsAdmin, signOutOperationsAdmin, exportOperationsAttendance } from "@/lib/api";

function localDateValue() {
    return new Date().toISOString().slice(0, 10);
}
function formatTime(value) {
    return value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
}
function formatDuration(seconds) {
    const total = Math.max(0, Math.floor(seconds || 0));
    return `${Math.floor(total / 3600)}h ${Math.floor((total % 3600) / 60)}m`;
}

export function AdminPanel() {
    const [authorized, setAuthorized] = useState(false);
    const [checking, setChecking] = useState(true);
    const [email, setEmail] = useState("admin@gmail.com");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(localDateValue);
    const [page, setPage] = useState(1);
    const [data, setData] = useState(null);
    const [loadingData, setLoadingData] = useState(false);
    const [exporting, setExporting] = useState(false);

    const loadAttendance = useCallback(async () => {
        setLoadingData(true);
        try {
            setData(await getOperationsAttendance(date, page));
        }
        catch (cause) {
            if (cause?.status === 401)
                setAuthorized(false);
            setError(cause instanceof Error ? cause.message : "Could not load attendance records.");
        }
        finally {
            setLoadingData(false);
        }
    }, [date, page]);

    useEffect(() => {
        let active = true;
        getOperationsAdmin().then(() => {
            if (active)
                setAuthorized(true);
        }).catch(() => {
            if (active)
                setAuthorized(false);
        }).finally(() => {
            if (active)
                setChecking(false);
        });
        return () => { active = false; };
    }, []);
    useEffect(() => {
        if (authorized)
            void loadAttendance();
    }, [authorized, loadAttendance]);

    const signIn = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        try {
            await signInOperationsAdmin(email, password);
            setPassword("");
            setAuthorized(true);
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Admin sign-in failed.");
        }
        finally {
            setLoading(false);
        }
    };

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

    const exportCsv = async () => {
        setExporting(true);
        setError("");
        try {
            const blob = await exportOperationsAttendance(date);
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `workwell-attendance-${date}.csv`;
            link.click();
            URL.revokeObjectURL(url);
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not export attendance.");
        }
        finally {
            setExporting(false);
        }
    };

    if (checking)
        return <main className="admin-auth-page"><p role="status">Checking operations access…</p></main>;
    if (!authorized) {
        return <main className="admin-auth-page">
            <div className="admin-auth-card">
                <Logo/>
                <p className="section-label">Operations access</p>
                <h1>Admin sign in</h1>
                <p>This panel is restricted to the configured operations admin account.</p>
                <form onSubmit={signIn}>
                    <label>Admin email<input type="email" value={email} readOnly autoComplete="username"/></label>
                    <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required/></label>
                    {error && <FieldError>{error}</FieldError>}
                    <button className="button button-full" disabled={loading}>{loading ? "Signing in…" : "Sign in as admin"}</button>
                </form>
                <Link href="/login">Return to employee sign in</Link>
            </div>
        </main>;
    }

    const summary = data?.summary ?? { totalCheckIns: 0, currentlyCheckedIn: 0, totalSeconds: 0, employees: 0 };
    return <main className="admin-page">
        <header className="admin-header">
            <Logo/>
            <div><span>Operations admin</span><button className="button button-outline button-small" disabled={loading} onClick={() => void signOut()}>Sign out</button></div>
        </header>
        <section className="admin-content">
            <div className="app-page-heading admin-heading">
                <div><p className="section-label">Daily operations</p><h1>Attendance overview</h1><p>Review check-ins, current attendance, and actual elapsed work time.</p></div>
                <div className="admin-filters">
                    <label htmlFor="attendance-date">Date</label>
                    <input id="attendance-date" type="date" value={date} onChange={(event) => { setDate(event.target.value); setPage(1); }}/>
                    <button className="button button-outline" disabled={loadingData} onClick={() => void loadAttendance()}><Icon name="pulse" size={18}/>{loadingData ? "Refreshing…" : "Refresh"}</button>
                    <button className="button" disabled={exporting} onClick={() => void exportCsv()}><Icon name="download" size={18}/>{exporting ? "Exporting…" : "Export CSV"}</button>
                </div>
            </div>
            {error && <p className="field-error" role="alert">{error}</p>}
            <section className="kpi-grid admin-kpis" aria-label="Attendance summary">
                <article className="kpi-card"><div className="kpi-label"><Icon name="users"/><span>Employees checked in</span></div><strong>{summary.employees}</strong><p>Unique employees with a record</p></article>
                <article className="kpi-card"><div className="kpi-label"><Icon name="pulse"/><span>Check-ins</span></div><strong>{summary.totalCheckIns}</strong><p>Attendance sessions on this date</p></article>
                <article className="kpi-card"><div className="kpi-label"><Icon name="clock"/><span>Currently working</span></div><strong>{summary.currentlyCheckedIn}</strong><p>Sessions not yet checked out</p></article>
                <article className="kpi-card"><div className="kpi-label"><Icon name="chart"/><span>Total elapsed time</span></div><strong>{formatDuration(summary.totalSeconds)}</strong><p>Based on check-in and check-out timestamps</p></article>
            </section>
            <section className="data-card admin-attendance-table">
                <div className="card-heading"><div><p className="section-label">{date}</p><h2>Attendance records</h2></div><span className="subtle-label">{data?.total ?? 0} records</span></div>
                {loadingData && !data ? <p role="status">Loading attendance…</p> : data?.records.length ? <div className="table-scroll">
                    <table className="data-table">
                        <thead><tr><th>Employee</th><th>Workspace</th><th>Check-in</th><th>Check-out</th><th>Duration</th><th>Status</th></tr></thead>
                        <tbody>{data.records.map((record) => <tr key={record.id}>
                            <td><strong>{record.employee}</strong><br/><small>{record.email}</small></td>
                            <td>{record.organization}</td>
                            <td>{formatTime(record.checkedInAt)}</td>
                            <td>{formatTime(record.checkedOutAt)}</td>
                            <td>{formatDuration(record.durationSeconds)}</td>
                            <td><span className={`attendance-status ${record.checkedOutAt ? "complete" : "open"}`}>{record.checkedOutAt ? "Complete" : "Checked in"}</span></td>
                        </tr>)}</tbody>
                    </table>
                </div> : <p>No attendance records for this date.</p>}
                {data?.totalPages > 1 && <div className="admin-pagination"><button className="button button-outline button-small" disabled={page <= 1 || loadingData} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {page} of {data.totalPages}</span><button className="button button-outline button-small" disabled={page >= data.totalPages || loadingData} onClick={() => setPage((value) => value + 1)}>Next</button></div>}
            </section>
            <p className="admin-footnote"><Icon name="shield" size={18}/>Attendance is based only on employee check-in/out actions. Workwell does not record screens, key values, or typed text.</p>
        </section>
    </main>;
}
