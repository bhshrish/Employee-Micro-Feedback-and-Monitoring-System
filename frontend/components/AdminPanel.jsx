"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
    assignOperationsTeam,
    archiveOperationsTeam,
    createOperationsTeam,
    exportOperationsAttendance,
    getOperationsActivity,
    getOperationsAdmin,
    getOperationsAttendance,
    getOperationsBusinesses,
    getOperationsOverview,
    getOperationsTeams,
    getOperationsUsers,
    setOperationsBusinessActive,
    setOperationsUserActive,
    signInOperationsAdmin,
    signOutOperationsAdmin,
} from "@/lib/api";
import { FieldError } from "./UI";
import { Icon } from "./Icon";
import { Logo } from "./Logo";

const sections = [
    ["overview", "Overview"],
    ["businesses", "Businesses"],
    ["users", "Users"],
    ["teams", "Teams"],
    ["activity", "Activity"],
    ["attendance", "Attendance"],
];

function localDateValue() {
    return new Date().toISOString().slice(0, 10);
}
function formatTime(value) {
    return value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
}
function formatDuration(seconds = 0) {
    const total = Math.max(0, Math.floor(seconds));
    return `${Math.floor(total / 3600)}h ${Math.floor((total % 3600) / 60)}m`;
}

export function AdminPanel() {
    const [authorized, setAuthorized] = useState(false);
    const [checking, setChecking] = useState(true);
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [section, setSection] = useState("overview");
    const [date, setDate] = useState(localDateValue);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [data, setData] = useState(null);
    const [teamName, setTeamName] = useState("");
    const [businessId, setBusinessId] = useState("");
    const [exporting, setExporting] = useState(false);

    const loadSection = useCallback(async () => {
        setError("");
        try {
            if (section === "overview")
                setData(await getOperationsOverview());
            else if (section === "businesses")
                setData(await getOperationsBusinesses(page, search));
            else if (section === "users") {
                const [users, teams] = await Promise.all([getOperationsUsers(page, search), getOperationsTeams()]);
                setData({ ...users, teams: teams.teams });
            }
            else if (section === "teams") {
                const [teams, businesses] = await Promise.all([getOperationsTeams(), getOperationsBusinesses(1)]);
                setData({ teams: teams.teams, businesses: businesses.businesses });
                setBusinessId((value) => value || businesses.businesses[0]?._id || "");
            }
            else if (section === "activity")
                setData(await getOperationsActivity(date));
            else if (section === "attendance")
                setData(await getOperationsAttendance(date, page));
        }
        catch (cause) {
            if (cause?.status === 401)
                setAuthorized(false);
            setError(cause instanceof Error ? cause.message : "Could not load operations data.");
        }
    }, [date, page, search, section]);

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
            void loadSection();
    }, [authorized, loadSection]);

    const signIn = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        try {
            await signInOperationsAdmin("admin", "admin@gmail.com", password);
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

    const toggleBusiness = async (business) => {
        try {
            await setOperationsBusinessActive(business._id, !business.isActive);
            await loadSection();
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not update business.");
        }
    };

    const toggleUser = async (user) => {
        try {
            await setOperationsUserActive(user._id, !user.isActive);
            await loadSection();
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not update user.");
        }
    };

    const assignTeam = async (user, teamId) => {
        try {
            await assignOperationsTeam(user._id, teamId || null);
            await loadSection();
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not update team assignment.");
        }
    };

    const addTeam = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            await createOperationsTeam(businessId, teamName);
            setTeamName("");
            await loadSection();
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not create team.");
        }
        finally {
            setLoading(false);
        }
    };

    const removeTeam = async (team) => {
        try {
            await archiveOperationsTeam(team._id);
            await loadSection();
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not archive team.");
        }
    };

    const downloadCsv = async () => {
        setExporting(true);
        try {
            const blob = await exportOperationsAttendance(date);
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = `welltrack-attendance-${date}.csv`;
            anchor.click();
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
                <Logo/><p className="section-label">Platform operations</p><h1>Admin sign in</h1>
                <p>Use the single configured WellTrack platform administrator account.</p>
                <form onSubmit={signIn}>
                    <label>Username<input value="admin" readOnly autoComplete="username"/></label>
                    <label>Work email<input type="email" value="admin@gmail.com" readOnly autoComplete="email"/></label>
                    <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required/></label>
                    {error && <FieldError>{error}</FieldError>}
                    <button className="button button-full" disabled={loading}>{loading ? "Signing in…" : "Sign in as admin"}</button>
                </form>
                <Link href="/login">Return to employee or business sign in</Link>
            </div>
        </main>;
    }

    const overview = data?.overview;
    return <main className="admin-page">
        <header className="admin-header"><Logo/><div><span>Platform admin · admin</span><button className="button button-outline button-small" disabled={loading} onClick={() => void signOut()}>Sign out</button></div></header>
        <div className="admin-layout">
            <aside className="admin-sidebar" aria-label="Admin management">
                <p className="section-label">Manage WellTrack</p>
                {sections.map(([key, label]) => <button key={key} className={section === key ? "active" : ""} onClick={() => { setSection(key); setPage(1); setSearch(""); }}><Icon name={key === "overview" ? "chart" : key === "attendance" ? "calendar" : key === "activity" ? "pulse" : key === "teams" ? "users" : "users"}/>{label}</button>)}
            </aside>
            <section className="admin-content">
                <div className="app-page-heading admin-heading">
                    <div><p className="section-label">Platform operations</p><h1>{sections.find(([key]) => key === section)?.[1]}</h1><p>Manage businesses, user access, teams, attendance, and privacy-safe activity summaries.</p></div>
                    {(section === "activity" || section === "attendance") && <label className="admin-date">Date<input type="date" value={date} onChange={(event) => { setDate(event.target.value); setPage(1); }}/></label>}
                    {(section === "users" || section === "businesses") && <label className="admin-search">Search<input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder={section === "users" ? "Name or email" : "Business name"}/></label>}
                </div>
                {error && <p className="field-error" role="alert">{error}</p>}
                {!data ? <p role="status">Loading management data…</p> : <>
                    {section === "overview" && overview && <section className="kpi-grid admin-kpis">
                        <article className="kpi-card"><div className="kpi-label"><Icon name="users"/><span>Businesses</span></div><strong>{overview.businesses}</strong><p>{overview.activeBusinesses} active</p></article>
                        <article className="kpi-card"><div className="kpi-label"><Icon name="users"/><span>Users</span></div><strong>{overview.users}</strong><p>{overview.activeUsers} active accounts</p></article>
                        <article className="kpi-card"><div className="kpi-label"><Icon name="calendar"/><span>Checked in</span></div><strong>{overview.openAttendance}</strong><p>Currently open attendance records</p></article>
                        <article className="kpi-card"><div className="kpi-label"><Icon name="pulse"/><span>Activity today</span></div><strong>{overview.todayActivity.sessions}</strong><p>{formatDuration(overview.todayActivity.activeSeconds)} active · {formatDuration(overview.todayActivity.idleSeconds)} idle</p></article>
                    </section>}
                    {section === "businesses" && <section className="data-card admin-attendance-table">
                        <div className="table-scroll"><table className="data-table"><thead><tr><th>Business</th><th>Owner</th><th>Users</th><th>Teams</th><th>Created</th><th>Status</th><th>Action</th></tr></thead>
                            <tbody>{data.businesses.map((business) => <tr key={business._id}><td>{business.name}</td><td>{business.owner?.name}<br/><small>{business.owner?.email}</small></td><td>{business.users}</td><td>{business.teams}</td><td>{formatTime(business.createdAt)}</td><td>{business.isActive ? "Active" : "Suspended"}</td><td><button className="button button-outline button-small" onClick={() => void toggleBusiness(business)}>{business.isActive ? "Suspend" : "Reactivate"}</button></td></tr>)}</tbody>
                        </table></div>
                    </section>}
                    {section === "users" && <section className="data-card admin-attendance-table">
                        <div className="table-scroll"><table className="data-table"><thead><tr><th>User</th><th>Business</th><th>Role</th><th>Status</th><th>Team</th><th>Action</th></tr></thead>
                            <tbody>{data.users.map((user) => {
                                const teams = data.teams.filter((team) => team.organizationId?._id === user.organizationId?._id);
                                return <tr key={user._id}><td>{user.name}<br/><small>{user.email}</small></td><td>{user.organizationId?.name}</td><td>{user.role}</td><td>{user.isActive ? "Active" : "Suspended"}</td><td><select value={user.teamId?._id ?? ""} onChange={(event) => void assignTeam(user, event.target.value)}><option value="">Unassigned</option>{teams.map((team) => <option key={team._id} value={team._id}>{team.name}</option>)}</select></td><td><button className="button button-outline button-small" onClick={() => void toggleUser(user)}>{user.isActive ? "Disable" : "Enable"}</button></td></tr>;
                            })}</tbody>
                        </table></div>
                    </section>}
                    {section === "teams" && <section className="data-card admin-attendance-table">
                        <form className="admin-team-create" onSubmit={addTeam}><label>Business<select value={businessId} required onChange={(event) => setBusinessId(event.target.value)}>{data.businesses.filter((business) => business.isActive).map((business) => <option key={business._id} value={business._id}>{business.name}</option>)}</select></label><label>New team<input value={teamName} onChange={(event) => setTeamName(event.target.value)} minLength={2} maxLength={80} required/></label><button className="button" disabled={loading}>Create team</button></form>
                        <div className="table-scroll"><table className="data-table"><thead><tr><th>Team</th><th>Business</th><th>Created</th><th></th></tr></thead><tbody>{data.teams.map((team) => <tr key={team._id}><td>{team.name}</td><td>{team.organizationId?.name}</td><td>{formatTime(team.createdAt)}</td><td><button className="button button-outline button-small" onClick={() => void removeTeam(team)}>Archive</button></td></tr>)}</tbody></table></div>
                    </section>}
                    {section === "activity" && <section className="data-card admin-attendance-table"><p className="subtle-label">Aggregated by business; individual task labels and employee activity records are not exposed.</p><div className="table-scroll"><table className="data-table"><thead><tr><th>Business</th><th>Employees active</th><th>Sessions</th><th>Active time</th><th>Idle time</th></tr></thead><tbody>{data.businesses.map((row) => <tr key={row._id}><td>{row.business}</td><td>{row.employees}</td><td>{row.sessions}</td><td>{formatDuration(row.activeSeconds)}</td><td>{formatDuration(row.idleSeconds)}</td></tr>)}</tbody></table></div></section>}
                    {section === "attendance" && <section className="data-card admin-attendance-table">
                        <div className="card-heading"><div><p className="section-label">{data.date} · UTC</p><h2>Attendance overview</h2></div><button className="button" disabled={exporting} onClick={() => void downloadCsv()}>{exporting ? "Exporting…" : "Export CSV"}</button></div>
                        <section className="kpi-grid admin-kpis"><article className="kpi-card"><span>Employees</span><strong>{data.summary.employees}</strong></article><article className="kpi-card"><span>Check-ins</span><strong>{data.summary.totalCheckIns}</strong></article><article className="kpi-card"><span>Checked in now</span><strong>{data.summary.currentlyCheckedIn}</strong></article><article className="kpi-card"><span>Elapsed time</span><strong>{formatDuration(data.summary.totalSeconds)}</strong></article></section>
                        <div className="table-scroll"><table className="data-table"><thead><tr><th>Employee</th><th>Business</th><th>Check-in</th><th>Check-out</th><th>Duration</th><th>Status</th></tr></thead><tbody>{data.records.map((record) => <tr key={record.id}><td>{record.employee}<br/><small>{record.email}</small></td><td>{record.business}</td><td>{formatTime(record.checkedInAt)}</td><td>{formatTime(record.checkedOutAt)}</td><td>{formatDuration(record.durationSeconds)}</td><td>{record.checkedOutAt ? "Complete" : "Checked in"}</td></tr>)}</tbody></table></div>
                        {data.totalPages > 1 && <div className="admin-pagination"><button className="button button-outline button-small" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {page} of {data.totalPages}</span><button className="button button-outline button-small" disabled={page >= data.totalPages} onClick={() => setPage((value) => value + 1)}>Next</button></div>}
                    </section>}
                </>}
            </section>
        </div>
    </main>;
}